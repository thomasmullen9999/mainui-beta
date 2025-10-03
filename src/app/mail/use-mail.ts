import { atom, useAtom } from "jotai";

import { MailData, mails } from "@/app/mail/data";

type Config = {
  selected: MailData["id"] | null;
};

const configAtom = atom<Config>({
  selected: mails[0].id,
});

export function useMail() {
  return useAtom(configAtom);
}
