/**
 * v0 by Vercel.
 * @see https://v0.dev/t/Mhz8kR7EPQF
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { auth, signOut, signIn } from "@/auth";
import { TableProperties, ChevronRight, ChevronDown } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Calendar as CalendarIcon, Menu, Folder } from "lucide-react";
import {
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import "@/app/admin/css/styles.css";
import { Toaster } from "@/components/ui/sonner";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session)
    return (
      <form
        action={async () => {
          "use server";
          await signIn();
        }}
      >
        <button type="submit">Sign in</button>
      </form>
    );

  return (
    <div className="flex w-full flex-col">
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between gap-4 border-b border-border/40 bg-background/95 bg-gray-100/40 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-gray-800/40 lg:h-[60px]">
        <Link className="flex items-center gap-2" href="admin/">
          <TableProperties className="h-6 w-6" />
          <span className="font-semibold">MCForm Admin</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-800"
              size="icon"
              variant="ghost"
            >
              <Avatar>
                <AvatarFallback>
                  {session?.user?.email ? (
                    <p>{session?.user?.email.substring(0, 2).toUpperCase()}</p>
                  ) : (
                    <p>MC</p>
                  )}
                </AvatarFallback>
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
            <DropdownMenuItem>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button type="submit">Sign Out</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex min-h-screen w-full">
        <aside className="w-64 flex-col border-r bg-background p-4">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/admin/home"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
              prefetch={false}
            >
              Home
            </Link>
            <Collapsible className="grid gap-2">
              <CollapsibleTrigger className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground">
                <Folder className="h-5 w-5" />
                Sales and Marketing
                <ChevronRight className="ml-auto h-5 w-5 transition-all" />
              </CollapsibleTrigger>
              <CollapsibleContent className="CollapsibleContent">
                <div className="grid gap-2">
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
                    prefetch={false}
                  >
                    Leads
                  </Link>
                  <Link
                    href="/admin/exportcsv"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
                    prefetch={false}
                  >
                    Export
                  </Link>
                  <Link
                    href="/admin/dropoffs"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
                    prefetch={false}
                  >
                    Drop Offs
                  </Link>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </nav>
        </aside>
        <div className="flex-1 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4"></div>
          </div>
          <main className="flex-1">{children}</main>
          <Toaster richColors position="top-center" />
        </div>
      </div>
    </div>
  );
}
