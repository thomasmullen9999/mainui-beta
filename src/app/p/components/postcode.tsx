"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type PropsArray = {
  sendDataToParent?: any;
};

export function PostCode({ sendDataToParent }: PropsArray) {
  const [postcode, setPostcode] = useState("");
  const [addresslist, setAddresslist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const create = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setAddresslist([]);
    setIsLoading(true);
    const response = await fetch(`/api/funnel`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postcode: postcode,
      }),
    });
    const data = await response.json();
    setAddresslist(data);
    if (data.length === 0) {
      toast.error("No addresses found. Please enter a valid postcode.");
    }
    setIsLoading(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex space-x-2">
        <form onSubmit={create} className="flex items-center gap-3">
          <Input
            id="address"
            placeholder="Enter Postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
          />
          <Button
            variant="secondary"
            className="shrink-0"
            type="submit"
            disabled={postcode.length < 5}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Find Address
          </Button>
        </form>
      </div>

      {addresslist.length > 0 && (
        <>
          <Separator className="my-4" />
          <Select
            onValueChange={(str) => {
              sendDataToParent(str, postcode);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Please select your address" />
            </SelectTrigger>
            <SelectContent className="max-h-[15rem] overflow-y-auto md:max-h-[20rem]">
              {addresslist.map((address, index) => (
                // Make sure to set a unique key for each SelectItem
                <SelectItem
                  className="max-w-[92vw]"
                  key={index}
                  value={address.summaryline}
                >
                  {address.summaryline}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </>
  );
}
