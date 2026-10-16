import { site } from "./site";

export type Contact = { topic: string; name?: string; email: string };

// Registration, Sponsorship, Collaboration, Exhibition, Visa and Travel and
// Venue Guidance are listed on the source page without a named contact, so they
// route to the conference inbox.
export const contacts: Contact[] = [
  { topic: "Submission", name: "Dr Varaprasad Janamala", email: "varaprasad.janamala@christuniversity.in" },
  { topic: "Publications", name: "Dr Varaprasad Janamala", email: "varaprasad.janamala@christuniversity.in" },
  { topic: "Accommodation", name: "Dr Manikandan P", email: "manikandan.p@christuniversity.in" },
];

export const generalTopics = ["Registration", "Sponsorship", "Collaboration", "Exhibition", "Visa and Travel", "Venue Guidance"];

export const conferenceEmail = site.email;
