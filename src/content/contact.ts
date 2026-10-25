import { site } from "./site";

export type Contact = { topic: string; name?: string; email: string };

// Registration, Sponsorship, Collaboration, Exhibition, Visa and Travel and
// Venue Guidance are listed on the source page without a named contact, so they
// route to the conference inbox.
export const contacts: Contact[] = [
  { topic: "Submission", name: "Dr Bhuvana Jayabalan", email: "bhuvana.jayabalan@christuniversity.in" },
  { topic: "Publications", name: "Dr Ambili Jayachandran", email: "ambili.jayachandran@christuniversity.in" },
  { topic: "Accommodation", name: "Dr Manikandan P", email: "manikandan.p@christuniversity.in" },
];

export type Convener = { name: string; phone: string; tel: string };

// From the conference poster's "Conference Conveners" panel.
export const conveners: Convener[] = [
  { name: "Dr Ambili Jayachandran", phone: "+91 97444 90632", tel: "tel:+919744490632" },
  { name: "Dr Bhuvana Jayabalan", phone: "+91 90474 30020", tel: "tel:+919047430020" },
];

export const generalTopics = ["Registration", "Sponsorship", "Collaboration", "Exhibition", "Visa and Travel", "Venue Guidance"];

export const conferenceEmail = site.email;
