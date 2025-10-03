import { prisma } from "@/lib/prisma";
import { Choices } from "@/app/p/components/choices";
import { MCDatePicker } from "@/app/p/components/datepicker";
import { SelectSearch } from "@/app/p/components/selectsearch";
import { PostCode } from "@/app/p/components/postcode";
import { MCPhoneNumber } from "@/app/p/components/phonenumber";
import { MCEmailInput } from "@/app/p/components/emailinput";
import { ClearWin } from "@/components/clearwin";
import { Progress } from "@/components/ui/progress";
import { headers } from "next/headers";
import { useRef } from "react";

//import { SwitchColour } from "@/app/funnel/components/switchcolour";
//import { BtnTest } from "@/app/funnel/components/btntest";
import { NextBtn } from "@/app/p/components/nextbtn";
import { ResetBtn } from "@/app/p/components/resetbtn";
import { cookies } from "next/headers";
import { ScrollArea } from "@/components/ui/scroll-area";
import { userAgent } from "next/server";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Icons } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { revalidatePath } from "next/cache";
import { goToNextPage } from "@/app/p/actions";
import { fromCookie, isAlreadySet, fromRootCookie } from "@/app/helpers/worker";

function IP() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const forwardedFor = headers().get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headers().get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}

function UserNavigator() {
  return headers().get("user-agent") ?? "";
}

function SHOW_STEP(): number {
  const cookieStore = cookies();
  const currentStep: any = cookieStore.has("step")
    ? cookieStore.get("step")!.value
    : 1;

  return parseInt(currentStep);
}

