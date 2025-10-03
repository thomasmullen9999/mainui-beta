"use client";

import { Button } from "@/components/ui/button";
import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

export function BtnTest() {
  const usernameRef = useRef<HTMLInputElement | null>(null); // Specify the type explicitly

  useEffect(() => {
    // Focus on the username input field once the component is rendered
    usernameRef.current?.focus();
  }, []);
  return (
    <>
      <Input id="nametest" ref={usernameRef} placeholder="First Name" />
      <Button
        variant="outline"
        size="icon"
        className="inline-flex h-12 w-full items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm gap-2 dark:border-gray-800 dark:bg-gray-900 hover:bg-green-500 hover:opacity-100"
        onClick={() => {
          usernameRef.current?.focus();
        }}
      >
        test
      </Button>
    </>
  );
}
