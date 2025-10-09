"use client"; // 👈 This is critical

type CopyLinkButtonProps = {
  leadId: string | null;
  campaign: string;
};

const REVERSED_STEP_MAPPINGS = {
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
};

// works for sainsburys only
const REVERSED_STEP_MAPPINGS_SAINS = {
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
};

// works for next only
const REVERSED_STEP_MAPPINGS_NEXT = {
  "Still Employed?": 0,
  "When Did You Leave?": 1,
  "Which Store?": 2,
  "Hourly Rate?": 3,
  "Job Title?": 4,
  "Good News": 5,
  "What Is Your Name?": 6,
  Contact: 7,
  "Date of Birth": 8,
  Gender: 9,
  Address: 10,
  "Employee/NI Number": 11,
  "Future Marketing": 12,
  "Final Step": 13,
};

// works for justeat only - NEEDS COMPLETING
const REVERSED_STEP_MAPPINGS_JE = {
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
};

const stepMappings = {
  next: REVERSED_STEP_MAPPINGS_NEXT,
  justeat: REVERSED_STEP_MAPPINGS_JE,
  sainsburys: REVERSED_STEP_MAPPINGS_SAINS,
  morrisons: REVERSED_STEP_MAPPINGS,
  coop: REVERSED_STEP_MAPPINGS,
  asda: REVERSED_STEP_MAPPINGS,
};

export default function CopyLinkButton({
  leadId,
  campaign,
}: CopyLinkButtonProps) {
  let stepMapper = "";

  const handleClick = () => {
    const firstLetter = campaign?.charAt(0).toLowerCase() || "";
    // const url = `https://claim.fairpayforall.co.uk/${firstLetter}/${leadId ?? ""}`;
    const url = `https://mainui-beta.vercel.app/${firstLetter}/${leadId ?? ""}`;

    navigator.clipboard.writeText(url);
  };

  return (
    <button
      onClick={handleClick}
      className="rounded bg-black px-3 py-1 text-white hover:opacity-80"
    >
      Get Link
    </button>
  );
}
