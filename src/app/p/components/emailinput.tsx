"use client";
import { Input } from "@/components/ui/input";
import { useRef, useEffect, useState } from "react";
import { Loader2, CircleCheckBig, CircleX } from "lucide-react";
import { toast } from "sonner";

type PropsArray = {
  sendDataToParent?: any;
  value: string;
  slug: string;
};

export function MCEmailInput({ sendDataToParent, value, slug }: PropsArray) {
  const [inputValue, setInputValue] = useState(value ? value : "");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // Skip email error message on initial render
    }
  }, []);

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  async function checkemail(inemail: string) {
    setIsLoading(true);

    const response = await fetch(`/api/email`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: inemail,
      }),
    });

    const data = await response.json();
    setIsLoading(false);

    if (
      data.debounce.code == "4" ||
      data.debounce.code == "5" ||
      data.debounce.code == "7"
    ) {
      let disallowedDomains = [
        "sainsburys.co.uk",
        "morrisonsplc.co.uk",
        "asda.co.uk",
        "walmart.com",
        "walmart-legal.com",
        "co-operative.coop",
        "coop.ch",
        "nextplc.co.uk",
      ];

      if (disallowedDomains.includes(inemail.split("@")[1])) {
        setInputValue("");
        sendDataToParent("");
        setIsValidEmail(false);
        toast.error("Please use your personal email.");
      } else if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(inemail) === false) {
        setIsValidEmail(false);
        sendDataToParent("");
        toast.error("Email invalid. Please use the correct format.");
      } else {
        setIsValidEmail(true);
        setIsError(false);
        sendDataToParent(data.debounce.email);
        toast.success("Email Address verified.");
      }
    } else {
      setIsValidEmail(false);
      sendDataToParent("");
      setIsError(true);
      toast.error("Email Address cannot be verified.");
    }

    return data.success;
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsValidEmail(false);
      setIsError(false);
      if (inputValue.length > 9) {
        checkemail(inputValue);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [inputValue, 1000]);

  return (
    <>
      <div className="relative flex w-full max-w-sm items-center space-x-2 rounded-md bg-gray-100 p-2 dark:bg-gray-800">
        <Input
          value={inputValue}
          type="email"
          placeholder="Email"
          onChange={handleInputChange}
        />
        <div className="absolute inset-y-3 right-3 flex h-8 w-8 items-center justify-center">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isValidEmail && (
            <CircleCheckBig color="#3e9392" className="mr-2 h-4 w-4" />
          )}
          {isError && <CircleX color="#FF0000" className="mr-2 h-4 w-4" />}
        </div>
      </div>
    </>
  );
}
