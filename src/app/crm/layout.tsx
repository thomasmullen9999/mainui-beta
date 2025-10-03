import Link from "next/link";
import { Sidebar } from "@/app/crm/components/sidebar";
import {
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { playlists } from "./data/playlists";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div vaul-drawer-wrapper="">
      <div className="relative flex min-h-screen flex-col bg-background">
        <div className="grid min-h-screen w-full overflow-hidden lg:grid-cols-[280px_1fr]">
          <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
            <div className="flex flex-col gap-2">
              <div className="flex h-[60px] items-center px-6">
                <Link
                  className="flex items-center gap-2 font-semibold"
                  href="#"
                >
                  <span className="">MC</span>
                </Link>
              </div>
              <div className="flex-1">
                <Sidebar playlists={playlists} />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
              <Link className="lg:hidden" href="#">
                <span className="sr-only">Home</span>
              </Link>
              <div className="w-full">
                <h1 className="font-semibold text-lg">Leads</h1>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="rounded-full border border-gray-200 w-8 h-8 dark:border-gray-800"
                    size="icon"
                    variant="ghost"
                  >
                    <Avatar>
                      <AvatarFallback>WL</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
              <div className="border shadow-sm rounded-lg p-2">{children} </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
