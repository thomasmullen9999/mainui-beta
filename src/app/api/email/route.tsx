import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Validate the email format
    if (typeof email !== "string" || email.length === 0) {
      throw new Error("Invalid email format");
    }

    if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) === false) {
      return NextResponse.json(
        {
          debounce: {
            email: email,
            send_transactional: 0,
          },
          success: "1",
          balance: "1000",
        },
        { status: 200 }
      );
    }

    try {
      //main
      const debounceAPIRequest = await fetch(
        `https://api.debounce.io/v1/?email=${email}&api=${process.env.DEBOUNCE_APIKEY}`,
        {
          headers: {},
        }
      );

      if (!debounceAPIRequest.ok) {
        throw new Error("Fallback API (Debounce) failed");
      }

      const fallbackJson = await debounceAPIRequest.json();
      return NextResponse.json(fallbackJson, { status: 200 });
    } catch (error) {
      console.error("Main API call failed, fallback email validation API...");

      // fallback
      const abstractAPIRequest = await fetch(
        `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_APIKEY}&email=${email}`
      );

      if (!abstractAPIRequest.ok) {
        throw new Error("Main API failed");
      }

      const mainJson = await abstractAPIRequest.json();
      const check_code =
        mainJson.autocorrect == "" &&
        mainJson.deliverability === "DELIVERABLE" &&
        mainJson.is_valid_format.value === true &&
        mainJson.is_disposable_email.value === false &&
        mainJson.is_mx_found.value === true &&
        mainJson.is_smtp_valid.value === true
          ? "5"
          : "0";
      const transformedJson = {
        debounce: {
          email: mainJson.email,
          code: check_code,
          role: mainJson.is_role_email.value.toString(),
          free_email: mainJson.is_free_email.value.toString(),
          result:
            mainJson.deliverability === "DELIVERABLE"
              ? "Safe to Send"
              : "Not Safe",
          reason:
            mainJson.deliverability === "DELIVERABLE"
              ? "Deliverable"
              : "Undeliverable",
          send_transactional: 1,

          did_you_mean: mainJson.autocorrect || "",
        },
        success: "1",
        balance: "1000",
      };

      return NextResponse.json(transformedJson, { status: 200 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Email validation Error" },
      { status: 500 }
    );
  }
}
