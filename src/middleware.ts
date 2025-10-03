import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function generateRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Generating a random string of length 30

export function middleware(request: NextRequest) {
  // Assume a "Cookie:nextjs=fast" header to be present on the incoming request
  // Getting cookies from the request using the `RequestCookies` API
  let cookie = request.cookies.get("usertoken");
  //console.log("new1", cookie); // => { name: 'nextjs', value: 'fast', Path: '/' }
  //   const allCookies = request.cookies.getAll();
  //   console.log("new2", allCookies); // => [{ name: 'nextjs', value: 'fast' }]

  //   request.cookies.has("nextjs"); // => true
  //   request.cookies.delete("nextjs");
  //   request.cookies.has("nextjs"); // => false

  const response = NextResponse.next();
  // if (!request.cookies.has("usertoken")) {
  //response.cookies.set("usertoken", generateRandomString(30));
  response.cookies.set({
    name: "usertoken",
    value: generateRandomString(30),
    path: "/",
  });
  // }
  // console.log(response.cookies.get("usertoken"));
  //   response.cookies.set({
  //     name: "vercel",
  //     value: "fast",
  //     path: "/",
  //   });
  //   cookie = response.cookies.get("vercel");
  //   console.log("new3", cookie); // => { name: 'vercel', value: 'fast', Path: '/' }

  return response;
}

export const config = {
  matcher: "/p/:path*",
};
