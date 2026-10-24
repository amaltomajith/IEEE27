import { site } from "./site";

export type Contact = { topic: string; name?: string; email: string };

// Registration, Sponsorship, Collaboration, Exhibition, Visa and Travel and
// Venue Guidance are listed on the source page without a named contact, so they
// route to the conference inbox.
export const contacts: Contact[] = [
  // Dr Ambili Jayachandran's own address is to follow; until then her topics route to the conference inbox.
  { topic: "Submission", name: "Dr Ambili Jayachandran", email: site.email },
  { topic: "Publications", name: "Dr Ambili Jayachandran", email: site.email },
  { topic: "Accommodation", name: "Dr Manikandan P", email: "manikandan.p@christuniversity.in" },
];

export const generalTopics = ["Registration", "Sponsorship", "Collaboration", "Exhibition", "Visa and Travel", "Venue Guidance"];

export const conferenceEmail = site.email;
