export type Region = "national" | "international";
export type Tier = "early" | "regular";

export type FeeRow = {
  category: string;
  national: Record<Tier, number>;
  international: Record<Tier, number>;
};

export const feeDeadlines: Record<Tier, { label: string; date: string; display: string }> = {
  early: { label: "Early Bird", date: "2027-01-15", display: "Before 15 January 2027" },
  regular: { label: "Regular", date: "2027-01-30", display: "By 30 January 2027" },
};

export const fees: FeeRow[] = [
  { category: "UG / PG Students", national: { early: 3000, regular: 4000 }, international: { early: 100, regular: 150 } },
  { category: "PhD Scholars & Faculty", national: { early: 4000, regular: 5000 }, international: { early: 200, regular: 250 } },
  { category: "Industry", national: { early: 6000, regular: 7000 }, international: { early: 300, regular: 350 } },
  { category: "Attendee / Co-Author", national: { early: 1500, regular: 2000 }, international: { early: 150, regular: 200 } },
];

export const feeNotes = [
  "Registration fees include conference kit, access to all sessions, lunch, and refreshments.",
  "For CHRIST affiliation participants, GST is excluded.",
  "For others, GST will be added appropriately at the time of billing.",
];

export const accommodation =
  "Comfortable accommodation at affordable rates will be available for participants in close proximity to the conference venue. Delegates are encouraged to make their accommodation requests during the registration process to ensure availability.";

export const formatFee = (n: number, region: Region) =>
  region === "national" ? `₹${n.toLocaleString("en-IN")}` : `$${n}`;
