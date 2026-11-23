/** christ: CHRIST-affiliated delegates, national: non-CHRIST Indian delegates, international: foreign delegates. */
export type Region = "christ" | "national" | "international";
export type Tier = "early" | "regular";

export type FeeRow = {
  category: string;
  /** One flat rate for CHRIST-affiliated delegates, with no early bird tier; null where the category does not apply. */
  christ: number | null;
  national: Record<Tier, number>;
  international: Record<Tier, number>;
};

export const regions: { v: Region; label: string; short: string }[] = [
  { v: "christ", label: "CHRIST-Affiliated", short: "CHRIST" },
  { v: "national", label: "Non-CHRIST (INR)", short: "Non-CHRIST" },
  { v: "international", label: "Foreign (USD)", short: "Foreign" },
];

export const feeDeadlines: Record<Tier, { label: string; date: string; display: string }> = {
  early: { label: "Early Bird", date: "2027-01-15", display: "Before 15 January 2027" },
  regular: { label: "Regular", date: "2027-01-30", display: "Before 30 January 2027" },
};

export const fees: FeeRow[] = [
  { category: "UG / PG Students", christ: 1000, national: { early: 1000, regular: 3000 }, international: { early: 100, regular: 150 } },
  { category: "Faculty / PhD Scholars", christ: 1500, national: { early: 2000, regular: 4000 }, international: { early: 200, regular: 250 } },
  { category: "Industry", christ: null, national: { early: 5000, regular: 6000 }, international: { early: 300, regular: 350 } },
  { category: "Attendee", christ: 500, national: { early: 1000, regular: 1500 }, international: { early: 150, regular: 200 } },
];

export const feeFor = (f: FeeRow, region: Region, tier: Tier): number | null =>
  region === "christ" ? f.christ : f[region][tier];

export const feeNotes = [
  "Registration fees include conference kit, access to all sessions, lunch, and refreshments.",
  "For CHRIST affiliation participants, GST is excluded.",
  "For others, GST will be added appropriately at the time of billing.",
  "Only registered participants will be provided certificates.",
];

export const accommodation =
  "Comfortable accommodation at affordable rates will be available for participants in close proximity to the conference venue. Delegates are encouraged to make their accommodation requests during the registration process to ensure availability.";

export const formatFee = (n: number, region: Region) =>
  region === "international" ? `$${n}` : `₹${n.toLocaleString("en-IN")}`;
