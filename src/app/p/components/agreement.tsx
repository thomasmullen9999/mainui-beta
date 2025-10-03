"use client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgreementContent } from "@/app/p/components/agreement_content";
import { Loader2 } from "lucide-react";
import Markdown from "./markdownagreement";

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

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { redirect } from "next/navigation";
import { calculateDayDistances } from "@/utils/main";
type PropsArray = {
  formData: any;
  slug: string;
  uuid?: string;
  agreements: any;
};

export function MCAgreement({ formData, uuid, slug, agreements }: PropsArray) {
  const [isNurture, setIsNurture] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [IsSubmitting, setIsSubmitting] = useState(false);
  const [leadUUID, setLeadUUID] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [leadData, setLeadData] = useState<{ [key: string]: any }>({});
  const [stillWorking, setStillWorking] = useState(true);
  const [qualified, setQualified] = useState(false);
  const [dateConfirmationQuestion, setDateConfirmationQuestion] =
    useState(false);
  const [stillWorkQuestion, setStillWorkQuestion] = useState(false);
  const [lastWorkedQuestion, setLastWorkedQuestion] = useState(true);
  const [greenButtons, setGreenButtons] = useState({
    button1: "blue",
    button2: "blue",
    button3: "blue",
  });
  const [dbaAppears, setDbaAppears] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const [domain, setDomain] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(window.location.hostname);
    }
  }, []);
  const isMCDomain = domain?.includes("maddisonclarke") ? true : false;

  async function fetchleadfromid(uuid: string) {
    try {
      const response = await fetch(
        `/api/leadtransfer?lead_id=${uuid}&lead_campaign=${slug}`
      ); // Replace <your-uuid> with the UUID you want to fetch
      if (!response.ok) {
        setIsError(true);
        throw new Error("Failed to fetch data");
      }
      const jsonData = await response.json();
      //setData(jsonData);
      //setError(null);
      return jsonData;
    } catch (error) {
      setIsError(true);
      console.error("Error fetching data:", error);
      //setError("Error fetching data");
      //setData(null);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (uuid) {
        //billable uri
        setIsLoading(true);

        setLeadUUID(uuid);
        try {
          const rt_lead = await fetchleadfromid(uuid);
          //console.log(rt_lead);
          rt_lead.formData.new_dateleft = { label: "new dateleft", value: "" };
          //setLeadData(rt_lead.formData);
          if (rt_lead.lead_status == "sold") {
            setIsFinished(true);
            if (typeof window !== "undefined") {
              switch (rt_lead.lead_campaign) {
                case "justeat":
                  if (isMCDomain === true) {
                    window.location.href =
                      "https://www.maddisonclarke.co.uk/thank-you-justeat";
                    break;
                  } else {
                    window.location.href =
                      "https://www.fairpayforall.co.uk/thank-you-just-eat";
                    break;
                  }
              }
            }
            setIsLoading(false);
          }
          setIsNurture(true);
        } catch (error) {
          console.error("Error fetching lead:", error);
        }
      } else {
        // not billable uri
        setIsLoading(false);
      }

      if (uuid) {
        console.log("uuid1");
        const rt_lead = await fetchleadfromid(uuid);
        try {
          const postObject = JSON.stringify({
            event: "leadsHook_lead_submit",
            form_email: `${rt_lead.formData?.email.value || ""}`,
            form_phone_number: `${rt_lead.formData?.telphone.value || ""}`,
            form_first_name: `${rt_lead.formData?.firstname.value || ""}`,
            form_last_name: `${rt_lead.formData?.lastname.value || ""}`,
            form_date_of_birth: `${rt_lead.formData?.dob.value || ""}`,
            form_countryCode: `${rt_lead.formData?.server_country.value || ""}`,
            form_city: `${rt_lead.formData?.server_city.value || ""}`,
            form_zip: `${rt_lead.formData?.server_zip_code.value || ""}`,
          });
          console.log("start sending");
          var dataLayer = window.dataLayer || (window.dataLayer = []);
          dataLayer.push({
            event: "leadsHook_lead_submit",
            postMessageData: postObject,
          });
          //window.postMessage(postObject, "*"); // GTM tracking
          console.log("end sending");
          console.log("start bing");
          window.uetq = window.uetq || [];
          window.uetq.push("set", {
            pid: {
              em: `${rt_lead.formData?.email.value || ""}`,
              ph: `${rt_lead.formData?.telphone.value || ""}`,
            },
          });
          window.uetq.push("event", "submit_lead_form", {});
          console.log("end bing");
        } catch (e) {
          if (window.console) {
            window.console.log(e);
          }
        }
      } else {
        console.log("no uuid");
        try {
          const postObject = JSON.stringify({
            event: "leadsHook_lead_submit",
            form_email: `${formData?.email.value || ""}`,
            form_phone_number: `${formData?.telphone.value || ""}`,
            form_first_name: `${formData?.firstname.value || ""}`,
            form_last_name: `${formData?.lastname.value || ""}`,
            form_date_of_birth: `${formData?.dob.value || ""}`,
            form_countryCode: `${formData?.server_country.value || ""}`,
            form_city: `${formData?.server_city.value || ""}`,
            form_zip: `${formData?.server_zip_code.value || ""}`,
          });
          console.log("start sending", {
            event: "leadsHook_lead_submit",
            postMessageData: postObject,
          });
          var dataLayer = window.dataLayer || (window.dataLayer = []);
          dataLayer.push({
            event: "leadsHook_lead_submit",
            postMessageData: postObject,
          });
          dataLayer.push({
            event: `et_${slug}`,
            postMessageData: postObject,
          });
          //window.postMessage(postObject, "*"); // GTM tracking
          console.log("end sending");
        } catch (e) {
          if (window.console) {
            window.console.log(e);
          }
        }
      }
    };

    fetchData();
  }, []);
  const openPdfInNewWindow = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  };
  async function leadtransfer(formData: any) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/leadtransfer`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData: formData }),
      });

      const data = await response.json();

      if (data.msg) {
        setLeadUUID(data.lead_id);
        setIsNurture(true);
        setIsSubmitting(false);
      }
    } catch (e) {
      setIsSubmitting(false);
      toast.error("Internet connection Error, please retry later.");
    }
  }
  async function setTracking(uuid: string) {
    const rt_lead = await fetchleadfromid(uuid);
    try {
      const postObject = JSON.stringify({
        event: "leadsHook_lead_submit",
        form_email: `${rt_lead.formData?.email.value || ""}`,
        form_phone_number: `${rt_lead.formData?.telphone.value || ""}`,
        form_first_name: `${rt_lead.formData?.firstname.value || ""}`,
        form_last_name: `${rt_lead.formData?.lastname.value || ""}`,
        form_date_of_birth: `${rt_lead.formData?.dob.value || ""}`,
        form_countryCode: `${rt_lead.formData?.server_country.value || ""}`,
        form_city: `${rt_lead.formData?.server_city.value || ""}`,
        form_zip: `${rt_lead.formData?.server_zip_code.value || ""}`,
      });
      console.log("start sending");
      var dataLayer = window.dataLayer || (window.dataLayer = []);
      dataLayer.push({
        event: "leadsHook_lead_submit",
        postMessageData: postObject,
      });
      //window.postMessage(postObject, "*"); // GTM tracking
      console.log("end sending");
    } catch (e) {
      if (window.console) {
        window.console.log(e);
      }
    }
  }
  async function leadbillable(formData: any, uuid: string) {
    setIsSubmitting(true);
    // console.log(formData, "formdata leadbillable", uuid, "uuid leadbillable");
    try {
      const response = await fetch(`/api/leadtransfer`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lead_id: uuid, formData: formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw an error with the response status
        setIsError(true);
        throw new Error(`Request failed with status ${response.status}`);
      } else {
        if (data.msg) {
          setIsFinished(true);
          setTracking(uuid);
        }
      }
    } catch (e) {
      setIsSubmitting(false);
      toast.error("Internet connection Error, please retry later.");
      if (window.console) {
        window.console.log(e);
      }
    }
  }
  async function leadbillableSainsburys(formData: any, uuid: string) {
    if (!uuid) {
      throw new Error("UUID is undefined.");
    }

    setIsSubmitting(true);

    // console.log(formData, "formdata leadbillable", uuid, "uuid leadbillable");
    try {
      const response = await fetch(`/api/leadtransfer`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lead_id: uuid, formData: formData }),
      });

      const data = await response.json();
      if (!response.ok) {
        setIsError(true);
        throw new Error(`Request failed with status ${response.status}`);
      } else {
        if (data.msg) {
          setIsFinished(true);
          setTracking(uuid);
        }
      }
    } catch (e) {
      setIsSubmitting(false);
      toast.error("Internet connection Error, please retry later.");
      if (window.console) {
        window.console.log(e);
      }
    }
  }

  const handlePureTextInputChange = (txt: string, label: string) => {
    const value = txt;

    setLeadData((prevLeadData) => ({
      ...prevLeadData,
      [label]: { ...prevLeadData[label], value: value },
    }));
  };

  // Add this function to your component
  const formatCampaignName = (campaignName: string) => {
    // Lowercase the value for easier matching
    let formattedName = campaignName.toLowerCase();

    // Handle specific cases
    if (formattedName === "justeat") {
      return "JustEat";
    } else if (formattedName === "coop") {
      return "Co-op";
    }

    // Default behavior: Capitalize first letter, lowercase the rest
    return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
  };

  useEffect(() => {
    // Your code here will run only once after the component mounts
    if (uuid) {
      fetchleadfromid(uuid).then((data) => {
        setLeadData(data.formData);
      });
    }
  }, []); // Empty array ensures this runs only once

  useEffect(() => {
    // Your code here will run only once after the component mounts
    if (
      !(Object.keys(leadData).length === 0 && leadData.constructor === Object)
    ) {
      if (leadData[`still_work_at_store`].value === "yes") {
        setStillWorking(true);
      } else setStillWorking(false);
    }
  }, []); // Empty array ensures this runs only once

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    label: string
  ) => {
    const value = e.target.value;
    setLeadData((prevFormData) => ({
      ...prevFormData,
      [label]: { ...prevFormData[label], value: value },
    }));
  };

  useEffect(() => {
    if (
      !(Object.keys(leadData).length === 0 && leadData.constructor === Object)
    ) {
      if (
        leadData[`still_work_at_store`] &&
        leadData[`still_work_at_store`].value === "yes"
      ) {
        setStillWorking(true);
      } else {
        setStillWorking(false);
      }
    }
  }, [formData]);

  useEffect(() => {
    if (
      leadData &&
      !(Object.keys(leadData).length === 0 && leadData.constructor === Object)
    ) {
      if (!leadData["new_still_work_at_store"]) {
        leadData["new_still_work_at_store"] = {};
      }
      leadData["new_still_work_at_store"].label = "new_still_work_at_store";
      leadData["new_still_work_at_store"].value =
        leadData["still_work_at_store"].value;
      if (!leadData["new_dateleft"]) {
        leadData["new_dateleft"] = {};
      }
      leadData["new_dateleft"].label = "new_dateleft";
      leadData["new_dateleft"].value = leadData["dateleft"].value;
    }
  }, []);

  const updateStillWorkAtStore = (stillWork: string) => {
    handlePureTextInputChange(stillWork, "new_still_work_at_store");
  };

  const updateDateleft = (dateleft: string) => {
    handlePureTextInputChange(dateleft, "new_dateleft");
  };

  const handleDateLeftButtonClick = (newDate: string) => {
    // add new_dateleft field to leadData if new_dateleft is different to original dateLeft OR same for new_LastDelivery (depending on campaign)
    if (leadData["campaign"].value === "bolt") {
      if (newDate !== leadData["LastDelivery"].value) {
        leadData["new_LastDelivery"].value = newDate;
      }
    } else {
      if (newDate !== leadData["dateleft"].value) {
        leadData["new_dateleft"].value = newDate;
      }
    }

    const dayDistances = {
      asda: 2002,
      morrisons: 161,
      sainsburys: 161,
      next: 161,
      justeat: 70,
      bolt: 70,
      coop: 161,
    };
    const dayDifference = calculateDayDistances(newDate);
    type DayDistanceSlug =
      | "asda"
      | "morrisons"
      | "sainsburys"
      | "next"
      | "justeat"
      | "bolt"
      | "coop";
    const validLeftDate =
      dayDifference <= dayDistances[slug as DayDistanceSlug] ? true : false;
    if (validLeftDate) {
      setQualified(true); // Set Qualified to true if validLeftDate is true
      setDbaAppears(true);
    } else {
      window.location.href =
        slug === "coop"
          ? `https://fairpayforall.co.uk/sorry-co-op`
          : `https://fairpayforall.co.uk/sorry-${slug}`; // Redirect to the external "sorry" page
    }
  };

  // update Prisma database with new values for still_work_at_store and dateleft
  const updateDatabase = async () => {
    // console.log("updating db");
    try {
      const response = await fetch(`/api/leadtransfer`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lead_id: uuid, formData: leadData }),
      });

      const data = await response.json();
      console.log(response.ok, "ok?");
      if (!response.ok) {
        // Throw an error with the response status
        setIsError(true);
        throw new Error(`Request failed with status ${response.status}`);
      } else {
        console.log(data.msg, "msg?");
        if (data.msg) {
          setIsFinished(true);
          console.log("finished");
          // setTracking(uuid);
        }
      }
    } catch (e) {
      toast.error("Internet connection Error, please retry later.");
      if (window.console) {
        window.console.log(e);
      }
    }
  };

  const formatDate = (dateValue: string) => {
    // Split the date by the "-" symbol
    const [year, month, day] = dateValue.split("-");

    // Rearrange the format to DD/MM/YYYY and replace "-" with "/"
    return `${day}/${month}/${year}`;
  };

  const changeColourToGreen = (buttonId: keyof typeof greenButtons) => {
    setGreenButtons((prevButtons) => ({
      ...prevButtons,
      [buttonId]: "green",
    }));
  };

  const handleThankYouRedirect = (slug: string) => {
    //add email utm
    if (isMCDomain === false) {
      if (slug === "coop") {
        window.location.href = `https://www.fairpayforall.co.uk/thank-you-co-op?email=${formData["email"].value}`;
      } else if (slug === "justeat") {
        window.location.href = `https://www.fairpayforall.co.uk/thank-you-just-eat?email=${formData["email"].value}`;
      } else {
        window.location.href = `https://www.fairpayforall.co.uk/thank-you-${slug}?email=${formData["email"].value}`;
      }
    } else {
      window.location.href = `https://www.maddisonclarke.co.uk/thank-you-${slug}?email=${formData["email"].value}`;
    }
  };

  useEffect(() => {
    if (isFinished) {
      // Show the message first
      setShowMessage(true);

      // After 1 second, trigger the redirection
      setTimeout(() => {
        handleThankYouRedirect(slug);
      }, 1000); // 1 second delay before redirecting
    }
  }, [isFinished, slug]);

  return (
    <>
      {isFinished ? (
        <div className="flex flex-col items-center">
          {showMessage && (
            <div>
              <h1>You will shortly be redirected...</h1>{" "}
              {/* Show this message for 1 second */}
            </div>
          )}
        </div>
      ) : /* <div className="flex flex-col items-center">
          <AgreementContent content={agreements.p4.content}></AgreementContent>
          <br></br>
          <br></br>
          <br></br>
          <Button
            as-child
            className="inline-flex h-12 w-[300px] items-center justify-center gap-2 rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm"
          >
            <a href="https://www.fairpayforall.co.uk">Back to Homepage</a>
          </Button>
        </div>
        </div> */
      isError ? (
        <>
          Reference Number: {leadUUID}
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Error
            <Button as-child>
              <a href="https://www.fairpayforall.co.uk">Back to Homepage</a>
            </Button>
          </h1>
        </>
      ) : // still_work_at_store is true, no dateleft (all campaigns except bolt and justeat)
      isNurture &&
        !isError &&
        !(
          Object.keys(leadData).length === 0 && leadData.constructor === Object
        ) &&
        leadData["campaign"].value !== "justeat" &&
        leadData["campaign"].value !== "bolt" &&
        leadData["dateleft"] &&
        leadData["dateleft"].value === "" ? (
        <>
          {qualified === false && (
            <>
              <blockquote className="my-6 hidden border-l-2 p-4 pl-6 italic">
                Your Reference Number: {leadUUID}
              </blockquote>

              <div>
                <h1 className="mb-8 mt-4 text-center text-3xl font-bold">
                  Welcome back, {leadData["firstname"].value}!
                </h1>
                <p className="text-xl font-bold">
                  Before we add you to the group claim we just need to double
                  check a few details...
                </p>
                <br></br>
                <p className="text-l mb-3">
                  Do you still work for{" "}
                  {formatCampaignName(leadData["campaign"].value)}?
                </p>
                <Button
                  className="mr-3"
                  onClick={() => {
                    setQualified(true);
                    setStillWorking(true);
                    updateStillWorkAtStore("Yes");
                    setDbaAppears(true);
                  }}
                >
                  Yes
                </Button>
                <Button
                  onClick={() => {
                    setQualified(false);
                    setStillWorking(false);
                    updateStillWorkAtStore("No");
                    setDateConfirmationQuestion(true);
                    changeColourToGreen("button3");
                  }}
                  style={{
                    backgroundColor:
                      greenButtons["button3"] === "green" ? "green" : "",
                  }}
                >
                  No
                </Button>
              </div>
              <br></br>

              {!stillWorking && !qualified && dateConfirmationQuestion && (
                <div>
                  <p className="text-l mb-3 mt-3">
                    No problem! When did you leave?
                  </p>
                  <input
                    type="date"
                    className="mb-3 flex h-10 cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={leadData[`new_dateleft`]?.value || ""}
                    onChange={(e) => handleInputChange(e, "new_dateleft")}
                  />
                  <Button
                    className="mb-7"
                    onClick={() => {
                      handleDateLeftButtonClick(leadData[`new_dateleft`].value);
                      setDbaAppears(true);
                    }}
                  >
                    Continue
                  </Button>
                  {/* 
                  <div className="overflow-auto">
                    <h2>Verbose</h2>
                    <pre className="max-w-screen-sm">
                      {JSON.stringify(leadData, null, 2)}
                    </pre>
                  </div> */}
                </div>
              )}
            </>
          )}

          {qualified === true && (
            <div>
              <h1 className="mb-8 mt-8 text-center text-3xl font-bold">
                Good News! You Qualify to Join the Claim
              </h1>

              <section className="mb-8">
                <p>
                  <p>
                    To officially add yourself to the group action and secure
                    any compensation you may be owed, all you need to do is
                    agree to the T&Cs of the no-win-no-fee document by pressing
                    "I Accept" at the bottom of the page.
                  </p>
                </p>
                <br></br>
                <p>
                  <p>
                    If all of your information is correct, Leigh Day solicitors
                    are willing to represent you in your equal pay claim against{" "}
                    {formatCampaignName(leadData["campaign"].value)} on a no-win
                    no-fee basis, subject to regulatory checks.
                  </p>
                </p>
                <br></br>
                <p>
                  <p>
                    If you want Leigh Day to bring a claim for you, you need to
                    click the accept button at the bottom of this page. This
                    confirms you have read and agree to the client care and
                    costs letter, form of authority, and the Damages-Based
                    Agreement (‘DBA’) below. You also agree that this agreement
                    is of your own free will.
                  </p>
                </p>
              </section>

              <section className="mb-8">
                <div className="text-gray-700">
                  <Collapsible
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    className="space-y-2"
                  >
                    <div className="mt-5 flex items-center justify-between space-x-4">
                      <CollapsibleTrigger asChild>
                        <Button>
                          {isOpen ? "Show Less" : "Read More"}

                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="space-y-2">
                      <div className="px-0 pb-3">
                        <div className="my-5 p-0">
                          {" "}
                          <AgreementContent
                            content={agreements.p3.content}
                            key="ac1"
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </section>

              <div className="flex justify-center">
                <Button
                  disabled={IsSubmitting}
                  className="inline-flex h-12 w-[300px] items-center justify-center gap-2 rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm"
                  onClick={() => {
                    // leadbillable(formData, leadUUID);
                    updateDatabase();
                  }}
                >
                  {" "}
                  {IsSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting, Please Wait...
                    </>
                  ) : (
                    <>{agreements.p2.author}</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : // still work at store is false, and there is a value for dateleft (all campaigns except bolt and justeat)
      isNurture &&
        !isError &&
        lastWorkedQuestion &&
        !(
          Object.keys(leadData).length === 0 && leadData.constructor === Object
        ) &&
        leadData["campaign"].value !== "justeat" &&
        leadData["campaign"].value !== "bolt" &&
        leadData["dateleft"].value !== "" ? (
        <>
          {/* Only render this part when qualified is false */}
          {qualified === false && (
            <>
              <div>
                <h1 className="mb-8 mt-4 text-center text-3xl font-bold">
                  Welcome back, {leadData["firstname"].value}!
                </h1>
                <p className="text-xl font-bold">
                  Before we add you to the group claim we just need to double
                  check a few details...
                </p>
                <p className="text-l mb-3 mt-6">
                  You told us that you last worked for{" "}
                  {formatCampaignName(leadData["campaign"].value)} on{" "}
                  <strong>{formatDate(leadData["dateleft"].value)}</strong>, is
                  that still correct?
                </p>
                <Button
                  className="mr-3"
                  onClick={() => {
                    setStillWorking(true);
                    handleDateLeftButtonClick(leadData[`dateleft`].value);
                  }}
                >
                  Yes
                </Button>
                <Button
                  onClick={() => {
                    setStillWorking(false);
                    setQualified(false);
                    setStillWorkQuestion(true);
                    changeColourToGreen("button1");
                  }}
                  style={{
                    backgroundColor:
                      greenButtons["button1"] === "green" ? "green" : "",
                  }}
                >
                  No
                </Button>
              </div>

              {stillWorking === false &&
                !qualified &&
                stillWorkQuestion === true && (
                  <div>
                    <br></br>
                    <p className="text-l mb-3">
                      Do you still work for{" "}
                      {formatCampaignName(leadData["campaign"].value)}?
                    </p>
                    <Button
                      className="mr-3"
                      onClick={() => {
                        setQualified(true);
                        setStillWorking(true);
                        updateStillWorkAtStore("Yes");
                        updateDateleft("");
                        setDbaAppears(true);
                      }}
                    >
                      Yes
                    </Button>
                    <Button
                      onClick={() => {
                        setQualified(false);
                        setStillWorking(false);
                        updateStillWorkAtStore("No");
                        setDateConfirmationQuestion(true);
                        changeColourToGreen("button2");
                      }}
                      style={{
                        backgroundColor:
                          greenButtons["button2"] === "green" ? "green" : "",
                      }}
                    >
                      No
                    </Button>
                  </div>
                )}

              {!stillWorking && !qualified && dateConfirmationQuestion && (
                <div>
                  <p className="text-l mb-3 mt-8">
                    No problem! When did you leave?
                  </p>
                  <input
                    type="date"
                    className="mb-3 flex h-10 cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={leadData[`new_dateleft`]?.value || ""}
                    onChange={(e) => handleInputChange(e, "new_dateleft")}
                  />
                  <Button
                    className="mb-7"
                    onClick={() => {
                      handleDateLeftButtonClick(leadData[`new_dateleft`].value);
                      setDbaAppears(true);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Only render this part when qualified is true */}
          {qualified === true && dbaAppears === true && (
            <div>
              <h1 className="mb-8 mt-8 text-center text-3xl font-bold">
                Good News! You Qualify to Join the Claim
              </h1>

              <section className="mb-8">
                <p>
                  To officially add yourself to the group action and secure any
                  compensation you may be owed, all you need to do is agree to
                  the T&Cs of the no-win-no-fee document by pressing "I Accept"
                  at the bottom of the page.
                </p>
                <br></br>
                <p>
                  If all of your information is correct, Leigh Day solicitors
                  are willing to represent you in your equal pay claim against{" "}
                  {formatCampaignName(leadData["campaign"].value)} on a no-win
                  no-fee basis, subject to regulatory checks.
                </p>
                <br></br>
                <p>
                  If you want Leigh Day to bring a claim for you, you need to
                  click the accept button at the bottom of this page. This
                  confirms you have read and agree to the client care and costs
                  letter, form of authority, and the Damages-Based Agreement
                  (‘DBA’) below. You also agree that this agreement is of your
                  own free will.
                </p>
              </section>

              <section className="mb-8">
                <div className="text-gray-700">
                  <Collapsible
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    className="space-y-2"
                  >
                    <div className="mt-5 flex items-center justify-between space-x-4">
                      <CollapsibleTrigger asChild>
                        <Button>
                          {isOpen ? "Show Less" : "Read More"}

                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="space-y-2">
                      <div className="px-0 pb-3">
                        <div className="my-5 p-0">
                          {" "}
                          <AgreementContent
                            content={agreements.p3.content}
                            key="ac2"
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </section>

              <div className="flex justify-center">
                <Button
                  disabled={IsSubmitting}
                  className="inline-flex h-12 w-[300px] items-center justify-center gap-2 rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm"
                  onClick={() => {
                    // leadbillable(formData, leadUUID);
                    updateDatabase();
                  }}
                >
                  {" "}
                  {IsSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting, Please Wait...
                    </>
                  ) : (
                    <>{agreements.p2.author}</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : // bolt campaign
      isNurture &&
        !isError &&
        lastWorkedQuestion &&
        !(
          Object.keys(leadData).length === 0 && leadData.constructor === Object
        ) &&
        leadData["campaign"].value === "bolt" &&
        leadData["LastDelivery"].value !== "" ? (
        <>
          {/* Only render this part when qualified is false */}
          {qualified === false && (
            <>
              <div>
                <h1 className="mb-8 mt-4 text-center text-3xl font-bold">
                  Welcome back, {leadData["firstname"].value}!
                </h1>
                <p className="text-xl font-bold">
                  Before we add you to the group claim we just need to double
                  check a few details...
                </p>
                <p className="text-l mb-3 mt-6">
                  You told us that you last delivered for{" "}
                  {formatCampaignName(leadData["campaign"].value)} on{" "}
                  <strong>{formatDate(leadData["LastDelivery"].value)}</strong>,
                  is that still correct?
                </p>
                <Button
                  className="mr-3"
                  onClick={() => {
                    handleDateLeftButtonClick(leadData[`LastDelivery`].value);
                  }}
                >
                  Yes
                </Button>
                <Button
                  onClick={() => {
                    setStillWorking(false);
                    setQualified(false);
                    setStillWorkQuestion(true);
                    setDateConfirmationQuestion(true);
                    changeColourToGreen("button1");
                  }}
                  style={{
                    backgroundColor:
                      greenButtons["button1"] === "green" ? "green" : "",
                  }}
                >
                  No
                </Button>
              </div>

              {!qualified && dateConfirmationQuestion && (
                <div>
                  <p className="text-l mb-3 mt-8">
                    No problem! When was your last delivery?
                  </p>
                  <input
                    type="date"
                    className="mb-3 flex h-10 cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={leadData[`new_LastDelivery`]?.value || ""}
                    onChange={(e) => handleInputChange(e, "new_LastDelivery")}
                  />
                  <Button
                    className="mb-7"
                    onClick={() => {
                      handleDateLeftButtonClick(
                        leadData[`new_LastDelivery`].value
                      );
                      setDbaAppears(true);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Only render this part when qualified is true */}
          {qualified === true && dbaAppears === true && (
            <div>
              <h1 className="mb-8 mt-8 text-center text-3xl font-bold">
                Good News! You Qualify to Join the Claim
              </h1>

              <section className="mb-8">
                <p>
                  To officially add yourself to the group action and secure any
                  compensation you may be owed, all you need to do is agree to
                  the T&Cs of the no-win-no-fee document by pressing "I Accept"
                  at the bottom of the page.
                </p>
                <br></br>
                <p>
                  If all of your information is correct, Leigh Day solicitors
                  are willing to represent you in your equal pay claim against{" "}
                  {formatCampaignName(leadData["campaign"].value)} on a no-win
                  no-fee basis, subject to regulatory checks.
                </p>
                <br></br>
                <p>
                  If you want Leigh Day to bring a claim for you, you need to
                  click the accept button at the bottom of this page. This
                  confirms you have read and agree to the client care and costs
                  letter, form of authority, and the Damages-Based Agreement
                  (‘DBA’) below. You also agree that this agreement is of your
                  own free will.
                </p>
              </section>

              <section className="mb-8">
                <div className="text-gray-700">
                  <Collapsible
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    className="space-y-2"
                  >
                    <div className="mt-5 flex items-center justify-between space-x-4">
                      <CollapsibleTrigger asChild>
                        <Button>
                          {isOpen ? "Show Less" : "Read More"}

                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="space-y-2">
                      <div className="px-0 pb-3">
                        <div className="my-5 p-0">
                          {" "}
                          <AgreementContent
                            content={agreements.p3.content}
                            key="ac2"
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </section>

              <div className="flex justify-center">
                <Button
                  disabled={IsSubmitting}
                  className="inline-flex h-12 w-[300px] items-center justify-center gap-2 rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm"
                  onClick={() => {
                    // leadbillable(formData, leadUUID);
                    updateDatabase();
                  }}
                >
                  {" "}
                  {IsSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting, Please Wait...
                    </>
                  ) : (
                    <>{agreements.p2.author}</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : // justeat campaign
      isNurture &&
        !isError &&
        lastWorkedQuestion &&
        !(
          Object.keys(leadData).length === 0 && leadData.constructor === Object
        ) &&
        leadData["campaign"].value === "justeat" &&
        leadData["dateleft"].value !== "" ? (
        <>
          {/* Only render this part when qualified is false */}
          {qualified === false && (
            <>
              <div>
                <h1 className="mb-8 mt-4 text-center text-3xl font-bold">
                  Welcome back, {leadData["firstname"].value}!
                </h1>
                <p className="text-xl font-bold">
                  Before we add you to the group claim we just need to double
                  check a few details...
                </p>
                <p className="text-l mb-3 mt-6">
                  You told us that you last delivered for{" "}
                  {formatCampaignName(leadData["campaign"].value)} on{" "}
                  <strong>{formatDate(leadData["dateleft"].value)}</strong>, is
                  that still correct?
                </p>
                <Button
                  className="mr-3"
                  onClick={() => {
                    handleDateLeftButtonClick(leadData[`dateleft`].value);
                  }}
                >
                  Yes
                </Button>
                <Button
                  onClick={() => {
                    setStillWorking(false);
                    setQualified(false);
                    setStillWorkQuestion(true);
                    setDateConfirmationQuestion(true);
                    changeColourToGreen("button1");
                  }}
                  style={{
                    backgroundColor:
                      greenButtons["button1"] === "green" ? "green" : "",
                  }}
                >
                  No
                </Button>
              </div>

              {!qualified && dateConfirmationQuestion && (
                <div>
                  <p className="text-l mb-3 mt-8">
                    No problem! When was your last delivery?
                  </p>
                  <input
                    type="date"
                    className="mb-3 flex h-10 cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={leadData[`new_dateleft`]?.value || ""}
                    onChange={(e) => handleInputChange(e, "new_dateleft")}
                  />
                  <Button
                    className="mb-7"
                    onClick={() => {
                      handleDateLeftButtonClick(leadData[`new_dateleft`].value);
                      setDbaAppears(true);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Only render this part when qualified is true */}
          {qualified === true && dbaAppears === true && (
            <div>
              <h1 className="mb-8 mt-8 text-center text-3xl font-bold">
                Good News! You Qualify to Join the Claim
              </h1>

              <section className="mb-8">
                <p>
                  To officially add yourself to the group action and secure any
                  compensation you may be owed, all you need to do is agree to
                  the T&Cs of the no-win-no-fee document by pressing "I Accept"
                  at the bottom of the page.
                </p>
                <br></br>
                <p>
                  If all of your information is correct, Leigh Day solicitors
                  are willing to represent you in your equal pay claim against{" "}
                  {formatCampaignName(leadData["campaign"].value)} on a no-win
                  no-fee basis, subject to regulatory checks.
                </p>
                <br></br>
                <p>
                  If you want Leigh Day to bring a claim for you, you need to
                  click the accept button at the bottom of this page. This
                  confirms you have read and agree to the client care and costs
                  letter, form of authority, and the Damages-Based Agreement
                  (‘DBA’) below. You also agree that this agreement is of your
                  own free will.
                </p>
              </section>

              <section className="mb-8">
                <div className="text-gray-700">
                  <Collapsible
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    className="space-y-2"
                  >
                    <div className="mt-5 flex items-center justify-between space-x-4">
                      <CollapsibleTrigger asChild>
                        <Button>
                          {isOpen ? "Show Less" : "Read More"}

                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="space-y-2">
                      <div className="px-0 pb-3">
                        <div className="my-5 p-0">
                          {" "}
                          <AgreementContent
                            content={agreements.p3.content}
                            key="ac2"
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </section>

              <div className="flex justify-center">
                <Button
                  disabled={IsSubmitting}
                  className="inline-flex h-12 w-[300px] items-center justify-center gap-2 rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm"
                  onClick={() => {
                    // leadbillable(formData, leadUUID);
                    updateDatabase();
                  }}
                >
                  {" "}
                  {IsSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting, Please Wait...
                    </>
                  ) : (
                    <>{agreements.p2.author}</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : isNurture && !isError ? (
        <>
          <blockquote className="my-6 hidden border-l-2 p-4 pl-6 italic">
            Your Reference Number: {leadUUID}
          </blockquote>

          <div className="mx-auto">
            <h1 className="mb-8 text-center text-3xl font-bold">
              Final Step to Join The Claim
            </h1>

            <section className="mb-8">
              <AgreementContent content={agreements.p2.content} key="ac3" />
            </section>

            <section className="mb-8">
              <div className="text-gray-700">
                <Collapsible
                  open={isOpen}
                  onOpenChange={setIsOpen}
                  className="space-y-2"
                >
                  <div className="mt-5 flex items-center justify-between space-x-4">
                    <CollapsibleTrigger asChild>
                      <Button>
                        {isOpen ? "Show Less" : "Read More"}

                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="space-y-2">
                    <div className="px-0 pb-3">
                      <div className="my-5 p-0">
                        {" "}
                        <AgreementContent
                          content={agreements.p3.content}
                          key="ac4"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </section>
          </div>

          <div className="flex justify-center">
            <Button
              disabled={IsSubmitting}
              className="inline-flex h-12 w-[300px] items-center justify-center gap-2 rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm"
              onClick={() => {
                leadbillable(formData, leadUUID);
              }}
            >
              {" "}
              {IsSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting, Please Wait...
                </>
              ) : (
                <>{agreements.p2.author}</>
              )}
            </Button>
          </div>
        </>
      ) : !isLoading ? (
        slug !== "sainsburys" ? (
          <>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <ScrollArea className="h-auto rounded-md py-8">
              <AgreementContent content={agreements.p1.content} key="ac5" />
            </ScrollArea>
            <div className="flex justify-center">
              <Button
                disabled={IsSubmitting}
                className="inline-flex h-12 w-[300px] items-center justify-center gap-2 rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm"
                onClick={() => {
                  leadtransfer(formData);
                }}
              >
                {IsSubmitting ? (
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
        ) : (
          // What to show if slug === "sainsburys"
          <div className="py-8 text-center">
            <blockquote className="my-6 hidden border-l-2 p-4 pl-6 italic">
              Your Reference Number: {leadUUID}
            </blockquote>

            <div className="mx-auto">
              <h1 className="mb-8 text-center text-3xl font-bold">
                Final Step to Join The Claim
              </h1>

              <section className="mb-8 text-left">
                <AgreementContent content={agreements.p2.content} key="ac3" />
              </section>

              <section className="mb-8 text-left">
                <div className="text-gray-700">
                  <Collapsible
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    className="space-y-2"
                  >
                    <div className="mt-5 flex items-center justify-between space-x-4">
                      <CollapsibleTrigger asChild>
                        <Button>
                          {isOpen ? "Show Less" : "Read More"}

                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="space-y-2">
                      <div className="px-0 pb-3">
                        <div className="my-5 p-0">
                          {" "}
                          <AgreementContent
                            content={agreements.p3.content}
                            key="ac4"
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </section>
            </div>

            <div className="flex justify-center">
              <Button
                disabled={IsSubmitting}
                className="inline-flex h-12 w-[300px] items-center justify-center gap-2 rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm"
                onClick={() => {
                  leadbillableSainsburys(formData, formData["uuid"].value);
                }}
              >
                {" "}
                {IsSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting, Please Wait...
                  </>
                ) : (
                  <>{agreements.p2.author}</>
                )}
              </Button>
            </div>
          </div>
        )
      ) : (
        <>
          <div className="flex flex-1 flex-col gap-6 p-6 lg:gap-8 lg:p-8">
            <div
              className="flex h-64 w-full flex-1 items-center justify-center rounded-lg" // Increased border size and added fixed height and width
              x-chunk="dashboard-02-chunk-1"
            >
              <div className="flex flex-col items-center gap-2 text-center"></div>
              <Loader2 className="my-28 h-16 w-16 animate-spin text-primary/60" />
            </div>
          </div>
        </>
      )}
    </>
  );
}
