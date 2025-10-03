"use client";
import { resetCookies, goToFirstPage } from "@/app/p/actions";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// interface Lead {
//   name: string;
//   phone: string;
//   address: string;
// }

export function ResetBtn() {
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          resetCookies();
          goToFirstPage();
        }}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </>
  );
}
