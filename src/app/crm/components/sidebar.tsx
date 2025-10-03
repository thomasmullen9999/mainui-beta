"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Playlist } from "../data/playlists";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Home, BadgePoundSterling } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  playlists: Playlist[];
}

export function Sidebar({ className, playlists }: SidebarProps) {
  const router = useRouter();

  const isCurrentPage = (url: string) => {
    const pathname = usePathname();

    //console.log(pathname);
    return pathname === url;
  };
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            CRM Main
          </h2>
          <div className="space-y-1">
            <Button
              asChild
              variant={isCurrentPage("/crm") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/crm">
                <Home className="mr-2 h-4 w-4" />
                CRM <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant={isCurrentPage("/crm/login") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/crm/login">
                <BadgePoundSterling className="mr-2 h-4 w-4" />
                Leads
              </Link>
            </Button>
            <Button
              variant={isCurrentPage("/crm/radio") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              Radio
            </Button>
          </div>
        </div>
        <div className="px-3 py-2 hidden">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Library
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              Playlists
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Songs
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Made for You
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Artists
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Albums
            </Button>
          </div>
        </div>
        <div className="py-2" hidden>
          <h2 className="relative px-7 text-lg font-semibold tracking-tight">
            Playlists
          </h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1 p-2">
              {playlists?.map((playlist, i) => (
                <Button
                  key={`${playlist}-${i}`}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M21 15V6" />
                    <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    <path d="M12 12H3" />
                    <path d="M16 6H3" />
                    <path d="M12 18H3" />
                  </svg>
                  {playlist}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
