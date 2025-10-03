"use client";
import { refreshlead } from "@/app/crm/actions";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { leadType, LeadsData } from "@/types/leadTypes";

// interface Lead {
//   name: string;
//   phone: string;
//   address: string;
// }

export function RefreshLeadBtn(leads: LeadsData) {
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          refreshlead(leads);
        }}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </>
  );
}
