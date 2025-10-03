"use client";
import Link from "next/link";
const linkStyle = {
  color: "#000", // Default color
  textDecoration: "none",
};

const hoverStyle = {
  color: "#ff0000", // Hover color
};
interface MCQuestion {
  id: number;
  field_name: string | null;
  questionText?: string | null;
  descriptionText?: string | null;
  choicesJsonListRaw?: any[] | null;
}
export function Choices({
  id,
  field_name,
  questionText,
  descriptionText,
  choicesJsonListRaw,
}: MCQuestion) {
  return (
    <div className="grid items-start w-full  gap-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{questionText}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {descriptionText}
        </p>
      </div>
      <div className="grid gap-2">
        <Link
          className="inline-flex h-24 items-center justify-center rounded-md border border-gray-200 border-gray-200 px-8 text-sm font-medium shadow-sm gap-2 dark:border-gray-800 bg-slate-100 dark:bg-slate-500 hover:bg-green-500 hover:opacity-100"
          href="#"
        >
          <CheckCircleIcon className="h-4 w-4" />
          Yes
        </Link>
        <Link
          className="inline-flex h-24 items-center justify-center rounded-md border border-gray-200 border-gray-200 px-8 text-sm font-medium shadow-sm gap-2 dark:border-gray-800 bg-slate-100 dark:bg-slate-500 hover:bg-red-500 hover:opacity-100"
          href="#"
        >
          <XCircleIcon className="h-4 w-4" />
          No
        </Link>
      </div>
    </div>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function FlagIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}

function XCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
