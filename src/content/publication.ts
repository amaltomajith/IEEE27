// Source: iic2027.christuniversity.in/publication and refs/Publication page details.docx (they agree).
// Both say "TCP peer review"; that is a typo for the Technical Programme Committee (TPC) and is corrected here.
export const publication = {
  title: "Open Access Scopus-Indexed Journal Publication",
  description:
    "Natural Sciences and Applied Technology (NSAT), a Scopus-indexed journal, is the Publication Partner for IIC 2027. Special Issue details, charges and the Publication Chair.",
  partner: {
    journal: "Natural Sciences and Applied Technology",
    abbr: "NSAT",
    website: "https://www.insat-res.in/journal-nsat",
    scopus: "https://www.scopus.com/sourceid/21101439289",
    logo: "/images/brand/insat-logo.webp",
    logoAlt: "Seal of the Institute of Natural Sciences and Applied Technology, Kolkata, India",
  },
  specialIssue: {
    title: "Advances in Artificial Intelligence for Cross-Domain Applications",
    body: "Selected research contributions from the conference presentation may be considered for publication in the dedicated Special Issue, subject to:",
    conditions: ["Editorial screening", "TPC peer review", "Publication ethics requirements", "Final acceptance by the journal"],
  },
  charges: {
    apc: { label: "Article Processing Charge (APC)", amount: "USD 100", approx: "~ INR 10,000", unit: "per accepted paper" },
    latex: { label: "LaTeX Formatting Service", amount: "INR 2,000", extra: "+ applicable GST", unit: "if required" },
  },
  interest:
    "Authors who wish to be considered for the APC-based Open Access publication track are requested to formally communicate their interest to the Publication Chair.",
  // The live page and the Word doc name Dr Varaprasad Janamala; Dr Ambili Jayachandran is kept here on request.
  chair: {
    name: "Dr Ambili Jayachandran",
    // One line each, so the affiliation breaks between its parts and never mid-name.
    role: [
      "Assistant Professor, Department of Business and Management",
      "School of Business and Management",
      "CHRIST (Deemed to be University), Bangalore Kengeri Campus",
    ],
    email: "ambili.jayachandran@christuniversity.in",
  },
};
