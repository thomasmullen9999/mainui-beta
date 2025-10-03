// utils.tsx
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

const getLondonTime = () => {
  return dayjs().tz("Europe/London").format("DD/MM/YYYY HH:mm:ss");
};

const calculateAge = (dateString: string) => {
  const today = dayjs();
  const birth = dayjs(dateString);
  const age = today.diff(birth, "year");

  return age;
};

const trimDateString = (dateStr: string) => {
  const match = dateStr.match(
    /^[A-Za-z]{3} [A-Za-z]{3} \d{2} \d{4} \d{2}:\d{2}:\d{2}/
  );
  return match ? match[0] : dateStr;
};

const calculateDayDistances = (dateString: string) => {
  const testifyDate = new Date(dateString);

  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - testifyDate.getTime();
  const dayDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

  if (timeDifference < 0) {
    return 99999;
  }
  return dayDifference;
};

const getSubDomain = (req: { headers: { host?: string } }): string | null => {
  if (!req) return null;

  let host = req.headers.host; // Get the host from request headers
  if (!host) return null;

  let parts = host.split(".");
  if (parts.length < 3) return null; // No subdomain present

  return parts[0]; // Return the first part (subdomain)
};

export {
  calculateDayDistances,
  calculateAge,
  getSubDomain,
  getLondonTime,
  trimDateString,
};
