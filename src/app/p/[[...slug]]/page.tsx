"use client";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { addDays, format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ArrowBigRight, Calendar as CalendarIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

import configDataJustEat from "@/app/p/data/justeat.json";
import configDataBolt from "@/app/p/data/bolt.json";
import configDataSainsburys from "@/app/p/data/sainsburys.json";
import configDataMorrisons from "@/app/p/data/morrisons.json";
import configDataAsda from "@/app/p/data/asda.json";
import configDataCoop from "@/app/p/data/coop.json";
import configDataNext from "@/app/p/data/next.json";

import { ClearWin } from "@/components/clearwin";
import { SelectSearch } from "@/app/p/components/selectsearch";
import { FreeTextSelectSearch } from "@/app/p/components/freetextselect";
import { MCPhoneNumber } from "@/app/p/components/phonenumber";
import { MCEmailInput } from "@/app/p/components/emailinput";
import { PostCode } from "@/app/p/components/postcode";
import { SainsMCAgreement } from "@/app/p/components/sainsagreement";
import { MCAgreement } from "@/app/p/components/agreement";
import { calculateDayDistances, calculateAge } from "@/utils/main";

interface LocationOption {
  value: string;
  label: string;
}

interface Field {
  label: string;
  type:
    | "text"
    | "address"
    | "Date"
    | "question"
    | "phone"
    | "email"
    | "selectsearch"
    | "freetextselectsearch"
    | "dob"
    | "info"
    | "eligible-info"
    | "phoneandprivacy"
    | "agreement";
  hint?: string;
  condition?: string;
  question?: string | null;
  options?: string[];
  allowedAnswer?: string[] | null;
  selectsearch_options?: LocationOption[];
  agreements?: any;
}

const CONFIG_MAP = {
  asda: configDataAsda,
  morrisons: configDataMorrisons,
  justeat: configDataJustEat,
  sainsburys: configDataSainsburys,
  coop: configDataCoop,
  next: configDataNext,
  bolt: configDataBolt,
};

const STEP_MAPPINGS: Record<number, string> = {
  0: "Still Employed?",
  1: "When Did You Leave?",
  2: "Which Store?",
  3: "Hourly Rate?",
  4: "Good News",
  5: "What Is Your Name?",
  6: "Contact",
  7: "Date of Birth",
  8: "Gender",
  9: "Address",
  10: "Employee/NI Number",
  11: "Future Marketing",
  12: "Final Step",
};

const STEP_MAPPINGS_SAINS: Record<number, string> = {
  0: "Ever Worked?",
  1: "Still Employed?",
  2: "When Did You Leave?",
  3: "Which Store?",
  4: "Hourly Rate?",
  5: "Good News",
  6: "What Is Your Name?",
  7: "Contact",
  8: "Date of Birth",
  9: "Gender",
  10: "Address",
  11: "Employee/NI Number",
  12: "Future Marketing",
  13: "Final Step",
};

const STEP_MAPPINGS_NEXT: Record<number, string> = {
  0: "Still Employed?",
  1: "When Did You Start?",
  2: "When Did You Leave?",
  3: "Which Store?",
  4: "Hourly Rate?",
  5: "Job Title?",
  6: "Good News",
  7: "What Is Your Name?",
  8: "Contact",
  9: "Date of Birth",
  10: "Gender",
  11: "Address",
  12: "Employee/NI Number",
  13: "Future Marketing",
  14: "Final Step",
};

const STEP_MAPPINGS_JUSTEAT: Record<number, string> = {
  0: "Last 10 Weeks?",
  1: "Employment Type",
  2: "Last Delivery",
  3: "Good News",
  4: "What Is Your Name?",
  5: "Contact",
  6: "Date of Birth",
  7: "Same As Justeat Email?",
  8: "Justeat Email",
  9: "Future Marketing",
  10: "Final Step",
};

const STEP_MAPPINGS_REVERSED: Record<string, number> = {
  "Still Employed?": 0,
  "When Did You Leave?": 1,
  "Which Store?": 2,
  "Hourly Rate?": 3,
  "Good News": 4,
  "What Is Your Name?": 5,
  Contact: 6,
  "Date of Birth": 7,
  Gender: 8,
  Address: 9,
  "Employee/NI Number": 10,
  "Future Marketing": 11,
  "Final Step": 12,
  Unknown: 12,
};

const STEP_MAPPINGS_SAINS_REVERSED: Record<string, number> = {
  "Ever Worked?": 0,
  "Still Employed?": 1,
  "When Did You Leave?": 2,
  "Which Store?": 3,
  "Hourly Rate?": 4,
  "Good News": 5,
  "What Is Your Name?": 6,
  Contact: 7,
  "Date of Birth": 8,
  Gender: 9,
  Address: 10,
  "Employee/NI Number": 11,
  "Future Marketing": 12,
  "Final Step": 13,
  Unknown: 13,
};

const STEP_MAPPINGS_NEXT_REVERSED: Record<string, number> = {
  "Still Employed?": 0,
  "When Did You Start?": 1,
  "When Did You Leave?": 2,
  "Which Store?": 3,
  "Hourly Rate?": 4,
  "Job Title?": 5,
  "Good News": 6,
  "What Is Your Name?": 7,
  Contact: 8,
  "Date of Birth": 9,
  Gender: 10,
  Address: 11,
  "Employee/NI Number": 12,
  "Future Marketing": 13,
  "Final Step": 14,
  Unknown: 14,
};

const STEP_MAPPINGS_JUSTEAT_REVERSED: Record<string, number> = {
  "Last 10 Weeks?": 0,
  "Employment Type": 1,
  "Last Delivery": 2,
  "Good News": 3,
  "What Is Your Name?": 4,
  Contact: 5,
  "Date of Birth": 6,
  "Same As Justeat Email?": 7,
  "Justeat Email": 8,
  "Future Marketing": 9,
  "Final Step": 10,
  Unknown: 10,
};

const stepMappings = {
  sainsburys: STEP_MAPPINGS_SAINS,
  next: STEP_MAPPINGS_NEXT,
  morrisons: STEP_MAPPINGS,
  coop: STEP_MAPPINGS,
  asda: STEP_MAPPINGS,
  justeat: STEP_MAPPINGS_JUSTEAT,
};

const reversedStepMappings = {
  sainsburys: STEP_MAPPINGS_SAINS_REVERSED,
  next: STEP_MAPPINGS_NEXT_REVERSED,
  morrisons: STEP_MAPPINGS_REVERSED,
  coop: STEP_MAPPINGS_REVERSED,
  asda: STEP_MAPPINGS_REVERSED,
  justeat: STEP_MAPPINGS_JUSTEAT_REVERSED,
};

const FORM_STEP_LIMITS_NURTURE = {
  sainsburys: 7,
  asda: 12,
  justeat: 12,
  next: 14,
  coop: 12,
  morrisons: 13,
};

const FORM_STEP_LIMITS_DBA = {
  sainsburys: 13,
  asda: 14,
  justeat: 14,
  next: 15,
  coop: 13,
  morrisons: 13,
};

type CampaignKey =
  | "morrisons"
  | "asda"
  | "sainsburys"
  | "coop"
  | "next"
  | "justeat";

const campaignExpiryValues: Record<CampaignKey, number> = {
  morrisons: 161,
  asda: 2002,
  sainsburys: 161,
  coop: 161,
  next: 161,
  justeat: 70,
};

function addDaysToDate(dateStr: string, days: any): string {
  const date = new Date(dateStr);
  const newDate = addDays(date, days);
  return format(newDate, "yyyy-MM-dd");
}

function daysUntil(dateStr: string): number {
  const targetDate = new Date(dateStr);
  const today = new Date();

  // normalize to midnight to avoid time zone issues
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

function App({ params }: { params: { slug: string[] } }) {
  const [domain, setDomain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadUUID, setLeadUUID] = useState("");
  const [leadbyteID, setLeadbyteID] = useState("");
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isNextAble, setIsNextAble] = useState(true);
  const redirectRef = useRef(false);
  const [conditionArray, setConditionArray] = useState<
    { [key: string]: string }[]
  >([]);
  const [dob, setDob] = useState({
    day: "",
    month: "",
    year: "",
    currentLabel: "dob",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);
  const [hasLoadedExistingData, setHasLoadedExistingData] = useState(false);

  const previousStepRef = useRef<number | null>(0);
  const latestStepRef = useRef<string | null>(null);
  const latestFormDataRef = useRef(formData);

  // keep a stable ref to formslug etc
  const searchParams = useSearchParams();
  const formslug = params.slug[0];
  const retrieval_lead_id = params.slug[1];
  const stepMapper = stepMappings[formslug as keyof typeof stepMappings];
  const reversedStepMapper =
    reversedStepMappings[formslug as keyof typeof reversedStepMappings];

  const configData =
    CONFIG_MAP[formslug as keyof typeof CONFIG_MAP] || configDataJustEat;
  const isMCDomain = domain?.includes("maddisonclarke");

  const allowedForm = isMCDomain
    ? ["coop", "justeat"]
    : ["justeat", "asda", "sainsburys", "morrisons", "coop", "next"];

  const firstAgreement = configData
    .find((item) => item.fields?.some((field) => field.type === "agreement"))
    ?.fields.find((field) => field.type === "agreement")?.agreements;

  const utm_params = {
    utm_source: searchParams.get("utm_source") || "",
    utm_medium: searchParams.get("utm_medium") || "",
    utm_campaign: searchParams.get("utm_campaign") || "",
    utm_content: searchParams.get("utm_content") || "",
    utm_term: searchParams.get("utm_term") || "",
    ttclid: searchParams.get("ttclid") || "",
    ga: searchParams.get("_ga") || "",
    fbp: searchParams.get("_fbp") || "",
    ttp: searchParams.get("_ttp") || "",
  };

  // ----- Helpers that only update state when necessary (avoid redundant setState) -----
  const setFormFieldIfChanged = (
    label: string,
    value: any,
    labelText?: string
  ) => {
    setFormData((prev) => {
      const prevVal = prev?.[label]?.value;
      if (prevVal === value) return prev; // no change -> avoid update
      return {
        ...prev,
        [label]: { label: labelText ?? prev?.[label]?.label ?? label, value },
      };
    });
  };

  const setFormFieldsIfChanged = (fields: { [key: string]: any }) => {
    setFormData((prev) => {
      let changed = false;
      const next = { ...prev };
      Object.entries(fields).forEach(([label, { value, labelText }]: any) => {
        const prevVal = prev?.[label]?.value;
        if (prevVal !== value) {
          changed = true;
          next[label] = {
            label: labelText ?? prev?.[label]?.label ?? label,
            value,
          };
        }
      });
      return changed ? next : prev;
    });
  };

  // keep ref up to date so effects that are registered once can read latest
  useEffect(() => {
    latestFormDataRef.current = formData;
  }, [formData]);

  // Set domain and favicon (runs once)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(window.location.hostname);
    }
  }, []);

  useEffect(() => {
    const link = document.querySelector(
      "link[rel~='icon']"
    ) as HTMLLinkElement | null;
    if (link) {
      link.href = isMCDomain ? "/mc-favicon.ico" : "/fairpay-favicon.ico";
    }
  }, [isMCDomain]);

  useEffect(() => {
    // Only load existing data if we have a retrieval_lead_id and haven't loaded yet
    if (retrieval_lead_id && !hasLoadedExistingData && !isLoadingExistingData) {
      setIsLoadingExistingData(true);

      // Fetch existing form data from your API
      fetch(`/api/lead/${retrieval_lead_id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data, "chahaha");
          if (data && data.formData) {
            // Merge existing data with current form structure
            setFormData((prevFormData) => {
              const mergedData = { ...prevFormData };

              // Update only the fields that exist in the saved data
              Object.keys(data.formData).forEach((key) => {
                if (
                  data.formData[key] &&
                  data.formData[key].value !== undefined
                ) {
                  mergedData[key] = {
                    label: mergedData[key]?.label || data.formData[key].label,
                    value: data.formData[key].value,
                  };
                }
              });

              // Update UUID to match the existing lead
              mergedData.uuid = {
                label: "UUID",
                value: data.id,
              };

              // After merging, update currentStep if latest_step exists
              if (
                mergedData.latest_step &&
                mergedData.latest_step.value !== undefined
              ) {
                const stepKey =
                  reversedStepMapper[mergedData.latest_step.value];
                if (stepKey !== undefined) {
                  setCurrentStep(stepKey);
                }
              }

              return mergedData;
            });

            // Set the leadUUID to the existing ID
            setLeadUUID(data.id);
          }
          setIsLoadingExistingData(false);
          setHasLoadedExistingData(true);
        })
        .catch((error) => {
          console.error("Failed to load existing form data:", error);
          setIsLoadingExistingData(false);
          setHasLoadedExistingData(true);
        });
    }
  }, [retrieval_lead_id, hasLoadedExistingData, isLoadingExistingData]);

  useEffect(() => {
    console.log(leadUUID, "leadUUID from useEffect");
  }, [leadUUID]);

  // Initialize form data (runs when formslug changes)
  useEffect(() => {
    const initialFormData: { [key: string]: any } = {};

    configData.forEach((step) => {
      step.fields.forEach(({ label, hint }) => {
        initialFormData[label] = { label: hint, value: "" };
      });
    });

    Object.assign(initialFormData, {
      campaign: { label: "Campaign", value: formslug },
      referrer: {
        label: "Referrer",
        value: typeof document !== "undefined" ? document.referrer : "",
      },
      user_agent: {
        label: "User Agent",
        value:
          typeof navigator !== "undefined" ? window.navigator.userAgent : "",
      },
      page_url: {
        label: "Page URL",
        value: typeof location !== "undefined" ? window.location.href : "",
      },
      latest_step: { label: "Latest Step", value: "Still Employed?" },
      step_before_latest: { label: "Step Before Latest", value: "None" },
      uuid: { label: "UUID", value: "" },
      ...Object.fromEntries(
        Object.entries(utm_params).map(([key, value]) => [
          key,
          { label: key, value },
        ])
      ),
      ...Object.fromEntries(
        [
          "server_zip_code",
          "server_timezone",
          "server_city",
          "server_region",
          "server_country",
          "ip_address",
          "ja4",
        ].map((key) => [key, { label: key.replace(/_/g, " "), value: "" }])
      ),
    });

    setFormData(initialFormData);

    const initialConditionArray = configData.map((step) => {
      const stepConditions: { [key: string]: string } = {};
      step.fields.forEach(({ label, condition }) => {
        stepConditions[label] = condition || "";
      });
      return stepConditions;
    });

    setConditionArray(initialConditionArray);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formslug]);

  // Update step tracking — only update formData when the computed latest_step actually changed.
  useEffect(() => {
    const previousStep = previousStepRef.current;
    const latest = (stepMapper && stepMapper[currentStep]) || "Unknown";

    if (latestStepRef.current !== latest) {
      // batch update relevant fields once
      setFormFieldsIfChanged({
        latest_step: { value: latest, labelText: "Latest Step" },
        step_before_latest: {
          value:
            previousStep !== null && STEP_MAPPINGS[previousStep]
              ? (stepMapper && stepMapper[currentStep - 1]) || "None"
              : "None",
          labelText: "Step Before Latest",
        },
      });
      latestStepRef.current = latest;
    }

    previousStepRef.current = currentStep;
    // We intentionally do not depend on formData here to avoid updates looping.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, stepMapper]);

  // Fetch geo IP data once and apply all changes in a single set
  useEffect(() => {
    let mounted = true;
    fetch("/api/geoip")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        const geoFields: { [k: string]: any } = {
          server_zip_code: { value: data.zipcode },
          server_country: { value: data["x-vercel-ip-country"] },
          server_region: { value: data["x-vercel-ip-country-region"] },
          server_timezone: { value: data["x-vercel-ip-timezone"] },
          server_city: { value: data["x-vercel-ip-city"] },
          ip_address: { value: data["x-real-ip"] },
          ja4: { value: data["ja4"] },
        };
        setFormFieldsIfChanged(geoFields);
      })
      .catch((e) => {
        // silent fail — geo data not critical
        console.debug("geoip fetch failed", e);
      });

    return () => {
      mounted = false;
    };
    // empty deps: run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add tracking script once
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://t.fairpayforall.co.uk/v1/lst/universal-script?ph=b5e98266f8ee44d4331cb97605a3390f6291cdf60f9d89766ce786af292f98d0&tag=!clicked&ref_url=${encodeURIComponent(
      typeof document !== "undefined" ? document.URL : ""
    )}`;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentStepLocal = currentStep;
      console.log(currentStepLocal, "local");

      // Only fire for dropped-off / incomplete journeys
      if (
        currentStepLocal < 15 ||
        (currentStepLocal >= 17 && currentStepLocal <= 21)
      ) {
        const fd = latestFormDataRef.current || {};
        console.log(fd, "formData before unload");

        // Safeguard: don't overwrite leads that are already sold
        const existingStatus = fd?.status || fd?.lead_status;
        if (existingStatus === "sold") {
          console.log("Skipping sendBeacon — lead is already SOLD");
          return;
        }

        const payload = {
          lead_email: fd.email?.value,
          lead_name: fd.firstname?.value,
          lead_campaign: fd.campaign?.value,
          formData: fd,
          // If status is already something else (like 'hot', 'qualified', etc.),
          // keep it. Only fall back to nurture if nothing is set.
          lead_status: existingStatus || "nurture",
          id: leadUUID || retrieval_lead_id, // Use existing ID if available
        };

        try {
          const endpoint =
            leadUUID || retrieval_lead_id
              ? "/api/updatelead"
              : "/api/droppedoff";

          navigator.sendBeacon(
            endpoint,
            new Blob([JSON.stringify(payload)], { type: "application/json" })
          );
        } catch (e) {
          console.debug("sendBeacon failed", e);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [leadUUID, retrieval_lead_id, stepMapper, currentStep]);

  // Update UUID when leadUUID changes — use helper so we only set when it changed
  useEffect(() => {
    if (leadUUID) {
      setFormFieldIfChanged("uuid", leadUUID, "UUID");
    }
  }, [leadUUID]);

  // Handle DOB changes — compute once and only update if different
  useEffect(() => {
    const { day, month, year, currentLabel } = dob;
    if (!day || !month || !year) return;

    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);

    const dateObj = new Date(y, m, d);
    if (dateObj.getDate() === d) {
      const iso = new Date(Date.UTC(y, m, d)).toISOString().split("T")[0];
      setFormFieldIfChanged(currentLabel, iso, "Date of Birth");
    } else {
      setFormFieldIfChanged(currentLabel, "", currentLabel);
    }
  }, [dob]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    label: string
  ) => {
    setFormFieldIfChanged(label, e.target.value);
  };

  const handlePureTextInputChange = (txt: string, label: string) => {
    setFormFieldIfChanged(label, txt);
  };

  const handleDOBInputChange = (txt: string, label: string) => {
    setDob((prev) => ({ ...prev, [label]: txt, currentLabel: "dob" }));
  };

  const evaluateCondition = (
    condition: string,
    fd: { [key: string]: string }
  ) => {
    try {
      const executeCode = new Function(
        "formData",
        "calculateDayDistances",
        "calculateAge",
        `return ${condition};`
      );
      return executeCode(fd, calculateDayDistances, calculateAge);
    } catch (error) {
      console.error("Error evaluating condition:", error);
      return false;
    }
  };

  const parseDesc = (jsonText: string) => {
    if (typeof jsonText !== "string") return jsonText;

    return jsonText.replace(/{{(.*?)}}/g, (match, script) => {
      try {
        const executeCode = new Function(
          "formData",
          "calculateDayDistances",
          "calculateAge",
          `return ${script};`
        );
        return executeCode(formData, calculateDayDistances, calculateAge);
      } catch (error) {
        console.error("Error evaluating script:", error);
        return match;
      }
    });
  };

  async function sendNurtureLead(formData: any) {
    console.log("🚀 sendNurtureLead called with:", formData);

    setIsSubmitting(true);

    try {
      console.log("📡 Sending POST to /api/leadtransfer...");

      const response = await fetch("/api/leadtransfer", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData }),
      });

      console.log(
        "📬 Response received:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const text = await response.text();
        console.error(
          "❌ Server returned non-OK status:",
          response.status,
          text
        );
        throw new Error(`Server error ${response.status}`);
      }

      console.log("🧩 Parsing JSON response...");
      const data = await response.json();
      console.log("✅ Parsed response JSON:", data);

      if (data.success) {
        console.log("🎉 Lead successfully sent!");
        toast.success("Lead successfully sent!");

        // ✅ Update leadUUID
        if (data.lead_id) {
          setLeadUUID(data.lead_id);
        }

        // ✅ Update leadbyte ID if available
        if (data.sainsLeadbyte?.records?.[0]?.response?.leadId) {
          const leadbyteId = data.sainsLeadbyte.records[0].response.leadId;

          setLeadbyteID(leadbyteId);
          console.log(leadbyteId, "does it xists?");

          // Update formData with leadbyte_id
          setFormData((prev) => ({
            ...prev,
            leadbyte_id: {
              label: "Leadbyte ID",
              value: leadbyteId,
            },
          }));

          // ✅ Send leadbyte ID to backend
          try {
            console.log("📤 Sending leadbyte ID to /api/sendleadbyteid...");
            const updateResponse = await fetch("/api/sendleadbyteid", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                leadUUID: data.lead_id,
                formData: {
                  ...formData,
                  leadbyte_id: { label: "Leadbyte ID", value: leadbyteId },
                },
              }),
            });

            const updateResult = await updateResponse.json();
            console.log("✅ Updated lead with leadbyte ID:", updateResult);
          } catch (updateError) {
            console.error(
              "⚠️ Error updating lead with leadbyte ID:",
              updateError
            );
            // Don't throw - this is a secondary operation
          }
        }

        // ✅ Move to next step
        setCurrentStep((prev) => prev + 1);
      } else {
        console.warn("⚠️ Lead transfer failed:", data.message);
        toast.error(
          "Lead transfer failed: " + (data.message || "Unknown error")
        );
      }
    } catch (err: any) {
      console.error("🔥 sendNurtureLead caught error:", err);
      toast.error("Internet connection Error, please retry later.");
    } finally {
      console.log("🔚 Finished sendNurtureLead, resetting state...");
      setIsSubmitting(false);
    }
  }

  const handleNextButtonClick = () => {
    console.log(configData, "configData");
    const fields = configData[currentStep].fields;
    const decisionType = configData[currentStep].decisionType;
    let nextStep: number | undefined;

    switch (decisionType) {
      case "agreement":
        if (typeof window !== "undefined") {
          window.location.href = configData[currentStep].fields[0].hint!;
        }
        return;

      case "redirect":
        if (typeof window !== "undefined") {
          window.location.href = parseDesc(
            configData[currentStep].fields[0].hint!
          );
        }
        return;

      case "next":
        nextStep = currentStep + 1;
        break;

      case "calculate": {
        const pathConditions = configData[currentStep].pathcondition ?? [];
        const applicableCondition = pathConditions.find((condition) =>
          evaluateCondition(condition.if_condition, formData)
        );

        if (applicableCondition) {
          nextStep = configData.findIndex(
            (step) => step.heading === applicableCondition.headingTo
          );
        }
        break;
      }

      default: {
        const isValid = fields.every(({ label, type }) => {
          if (type === "question") {
            const selectedAnswer = formData[label]?.value;
            const allowedAnswers = (configData[currentStep].fields[0] as any)
              .allowedAnswer;
            return allowedAnswers
              ? allowedAnswers.includes(selectedAnswer)
              : false;
          } else {
            const condition = conditionArray[currentStep]?.[label];
            return !condition || evaluateCondition(condition, formData);
          }
        });

        if (isValid) nextStep = currentStep + 1;
        break;
      }
    }
    if (nextStep !== undefined && configData[nextStep]?.fields?.[0]) {
      const hint = configData[nextStep].fields[0].hint;
      if (hint?.toLowerCase().includes("sorry")) {
        window.location.href = parseDesc(hint);
        return;
      }

      // Save progress when moving to next step (for returning users)
      if (retrieval_lead_id || leadUUID) {
        const payload = {
          lead_email: formData.email?.value,
          lead_name: formData.firstname?.value,
          lead_campaign: formData.campaign?.value,
          formData: formData,
          lead_status: "nurture",
          id: leadUUID || formData.uuid?.value,
          leadbyteId: leadbyteID || "",
        };

        console.log(payload, "buuu");

        // Save progress asynchronously (don't block UI)
        fetch("/api/updatelead", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch((error) => {
          console.debug("Failed to save progress:", error);
        });
      }

      setCurrentStep(nextStep);
      setIsNextAble(configData[nextStep].fields[0].type !== "agreement");
    } else if (
      formData.campaign?.value === "next" &&
      configData[currentStep].heading === "Step Staff Number"
    ) {
      toast.error(
        "⚠️ Please enter either your NI Number or Employee Number to proceed."
      );
    } else {
      toast.error("Please make sure all the data is correctly entered.");
    }
  };

  const renderField = (field: Field, index: number) => {
    const { label, type, hint, selectsearch_options, agreements } = field;

    switch (type) {
      case "Date":
        return (
          <div className="relative flex w-full max-w-sm items-center space-x-2 rounded-md bg-gray-100 p-2 dark:bg-gray-800">
            <span className="mr-2 flex items-center text-gray-500 dark:text-gray-400">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Date
            </span>
            <input
              type="date"
              id="MCDate"
              className="flex h-10 cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData[label]?.value || ""}
              onChange={(e) => handleInputChange(e, label)}
            />
          </div>
        );

      case "selectsearch":
        return (
          <SelectSearch
            selectsearch_options={selectsearch_options ?? []}
            sendDataToParent={(str: string) =>
              handlePureTextInputChange(str, label)
            }
            dataName={hint ?? ""}
          />
        );

      case "freetextselectsearch":
        return (
          <FreeTextSelectSearch
            selectsearch_options={selectsearch_options ?? []}
            sendDataToParent={(str: string) =>
              handlePureTextInputChange(str, label)
            }
            dataName={hint ?? ""}
          />
        );

      case "dob":
        return (
          <div className="grid min-w-full gap-4 md:min-w-[600px] md:grid-cols-3">
            {["day", "month", "year"].map((period) => (
              <div
                key={period}
                className={`mcDob${period.charAt(0).toUpperCase() + period.slice(1)} grid gap-2`}
              >
                <Label htmlFor={`dob_${period}`}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Label>
                <Select
                  defaultValue=""
                  onValueChange={(str) => handleDOBInputChange(str, period)}
                >
                  <SelectTrigger id={`dob_${period}`}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {period === "day" &&
                      Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    {period === "month" &&
                      Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={i.toString()}>
                          {new Date(2000, i).toLocaleString("default", {
                            month: "short",
                          })}
                        </SelectItem>
                      ))}
                    {period === "year" &&
                      Array.from({ length: 100 }, (_, i) => {
                        const year = new Date().getFullYear() - 16 - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        );

      case "question":
        return (
          <>
            <p>{(configData[currentStep].fields[0] as any).question}</p>
            <RadioGroup
              key={`sre_${currentStep}_radiogroup`}
              defaultValue={formData[label]?.value}
              className="grid gap-4"
              onValueChange={(str) => handlePureTextInputChange(str, label)}
            >
              {configData[currentStep].fields[0].options?.map(
                (option: string, optionIndex: number) => (
                  <div
                    key={`sre_${currentStep}_${optionIndex}`}
                    className="w-full"
                  >
                    <RadioGroupItem
                      id={`sr_${currentStep}_${optionIndex}`}
                      value={option}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`sr_${currentStep}_${optionIndex}`}
                      className={`inline-flex h-24 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-200 px-8 font-medium shadow-sm hover:opacity-80 dark:bg-zinc-200 dark:text-stone-900 ${
                        formData[label]?.value === option
                          ? "bg-green-500 dark:bg-green-500"
                          : "bg-slate-100"
                      }`}
                    >
                      {option.toUpperCase()}
                    </Label>
                  </div>
                )
              )}
            </RadioGroup>
          </>
        );

      case "address":
        return (
          <PostCode
            sendDataToParent={(str: string, postcode: string) => {
              handlePureTextInputChange(str, label);
              handlePureTextInputChange(postcode, "postcode");
            }}
          />
        );

      case "eligible-info":
        return (
          <>
            <p className="text-4xl font-bold">Good News!</p>
            <br />
            <p className="text-xl font-bold">
              It Looks Like You're Eligible to Join The{" "}
              {formslug.charAt(0).toUpperCase() + formslug.slice(1)} Equal Pay
              Claim.
            </p>
            <br />
            <p>
              You could be entitled to thousands in backdated equal pay. Simply
              enter your details and agree to the no-win-no-fee document to
              secure any compensation you could be owed.
            </p>
          </>
        );

      case "phone":
        return (
          <MCPhoneNumber
            sendDataToParent={(str: string) =>
              handlePureTextInputChange(str, label)
            }
            value={formData[label]?.value}
          />
        );

      case "email":
        return (
          <MCEmailInput
            sendDataToParent={(str: string) =>
              handlePureTextInputChange(str, label)
            }
            value={formData[label]?.value}
            slug={formslug}
          />
        );

      case "phoneandprivacy":
        return (
          <>
            <MCPhoneNumber
              sendDataToParent={(str: string) =>
                handlePureTextInputChange(str, label)
              }
              value={formData[label]?.value}
            />
            <br />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              I understand that I am providing my contact details by way of
              email, phone and text in order for{" "}
              {isMCDomain ? "Maddison Clarke" : "Fair Pay for All"} and Leigh
              Day to contact me about this claim and that details about how{" "}
              {isMCDomain ? "Maddison Clarke" : "Fair Pay for All"} will further
              use my details can be found in the{" "}
              <a
                href={
                  isMCDomain
                    ? "https://maddisonclarke.co.uk/privacy-policy/"
                    : "https://fairpayforall.co.uk/privacy-policy/"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Privacy Policy
              </a>
              .
            </p>
            <Button
              id="MCnextBtn"
              className="MCnextbtn mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm"
              onClick={() => sendNurtureLead(formData)} // ✅ wrap it in arrow function
              disabled={
                isSubmitting ||
                !formData["telphone"]?.value?.trim() ||
                !formData["email"]?.value?.trim()
              }
            >
              <ArrowBigRight className="mr-2 h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Continue"}
            </Button>
          </>
        );

      case "agreement":
        if (formslug === "sainsburys") {
          return (
            <SainsMCAgreement
              formData={formData}
              slug={formslug}
              agreements={firstAgreement}
              leadbyteId={leadbyteID}
            />
          );
        } else {
          return (
            <MCAgreement
              formData={formData}
              slug={formslug}
              agreements={firstAgreement}
            />
          );
        }

      case "info":
        return null;

      default:
        return (
          <>
            <Label htmlFor={label}>{hint}</Label>
            <Input
              id={label}
              placeholder={hint}
              value={formData[label]?.value || ""}
              onChange={(e) => handleInputChange(e, label)}
            />
          </>
        );
    }
  };

  const renderStep = () => {
    if (
      (!configData[currentStep] || isLoading || isLoadingExistingData) &&
      formData &&
      formData.latest_step &&
      formData.latest_step.value !== ""
    ) {
      return (
        <div className="App">
          <div className="justify-top main-form relative mx-4 flex flex-col items-center sm:mx-6">
            <div className="mb-10 grid w-full max-w-sm items-start gap-4 md:max-w-screen-md">
              <Progress
                value={
                  ((currentStep + 1) /
                    configData.filter((item) => !item.heading.includes("Sorry"))
                      .length) *
                  100
                }
                className="my-6 h-[10px]"
                id="masterprogress"
              />
              <ClearWin>
                <div className="flex justify-center pt-20">
                  <div className="space-y-4 text-center">
                    <h1 className="text-3xl font-bold">Welcome back!</h1>
                    {/* Spinner */}
                    <div className="flex justify-center">
                      <svg
                        className="h-6 w-6 animate-spin text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-md text-gray-500 dark:text-gray-400">
                      Hang tight! Fetching your details...
                    </h2>
                  </div>
                </div>
              </ClearWin>
            </div>
          </div>
        </div>
      );
    }

    const currentStepData = configData[currentStep];
    const rawText = currentStepData.text;
    const parsedText = parseDesc(rawText)
      .replace(/{firstname}/gi, formData["firstname"]?.value || "")
      .trim();

    const title = rawText.toLowerCase().includes("sorrypage")
      ? "Sorry - " + parsedText
      : parsedText.charAt(0).toUpperCase() + parsedText.slice(1);

    const shouldShowNextButton =
      isNextAble &&
      currentStep !==
        FORM_STEP_LIMITS_NURTURE[
          formslug as keyof typeof FORM_STEP_LIMITS_NURTURE
        ] &&
      currentStep !==
        FORM_STEP_LIMITS_DBA[formslug as keyof typeof FORM_STEP_LIMITS_DBA];

    return (
      <div>
        <Progress
          value={
            ((currentStep + 1) /
              configData.filter((item) => !item.heading.includes("Sorry"))
                .length) *
            100
          }
          className="my-6 h-[10px]"
          id="masterprogress"
        />
        <ClearWin>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {parseDesc(currentStepData.descriptions)}
            </p>
          </div>
          {currentStepData.fields.map((field, index) => (
            <div key={`step_${index}`}>{renderField(field as any, index)}</div>
          ))}
        </ClearWin>
        {shouldShowNextButton && (
          <Button
            id="MCnextBtn"
            className="MCnextbtn mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-gray-200 px-8 text-sm font-medium shadow-sm"
            onClick={handleNextButtonClick}
          >
            <ArrowBigRight className="mr-2 h-4 w-4" />
            Continue
          </Button>
        )}
      </div>
    );
  };

  if (!allowedForm.includes(formslug)) {
    return <div>Page Not Found</div>;
  }

  if (
    formslug !== "sainsburys" &&
    formData?.futuremarketing?.value &&
    formData?.futuremarketing?.value !== "" &&
    formData?.lb_accepted_dba?.value &&
    formData?.lb_accepted_dba?.value !== "" &&
    formData.lb_accepted_dba.value !== "Yes"
  ) {
    formData.latest_step.value = "Final Step";
  }

  if (
    retrieval_lead_id &&
    formData &&
    formData.latest_step &&
    formData.latest_step.value !== "" &&
    formData.latest_step.value === "Final Step"
  ) {
    if (formslug === "sainsburys") {
      return (
        <div className="App">
          <div className="justify-top main-form relative mx-4 flex flex-col items-center sm:mx-6">
            <div className="mb-10 grid w-full max-w-sm items-start gap-4 md:max-w-screen-md">
              <SainsMCAgreement
                formData={formData}
                slug={formslug}
                uuid={retrieval_lead_id}
                agreements={firstAgreement}
                leadbyteId={leadbyteID}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="App">
          <div className="justify-top main-form relative mx-4 flex flex-col items-center sm:mx-6">
            <div className="mb-10 grid w-full max-w-sm items-start gap-4 md:max-w-screen-md">
              <MCAgreement
                formData={formData}
                slug={formslug}
                uuid={retrieval_lead_id}
                agreements={firstAgreement}
              />
            </div>
          </div>
        </div>
      );
    }
  }
  return (
    <div className="App">
      <div className="justify-top main-form relative mx-4 flex flex-col items-center sm:mx-6">
        <div className="mb-10 grid w-full max-w-sm items-start gap-4 md:max-w-screen-md">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

export default App;
