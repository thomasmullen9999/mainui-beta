"use client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgreementContent } from "@/app/p/components/agreement_content";
import { Loader2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { calculateDayDistances, getLondonTime } from "@/utils/main";

// Types
interface Agreement {
  title?: string;
  author?: string;
  date?: string;
  content: ContentBlock[];
}

type ContentBlock = ParagraphBlock | HeadingBlock | BulletBlock;

interface ParagraphBlock {
  type: "paragraph";
  elements: ParagraphElement[];
}

interface BulletBlock {
  type: "bullet";
  level: number;
  text: string;
}

type ParagraphElement = TextElement | LinkElement | NewLineElement;

interface TextElement {
  type: "text";
  text: string;
}

interface LinkElement {
  type: "link";
  href: string;
  text: string;
}

interface NewLineElement {
  type: "newline";
  text: string;
}

interface HeadingBlock {
  type: "heading";
  level: number;
  text: string;
}

type PropsArray = {
  formData: any;
  slug: string;
  uuid?: string;
  agreements: any;
  leadbyteId: any;
};

// Constants
const DAY_DISTANCES = {
  asda: 2002,
  morrisons: 161,
  sainsburys: 161,
  next: 161,
  justeat: 70,
  bolt: 70,
  coop: 161,
} as const;

const BILLABLE_CAMPAIGNS = [
  "sainsburys",
  "morrisons",
  "next",
  "coop",
  "asda",
  "justeat",
];

export function SainsMCAgreement({
  formData,
  uuid,
  slug,
  agreements,
  leadbyteId,
}: PropsArray) {
  // State
  const [state, setState] = useState({
    isNurture: false,
    isFinished: false,
    isSubmitting: false,
    leadUUID: "",
    isLoading: true,
    isError: false,
    isOpen: false,
    stillWorking: true,
    qualified: false,
    dateConfirmationQuestion: false,
    stillWorkQuestion: false,
    dbaAppears: false,
    showMessage: false,
    domain: "",
  });

  const [leadData, setLeadData] = useState<{ [key: string]: any }>({});

  const apiKey = process.env.LEADBYTE_API_KEY;

  // Computed values
  const isMCDomain = state.domain?.includes("maddisonclarke");
  const isDeliveryService = ["justeat", "bolt"].includes(slug);
  const hasLeadData = Object.keys(leadData).length > 0;

  // Initialize domain
  useEffect(() => {
    if (typeof window !== "undefined") {
      setState((prev) => ({ ...prev, domain: window.location.hostname }));
    }
  }, []);

  // Utility functions
  const formatCampaignName = (campaignName: string) => {
    const formatted = campaignName.toLowerCase();
    if (formatted === "justeat") return "JustEat";
    if (formatted === "coop") return "Co-op";
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const formatDate = (dateValue: string) => {
    const [year, month, day] = dateValue.split("-");
    return `${day}/${month}/${year}`;
  };

  const getDateField = () =>
    isDeliveryService && slug === "bolt" ? "LastDelivery" : "dateleft";

  const getNewDateField = () =>
    isDeliveryService && slug === "bolt" ? "new_LastDelivery" : "new_dateleft";

  // API functions
  const fetchLeadFromId = async (uuid: string) => {
    try {
      const response = await fetch(
        `/api/leadtransfer?lead_id=${uuid}&lead_campaign=${slug}`
      );
      if (!response.ok) {
        setState((prev) => ({ ...prev, isError: true }));
        throw new Error("Failed to fetch data");
      }
      return await response.json();
    } catch (error) {
      setState((prev) => ({ ...prev, isError: true }));
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  const sendTracking = (leadFormData: any) => {
    try {
      const postObject = {
        event: "leadsHook_lead_submit",
        form_email: leadFormData?.email?.value || "",
        form_phone_number: leadFormData?.telphone?.value || "",
        form_first_name: leadFormData?.firstname?.value || "",
        form_last_name: leadFormData?.lastname?.value || "",
        form_date_of_birth: leadFormData?.dob?.value || "",
        form_countryCode: leadFormData?.server_country?.value || "",
        form_city: leadFormData?.server_city?.value || "",
        form_zip: leadFormData?.server_zip_code?.value || "",
      };

      const dataLayer =
        (window as any).dataLayer || ((window as any).dataLayer = []);
      dataLayer.push({
        event: "leadsHook_lead_submit",
        postMessageData: JSON.stringify(postObject),
      });

      if (!uuid) {
        dataLayer.push({
          event: `et_${slug}`,
          postMessageData: JSON.stringify(postObject),
        });
      }

      // Bing tracking for existing leads
      if (uuid) {
        (window as any).uetq = (window as any).uetq || [];
        (window as any).uetq.push("set", {
          pid: {
            em: leadFormData?.email?.value || "",
            ph: leadFormData?.telphone?.value || "",
          },
        });
        (window as any).uetq.push("event", "submit_lead_form", {});
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleThankYouRedirect = (slug: string) => {
    const email = formData["email"].value;
    const baseUrl = isMCDomain
      ? "https://www.maddisonclarke.co.uk"
      : "https://www.fairpayforall.co.uk";

    let page = "";
    if (slug === "coop") {
      page = isMCDomain ? `thank-you-${slug}` : "thank-you-co-op";
    } else if (slug === "justeat") {
      page = isMCDomain ? `thank-you-${slug}` : "thank-you-just-eat";
    } else {
      page = `thank-you-${slug}`;
    }

    window.location.href = `${baseUrl}/${page}?email=${email}`;
  };

  // Form handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    label: string
  ) => {
    const value = e.target.value;
    setLeadData((prev) => ({
      ...prev,
      [label]: { ...prev[label], value },
    }));
  };

  const handlePureTextInputChange = (txt: string, label: string) => {
    setLeadData((prev) => ({
      ...prev,
      [label]: { ...prev[label], value: txt },
    }));
  };

  const updateStillWorkAtStore = (stillWork: string) => {
    handlePureTextInputChange(stillWork, "new_still_work_at_store");
  };

  const handleDateLeftButtonClick = (newDate: string) => {
    const dateField = getDateField();
    const newDateField = getNewDateField();

    // Update the appropriate date field
    if (newDate !== leadData[dateField]?.value) {
      setLeadData((prev) => ({
        ...prev,
        [newDateField]: { ...prev[newDateField], value: newDate },
      }));
    }

    const dayDifference = calculateDayDistances(newDate);
    const validLeftDate =
      dayDifference <= DAY_DISTANCES[slug as keyof typeof DAY_DISTANCES];

    if (validLeftDate) {
      setState((prev) => ({ ...prev, qualified: true, dbaAppears: true }));
    } else {
      const sorryPage = slug === "coop" ? "sorry-co-op" : `sorry-${slug}`;
      window.location.href = `https://fairpayforall.co.uk/${sorryPage}`;
    }
  };

  // API calls
  const leadTransfer = async (formData: any) => {
    setState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const response = await fetch(`/api/leadtransfer`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });

      const data = await response.json();
      if (data.msg) {
        setState((prev) => ({
          ...prev,
          leadUUID: data.lead_id,
          isNurture: true,
          isSubmitting: false,
        }));
      }
    } catch (e) {
      setState((prev) => ({ ...prev, isSubmitting: false }));
      toast.error("Internet connection Error, please retry later.");
    }
  };

  const updateLead = async (
    formData: any,
    uuid: string,
    shouldTrack: boolean = false
  ) => {
    setState((prev) => ({ ...prev, isSubmitting: true }));
    formData.lead_sold_timestamp = {
      label: "Lead Sold Timestamp",
      value: getLondonTime(),
    };

    formData.lb_accepted_dba = {
      label: "Accepted DBA",
      value: "Yes",
    };

    console.log(formData, "new place check");
    try {
      const response = await fetch(`/api/leadtransfer`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: uuid, formData }),
      });

      const data = await response.json();
      if (!response.ok) {
        setState((prev) => ({ ...prev, isError: true }));
        throw new Error(`Request failed with status ${response.status}`);
      }

      if (data.msg) {
        setState((prev) => ({ ...prev, isFinished: true }));
        // Only send tracking if requested (for billable leads)
        if (shouldTrack) {
          sendTracking(formData);
        }

        // Inside updateLead function
        try {
          const leadByteResponse = await fetch("/api/updateleadbyte", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              leadbyteId,
              leadData: {
                accepted_dba: formData.lb_accepted_dba?.value ?? "Yes",
                lh_timestamp: formData.lead_sold_timestamp?.value || "",
              },
              zapierData: {
                first_name: formData.firstname?.value,
                last_name: formData.lastname?.value,
                email: formData.email?.value,
                gender: formData.gender?.value,
                employee_number: formData.employee_number?.value,
                accepted_dba: formData.lb_accepted_dba?.value ?? "Yes",
                lh_timestamp: formData.lead_sold_timestamp?.value || "",
              },
            }),
          });

          const leadByteResult = await leadByteResponse.json();
          console.log("LeadByte API result:", leadByteResult);
        } catch (apiError) {
          console.error("Error calling LeadByte API:", apiError);
        }

        // 🔥 New API call to update lead status to "sold"
        /*         try {
          const soldResponse = await fetch(`/api/updatetosold`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lead_id: uuid }),
          });

          if (!soldResponse.ok) {
            throw new Error(`UpdateToSold failed: ${soldResponse.status}`);
          }

          const soldData = await soldResponse.json();
          console.log("Lead status updated to sold:", soldData);
        } catch (soldError) {
          console.error("Failed to update lead to sold:", soldError);
          toast.error("Could not mark lead as sold. Please retry later.");
        } */
      }
    } catch (e) {
      setState((prev) => ({ ...prev, isSubmitting: false }));
      toast.error("Internet connection Error, please retry later.");
      console.log(e);
    }
  };

  // Effects
  useEffect(() => {
    const fetchData = async () => {
      if (uuid) {
        setState((prev) => ({ ...prev, isLoading: true, leadUUID: uuid }));
        try {
          const rtLead = await fetchLeadFromId(uuid);

          if (rtLead.lead_status === "sold") {
            setState((prev) => ({
              ...prev,
              isFinished: true,
              isLoading: false,
            }));
            if (rtLead.lead_campaign === "justeat") {
              const redirectUrl = isMCDomain
                ? "https://www.maddisonclarke.co.uk/thank-you-justeat"
                : "https://www.fairpayforall.co.uk/thank-you-just-eat";
              window.location.href = redirectUrl;
            }
            return;
          }

          // Initialize new date fields
          rtLead.formData.new_dateleft = { label: "new dateleft", value: "" };
          rtLead.formData.new_still_work_at_store = {
            label: "new_still_work_at_store",
            value: rtLead.formData.still_work_at_store?.value || "",
          };

          if (slug === "bolt") {
            rtLead.formData.new_LastDelivery = {
              label: "new_LastDelivery",
              value: rtLead.formData.LastDelivery?.value || "",
            };
          }

          setLeadData(rtLead.formData);
          setState((prev) => ({
            ...prev,
            isNurture: true,
            isLoading: false, // Critical: Set loading to false
            stillWorking: rtLead.formData.still_work_at_store?.value === "yes",
          }));

          sendTracking(rtLead.formData);
        } catch (error) {
          setState((prev) => ({ ...prev, isError: true, isLoading: false }));
          console.error("Error fetching lead:", error);
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
        sendTracking(formData);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (state.isFinished) {
      setState((prev) => ({ ...prev, showMessage: true }));
      setTimeout(() => {
        handleThankYouRedirect(slug);
      }, 1000);
    }
  }, [state.isFinished, slug]);
  const dateField = getDateField();
  const newDateField = getNewDateField();
  const hasDateValue = leadData[dateField]?.value !== "";
  const campaignName = formatCampaignName(leadData["campaign"]?.value || "");

  useEffect(() => {
    if (!hasDateValue) {
      setState((prev) => ({
        ...prev,
        stillWorkQuestion: true,
      }));
    }
  }, [hasDateValue]);

  // Render helpers
  const renderQualificationQuestions = () => {
    return (
      <div>
        <h1 className="mb-8 mt-4 text-center text-3xl font-bold">
          Just one more thing, {leadData["firstname"]?.value}...
        </h1>
        <p className="text-xl font-bold">
          Before we add you to the group claim we just need to double check a
          few details...
        </p>

        {hasDateValue && (
          <>
            <p className="text-l mb-3 mt-6">
              You told us that you last{" "}
              {isDeliveryService ? "delivered" : "worked"} for {campaignName} on{" "}
              <strong>{formatDate(leadData[dateField].value)}</strong>, is that
              still correct?
            </p>
            <Button
              className="mr-3"
              onClick={() =>
                handleDateLeftButtonClick(leadData[dateField].value)
              }
            >
              Yes
            </Button>
            <Button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  stillWorkQuestion: true,
                }))
              }
            >
              No
            </Button>
          </>
        )}
        {state.stillWorkQuestion && (
          <>
            <p className="text-l mb-3 mt-6">
              Do you still work for {campaignName}?
            </p>
            <Button
              className="mr-3"
              onClick={() => {
                setState((prev) => ({
                  ...prev,
                  qualified: true,
                  dbaAppears: true,
                }));
                updateStillWorkAtStore("Yes");
              }}
            >
              Yes
            </Button>
            <Button
              onClick={() => {
                setState((prev) => ({
                  ...prev,
                  dateConfirmationQuestion: true,
                }));
                updateStillWorkAtStore("No");
              }}
            >
              No
            </Button>
          </>
        )}

        {state.dateConfirmationQuestion && (
          <div>
            <p className="text-l mb-3 mt-8">
              No problem! When did you{" "}
              {isDeliveryService ? "last deliver" : "leave"}?
            </p>
            <input
              type="date"
              className="mb-3 flex h-10 cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={leadData[newDateField]?.value || ""}
              onChange={(e) => handleInputChange(e, newDateField)}
            />
            <Button
              className="mb-7"
              onClick={() => {
                handleDateLeftButtonClick(leadData[newDateField].value);
              }}
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderQualifiedView = () => (
    <div>
      <h1 className="mb-8 mt-8 text-center text-3xl font-bold">
        Good News! You Qualify to Join the Claim
      </h1>

      <section className="mb-8">
        <p className="mb-4">
          To officially add yourself to the group action and secure any
          compensation you may be owed, all you need to do is agree to the T&Cs
          of the no-win-no-fee document by pressing "I Accept" at the bottom of
          the page.
        </p>
        <p className="mb-4">
          If all of your information is correct, Leigh Day solicitors are
          willing to represent you in your equal pay claim against{" "}
          {formatCampaignName(leadData["campaign"]?.value || "")}
          on a no-win no-fee basis, subject to regulatory checks.
        </p>
        <p>
          If you want Leigh Day to bring a claim for you, you need to click the
          accept button at the bottom of this page. This confirms you have read
          and agree to the client care and costs letter, form of authority, and
          the Damages-Based Agreement ('DBA') below. You also agree that this
          agreement is of your own free will.
        </p>
      </section>

      {renderAgreementSection()}

      <div className="flex justify-center">
        <Button
          disabled={state.isSubmitting}
          className="inline-flex h-12 w-[300px] items-center justify-center gap-2 rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm"
          onClick={() => updateLead(leadData, uuid!, false)}
        >
          {state.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting, Please Wait...
            </>
          ) : (
            agreements.p2.author
          )}
        </Button>
      </div>
    </div>
  );

  const renderAgreementSection = () => (
    <section className="mb-8">
      <div className="text-gray-700">
        <Collapsible
          open={state.isOpen}
          onOpenChange={(isOpen) => setState((prev) => ({ ...prev, isOpen }))}
        >
          <div className="mt-5 flex items-center justify-between space-x-4">
            <CollapsibleTrigger asChild>
              <Button>
                {state.isOpen ? "Show Less" : "Read More"}
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2">
            <div className="px-0 pb-3">
              <div className="my-5 p-0">
                <AgreementContent content={agreements.p3.content} />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );

  const renderStandardFlow = () => (
    <div className="mx-auto">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Final Step to Join The Claim
      </h1>

      <section className="mb-8">
        <AgreementContent content={agreements.p2.content} />
      </section>

      {renderAgreementSection()}

      <div className="flex justify-center">
        <Button
          disabled={state.isSubmitting}
          className="inline-flex h-12 w-[300px] items-center justify-center gap-2 rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm"
          onClick={() => updateLead(formData, state.leadUUID, true)}
        >
          {state.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting, Please Wait...
            </>
          ) : (
            agreements.p2.author
          )}
        </Button>
      </div>
    </div>
  );

  const renderPrivacyPolicyFlow = () => (
    <>
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <ScrollArea className="h-auto rounded-md py-8">
        <AgreementContent content={agreements.p1.content} />
      </ScrollArea>
      <div className="flex justify-center">
        <Button
          disabled={state.isSubmitting}
          className="inline-flex h-12 w-[300px] items-center justify-center gap-2 rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm"
          onClick={() => leadTransfer(formData)}
        >
          {state.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting, Please Wait...
            </>
          ) : (
            "Yes"
          )}
        </Button>
      </div>
    </>
  );

  // Main render logic
  if (state.isFinished) {
    return (
      <div className="flex flex-col items-center">
        {state.showMessage && <h1>You will shortly be redirected...</h1>}
      </div>
    );
  }

  if (state.isError) {
    return (
      <>
        Reference Number: {state.leadUUID}
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Error
          <Button as-child>
            <a href="https://www.fairpayforall.co.uk">Back to Homepage</a>
          </Button>
        </h1>
      </>
    );
  }

  if (state.isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 lg:gap-8 lg:p-8">
        <div className="flex h-64 w-full flex-1 items-center justify-center rounded-lg">
          <Loader2 className="my-28 h-16 w-16 animate-spin text-primary/60" />
        </div>
      </div>
    );
  }

  // Nurture flow - existing leads
  if (state.isNurture && hasLeadData) {
    if (!state.qualified) {
      return renderQualificationQuestions();
    }
    if (state.qualified && state.dbaAppears) {
      return renderQualifiedView();
    }
    return renderStandardFlow();
  }

  // New leads flow
  if (state.isNurture) {
    return renderStandardFlow();
  }

  // Initial flow based on campaign
  if (BILLABLE_CAMPAIGNS.includes(slug)) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto">
          <h1 className="mb-8 text-center text-3xl font-bold">
            Final Step to Join The Claim
          </h1>
          <section className="mb-8 text-left">
            <AgreementContent content={agreements.p2.content} />
          </section>
          <section className="mb-8 text-left">
            {renderAgreementSection()}
          </section>
        </div>
        <div className="flex justify-center">
          <Button
            disabled={state.isSubmitting}
            className="inline-flex h-12 w-[300px] items-center justify-center gap-2 rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm"
            onClick={() => updateLead(formData, formData["uuid"].value, true)}
          >
            {state.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting, Please Wait...
              </>
            ) : (
              agreements.p2.author
            )}
          </Button>
        </div>
      </div>
    );
  }

  return renderPrivacyPolicyFlow();
}
