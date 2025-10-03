"use client";
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { toast } from "sonner";

export function ClickToCopy({ content }: { content: string }) {
  const [buttonText, setButtonText] = useState(content);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast.success("Copied");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            className="text-xs font-medium underline decoration-dashed"
            variant="link"
            onClick={handleCopy}
            size="sm"
          >
            {buttonText}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Copy to clipboard</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