export default async function Funnel() {
  const currentStepCookie = fromCookie() ? parseInt(fromCookie().step) : 1;

  const data = {};
  return (
    <>
      <div className="justify-top main-form relative flex min-h-screen flex-col items-center pt-10">
        <div className="mb-10 grid w-full max-w-sm items-start gap-4 md:max-w-screen-md">
          {currentStepCookie == 1 && (
            <Card>
              <CardHeader>
                <CardTitle>No-Win-No-Fee*!</CardTitle>
                <CardDescription>
                  This means that if you win your case you’ll receive a payout,
                  if you don’t have a successful claim, your fee will be £0.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          <Progress
            value={(currentStepCookie / 10) * 100}
            className="my-6 h-[10px]"
            id="masterprogress"
          />
          {currentStepCookie == 1 && (
            <>
              <ScrollArea className="h-[350px] rounded-md border p-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                fermentum urna ac purus lacinia, eget commodo risus ultricies.
                Proin eget fermentum libero. Vivamus consequat velit nec mauris
              </ScrollArea>
            </>
          )}
          {currentStepCookie == 2 && (
            <Choices
              questionText="Have You Delivered For Just Eat In The Last 10 Weeks?"
              descriptionText="Please note that you must have delivered directly for Just Eat using the Just Eat courier app and not only, for example, using the Stuart app.              "
              id={2}
              field_name="q1"
            />
          )}
          {currentStepCookie == 3 && (
            <Choices
              questionText="Did You Sign Up To Work With Just Eat (Using The Just Eat Courier App) As A Self-Employed Independent Contractor Or Salaried Worker?              "
              descriptionText="Please note that you must have delivered directly for Just Eat using the Just Eat courier app and not only, for example, using the Stuart app.              "
              id={2}
              field_name="q1"
            />
          )}
          {currentStepCookie == 4 && (
            <>
              <ClearWin>
                <h1 className="text-3xl font-bold">Date</h1>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Descriptions here
                </p>
                <MCDatePicker
                  inDate={
                    cookies().has("date1")
                      ? new Date(cookies().get("date1")!.value)
                      : new Date()
                  }
                />
                <div>
                  {cookies().has("date1")
                    ? cookies().get("date1")!.value
                    : "noval"}

                  <p>is Valid 7 days: {fromCookie().isDateValid7}</p>
                  <p>is Valid 10 Weeks: {fromCookie().isDateValid10Weeks}</p>
                  <p>
                    is Valid 5.5 Months: {fromCookie().isDateValid5dot5Month}
                  </p>
                </div>
              </ClearWin>
            </>
          )}
          {currentStepCookie == 5 && (
            <ClearWin>
              <h1 className="text-3xl font-bold">What Is Your Name?</h1>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                * Required
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstname">First Name *</Label>
                  <Input id="firstname" placeholder="First Name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastname">Last Name *</Label>
                  <Input id="lastname" placeholder="Last Name" />
                </div>
              </div>
            </ClearWin>
          )}
          {currentStepCookie == 6 && (
            <ClearWin>
              <h1 className="text-3xl font-bold">
                When Is Your Date of Birth?
              </h1>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                * Required
              </p>
              <div className="grid min-w-full gap-4 md:min-w-[600px] md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="dob_day">Day</Label>
                  <Select defaultValue="">
                    <SelectTrigger id="dob_day">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, index) => (
                        <SelectItem
                          key={index + 1}
                          value={(index + 1).toString()}
                        >
                          {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dob_month">Month</Label>
                  <Select defaultValue="">
                    <SelectTrigger id="dob_month">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, index) => (
                        <SelectItem
                          key={index + 1}
                          value={(index + 1).toString()}
                        >
                          {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dob_year">Year</Label>
                  <Select defaultValue="">
                    <SelectTrigger id="dob_year">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 100 }, (_, index) => {
                        const year = new Date().getFullYear() - 16 - index;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ClearWin>
          )}
          {currentStepCookie == 7 && (
            <>
              <ClearWin>
                <h1 className="mb-4 text-3xl font-bold">Address</h1>

                <PostCode />
              </ClearWin>
            </>
          )}
          {currentStepCookie == 8 && (
            <>
              <ClearWin>
                <h1 className="mb-4 text-3xl font-bold">Phone</h1>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Your phone must be active in order to proceed.
                </p>

                {cookies().has("storeLocation")
                  ? cookies().get("storeLocation")!.value
                  : "no store location"}
              </ClearWin>
            </>
          )}
          {currentStepCookie == 9 && (
            <RadioGroup defaultValue="" className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem
                  value="card"
                  id="card"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="card"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-8 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <CheckCircleIcon className="mb-3 h-4 w-4" />
                  Yes
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="paypal"
                  id="paypal"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="paypal"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-8 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <XCircleIcon className="mb-3 h-4 w-4" />
                  No
                </Label>
              </div>
            </RadioGroup>
          )}
          Currentstep cookie: {currentStepCookie}
          <div>{headers().get("referer") ?? ""}</div>
          {fromRootCookie("usertoken")}
          {isAlreadySet("step") ? "yes" : "no"}
          <br />
          Current step: <SHOW_STEP />
          <UserNavigator />
          <NextBtn />
          <ResetBtn />
          <div>
            <span className="block text-sm text-gray-500 dark:text-gray-400 sm:text-center">
              *Our partners will work on a no-win-no-fee basis, meaning that you
              will have nothing to pay unless your claim is successful (unless
              you have breached the terms of your agreement). If your claim is
              successful, you will pay a fee of 25% plus VAT, (or a total fee of
              30% including VAT at the current rate) of the amount recovered, a
              fee could be payable for any claim(s) cancelled after the 14-day
              cooling-off period. Fair Pay For All is a trading name of Maddison
              Clarke Ltd. We are a claims management company and may receive a
              payment from our partner law firm, Leigh Day when you become their
              client. This is at no extra cost to you. You have the option to
              make a claim on your own through ACAS and you can bring a claim
              without representation in the employment tribunal but strict time
              limits apply. © 2025 Fair Pay For All | Fair Pay For All is a
              trading style of Maddison Clarke Ltd, Registered In England &
              Wales, Registered Address Wren Nest Business Centre, Wren Nest
              Road, Glossop, Sk13 8Hb. ICO Number Za445087. Maddison Clarke Ltd
              Is a Claims Management Company, Authorised And Regulated By The
              Financial Conduct Authority In Respect Of Claims Management
              Activities. (Authorised Firm Reference Number: 838445)
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function FlagIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}

function XCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
