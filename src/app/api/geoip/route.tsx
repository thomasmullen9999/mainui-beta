import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import postcodes from "@/data/postcodes.json"; // Adjust the path as per your project structure
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    0.5 -
    Math.cos(dLat) / 2 +
    (Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      (1 - Math.cos(dLon))) /
      2;
  return R * 2 * Math.asin(Math.sqrt(a));
}
function IP() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const forwardedFor = headers().get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headers().get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}
export async function GET(req: NextRequest) {
  const headers = req.headers;
  const latitude = parseFloat(headers.get("x-vercel-ip-latitude") || "");
  const longitude = parseFloat(headers.get("x-vercel-ip-longitude") || "");

  let zipcode = "";

  if (latitude && longitude) {
    const nearestZipcode = postcodes.reduce((prev, curr) => {
      const prevDistance = getDistance(
        latitude,
        longitude,
        prev.latitude,
        prev.longitude
      );
      const currDistance = getDistance(
        latitude,
        longitude,
        curr.latitude,
        curr.longitude
      );
      return currDistance < prevDistance ? curr : prev;
    });
    zipcode = nearestZipcode.zipcode;
  }
  const geoHeaders = {
    "x-vercel-ip-country": headers.get("x-vercel-ip-country") || "",
    "x-vercel-ip-country-region":
      headers.get("x-vercel-ip-country-region") || "",
    "x-vercel-ip-country-region-code":
      headers.get("x-vercel-ip-country-region-code") || "",
    "x-vercel-ip-city": headers.get("x-vercel-ip-city") || "",
    "x-vercel-ip-city-lat-long": headers.get("x-vercel-ip-city-lat-long") || "",
    "x-vercel-ip-latitude": headers.get("x-vercel-ip-latitude") || "",
    "x-vercel-ip-longitude": headers.get("x-vercel-ip-longitude") || "",
    "x-vercel-ip-timezone": headers.get("x-vercel-ip-timezone") || "",
    ja4: headers.get("x-vercel-ja4-digest") || "",
    "x-real-ip": IP(),
    zipcode: zipcode,
  };

  return NextResponse.json(geoHeaders);
}
