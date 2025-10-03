import { cookies } from "next/headers";
function fromCookie() {
  const cookieStore = cookies();
  return cookieStore.has("userSession")
    ? JSON.parse(cookieStore.get("userSession")!.value)
    : {};
}

function fromRootCookie(name: string) {
  const cookieStore = cookies();
  return cookieStore.has(name) ? cookieStore.get(name)!.value : "";
}

function setSessionCookie(name: string, val: any) {
  try {
    const cookieStore = cookies();
    const originalObject = fromCookie();
    const currentStep = originalObject[name]
      ? parseInt(originalObject[name])
      : "";
    const newData = val;

    const updatedObject = { ...originalObject };
    updatedObject[name] = newData;

    cookieStore.set({
      name: "userSession",
      path: "/",
      value: JSON.stringify(updatedObject),
      expires: Date.now() + 24 * 60 * 60 * 1000, //one day cookie
    });
  } catch (error) {}
}

function isAlreadySet(name: string): boolean {
  return fromCookie()[name] !== null && fromCookie()[name] !== undefined;
}

export { fromCookie, fromRootCookie, setSessionCookie, isAlreadySet };
