"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import {
  fromCookie,
  setSessionCookie,
  isAlreadySet,
} from "@/app/helpers/worker";
function IP() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const forwardedFor = headers().get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headers().get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}

function compareDates(userDate: Date, daysAllow: number): boolean {
  const systemDate = new Date(); // Current system date

  // Make sure userDate is not later than systemDate
  if (userDate > systemDate) {
    return false;
  }

  // Calculate the difference between systemDate and userDate in milliseconds
  const timeDifference = systemDate.getTime() - userDate.getTime();

  // Convert milliseconds to days
  const differenceInDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  // Check if the difference is below daysAllow
  if (differenceInDays <= daysAllow) {
    return true;
  } else {
    return false;
  }
}

const storeSession = async () => {
  try {
    const createdUser = await prisma.leadMeta.create({
      data: {
        ipAddress: IP(),
        browserSpec: headers().get("user-agent") ?? "",
        referer: headers().get("referer") ?? "",
      },
      select: {
        id: true,
      },
    });
    console.log("User created:", createdUser);
    const cookieStore = cookies();

    cookieStore.set({
      name: "uuid",
      path: "/",
      value: createdUser.id,
      expires: Date.now() + 24 * 60 * 60 * 1000, //one day cookie
    });

    return createdUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error; // Re-throw the error to propagate it further if needed
  }
};

/**
 * Navigates to the next page in a multi-step process.
 * Retrieves the current step from a cookie, increments it by 1, and updates the cookie with the new value.
 */

const goToNextPage = async (): Promise<void> => {
  if (isAlreadySet("step")) {
    setSessionCookie("step", fromCookie().step + 1);
  } else {
    setSessionCookie("step", 2);
  }
};

const goToFirstPage = async (): Promise<void> => {
  setSessionCookie("step", 1);
};

const setDate1 = async (inDate: Date): Promise<void> => {
  try {
    const cookieStore = cookies();
    const currentStep = cookieStore.has("date1")
      ? parseInt(cookieStore.get("date1")!.value)
      : 1;

    const userDate = inDate;

    // 7 days
    setSessionCookie(
      "isDateValid7",
      compareDates(userDate, 7) ? "true" : "false"
    );

    // 10 weeks
    setSessionCookie(
      "isDateValid10Weeks",
      compareDates(userDate, 70) ? "true" : "false"
    );

    // 5.5 Months
    setSessionCookie(
      "isDateValid5dot5Month",
      compareDates(userDate, 165) ? "true" : "false"
    );

    cookieStore.set({
      name: "date1",
      path: "/",
      value: inDate.toISOString(),
      expires: Date.now() + 24 * 60 * 60 * 1000, //one day cookie
    });
  } catch (error) {}
};

interface CookieSetter {
  name: string;
  value: string;
}
const setAny = async ({
  name: inName,
  value: inVal,
}: CookieSetter): Promise<void> => {
  try {
    const cookieStore = cookies();

    cookieStore.set({
      name: inName,
      path: "/",
      value: inVal,
      expires: Date.now() + 24 * 60 * 60 * 1000, //one day cookie
    });
  } catch (error) {}
};
const resetCookies = async () => {
  const cookieStore = cookies();

  // Get all cookies and iterate over them to set an expired date
  const allCookies = cookieStore.getAll();
  allCookies.forEach((cookie) => {
    cookieStore.set({
      name: cookie.name,
      path: "/",
      value: "",
      expires: new Date(0),
    });
  });
  //revalidatePath("/funnel/justeat");
};
export {
  storeSession,
  goToNextPage,
  resetCookies,
  setDate1,
  setAny,
  goToFirstPage,
};
