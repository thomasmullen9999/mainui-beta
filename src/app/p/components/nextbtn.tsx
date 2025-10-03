"use client";
import { goToNextPage } from "@/app/p/actions";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// interface Lead {
//   name: string;
//   phone: string;
//   address: string;
// }

export function NextBtn() {
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="MCnextbtn inline-flex h-12 w-full items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm gap-2 dark:border-gray-800 dark:bg-gray-900 hover:bg-green-500 hover:opacity-100"
        onClick={() => {
          goToNextPage();
        }}
      >
        <CheckCircleIcon className="h-4 w-4" />
        Dev: NEXT
      </Button>
    </>
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
