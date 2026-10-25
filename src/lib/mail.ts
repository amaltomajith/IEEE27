const SIGN_OFF = "\n\n\nRegards,\n[Your name]\n[Institution]";

/**
 * Gmail "compose" link with the recipient, subject and a short letter already filled in, so the
 * visitor only has to write their question and press Send. Opens in a new tab.
 */
export function gmailCompose(to: string, subject = "IIC 2027: Enquiry", greeting = "Dear IIC 2027 team,") {
  const q = new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body: greeting + SIGN_OFF });
  return `https://mail.google.com/mail/?${q.toString().replaceAll("+", "%20")}`;
}
