import { cn } from "@/lib/utils";
import { Inter as FontSans } from "next/font/google";
import {
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
  Headset,
  MessageCircleQuestion,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Toaster } from "@/components/ui/sonner";
import { headers } from "next/headers";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
  isMCDomain,
  isMobile,
}: Readonly<{
  children: React.ReactNode;
  isMobile: boolean;
  isMCDomain: boolean;
}>) {
  const mobileNumber = isMCDomain ? "+441618230856" : "+441618233775";
  const desktopNumber = isMCDomain ? "0161 823 0856" : "0161 823 3775";

  const headerList = headers();
  const domainName = headerList.get("x-forwarded-host");
  isMCDomain = domainName?.includes("maddisonclarke") ? true : false;
  const formLogoUrl = domainName?.includes("maddisonclarke")
    ? "/mc-claims-logo.svg"
    : "/fairpay-logo.png";
  const footerText = domainName?.includes("maddisonclarke") ? (
    <div className="items-center">
      {/*       <p className="mt-4 text-sm text-gray-400 md:mt-2">
        Leigh Day will work on a no-win no-fee* basis, meaning that you will
        have nothing to pay unless your claim is successful (unless you have
        breached the terms of your agreement with them). If your claim is
        successful, you will pay some legal costs (typically 25% plus VAT) from
        your compensation. A fee could be payable for any claim(s) cancelled
        after the 14 day cooling off period.
      </p>
      <p className="mt-4 text-sm text-gray-400 md:mt-2">
        Maddison Clarke Ltd receives a payment from our panel law firm Leigh Day
        when you become their client. This is at no extra cost to you.
      </p>{" "} */}
      <p className="mt-4 text-sm text-gray-400 md:mt-2">
        © 2025 Maddison Clarke Ltd, Registered In England & Wales, Registered
        Address Wren Nest Business Centre, Wren Nest Road, Glossop, Sk13 8Hb.
        ICO Number Za445087. Maddison Clarke Ltd Is a Claims Management Company,
        Authorised And Regulated By The Financial Conduct Authority In Respect
        Of Claims Management Activities. (Authorised Firm Reference Number:
        838445){" "}
      </p>
    </div>
  ) : (
    <div className="items-center">
      {/*       <p className="mt-4 text-sm text-gray-400 md:mt-2">
        Leigh Day will work on a no-win no-fee* basis, meaning that you will
        have nothing to pay unless your claim is successful (unless you have
        breached the terms of your agreement with them). If your claim is
        successful, you will pay some legal costs (typically 25% plus VAT) from
        your compensation. A fee could be payable for any claim(s) cancelled
        after the 14 day cooling off period.
      </p>
      <p className="mt-4 text-sm text-gray-400 md:mt-2">
        Fair Pay For All is a trading name of Maddison Clarke Ltd and receives a
        payment from our panel law firm Leigh Day when you become their client.
        This is at no extra cost to you.
      </p>{" "}
      <p className="mt-4 text-sm text-gray-400 md:mt-2">
        By providing support, raising awareness, and advocating for fair
        workers&acute; rights, we <b>can</b> make a positive impact and
        contribute to promoting fair employment practices.{" "}
      </p> */}
      <p className="mt-4 text-sm text-gray-400 md:mt-2">
        &copy; 2025 Fair Pay For All | Fair Pay For All is a trading style of
        Maddison Clarke Ltd, Registered In England &amp; Wales, Registered
        Address Wren Nest Business Centre, Wren Nest Road, Glossop, Sk13 8Hb.
        ICO Number Za445087. Maddison Clarke Ltd Is a Claims Management Company,
        Authorised And Regulated By The Financial Conduct Authority In Respect
        Of Claims Management Activities. (Authorised Firm Reference Number:
        838445)
      </p>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 w-full items-center gap-4 border-b border-border/40 bg-background/95 bg-gray-100/40 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-gray-800/40 lg:h-[60px]">
        <span className="sr-only">Home</span>
        <Link className="flex w-full items-center justify-center" href="#">
          <Image
            width={131}
            height={131}
            priority
            alt="Fair Pay For All"
            src={formLogoUrl}
            className={cn("object-contain transition-all hover:scale-105")}
          />
        </Link>
        <div className="absolute right-[20px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-8 w-8 dark:border-gray-800"
                size="icon"
                variant="ghost"
              >
                <Menu />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                {isMobile ? (
                  <>
                    <Headset className="mr-2 h-4 w-4" />
                    <Link href={mobileNumber} target="_blank">
                      Give us a call
                    </Link>
                  </>
                ) : (
                  <>
                    <Headset className="mr-2 h-4 w-4" />
                    <Link
                      href={
                        isMCDomain ? "tel:+441618230856" : "tel:+441618233775"
                      }
                    >
                      Give us a call (desktop)
                    </Link>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageCircleQuestion className="mr-2 h-4 w-4" />
                <Link
                  href={
                    isMCDomain
                      ? "mailto:info@maddisonclarke.co.uk"
                      : "mailto:info@fairpayforall.co.uk"
                  }
                  target="_blank"
                >
                  Email Us
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link
                  href={
                    isMCDomain
                      ? "https://maddisonclarke.co.uk/complaints-policy/"
                      : "https://fairpayforall.co.uk/complaints-handling-policy/"
                  }
                  target="_blank"
                >
                  Complaints Handling Policy
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={
                    isMCDomain
                      ? "https://maddisonclarke.co.uk/cookies-policy/"
                      : "https://fairpayforall.co.uk/cookies-policy/"
                  }
                  target="_blank"
                >
                  Cookies Policy
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="https://fairpayforall.co.uk/terms-of-use/"
                  target="_blank"
                >
                  Terms of Use
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={
                    isMCDomain
                      ? "https://maddisonclarke.co.uk/privacy-policy/"
                      : "https://fairpayforall.co.uk/privacy-policy/"
                  }
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <Link
                  href={
                    isMCDomain
                      ? "https://maddisonclarke.co.uk/"
                      : "https://www.fairpayforall.co.uk"
                  }
                >
                  Back to Homepage
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex pt-2">
        <main className="w-full pt-0">{children}</main>
        <Toaster richColors position="top-center" />
      </div>{" "}
      <div className="py-8">
        <div className="mx-auto max-w-sm items-center justify-between px-4 md:max-w-screen-md md:flex-row md:px-6">
          {footerText}
        </div>
      </div>
    </>
  );
}
