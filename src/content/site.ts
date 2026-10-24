// Source of truth for facts copied from iic2027.christuniversity.in (export of 2026-10-16).
// Em/en dashes from the original copy are rewritten as hyphens or restructured sentences.

export const site = {
  short: "IIC 2027",
  name: "International Interdisciplinary Conference 2027",
  theme: "Mind and Machine: Reimagining Human-AI Collaboration Across Sectors",
  dates: "March 2-3, 2027",
  mode: "Hybrid Mode",
  host: "CHRIST (Deemed to be University)",
  campus: "Bangalore Kengeri Campus",
  url: "https://iic2027.christuniversity.in",
  email: "iic2027@conference.christuniversity.in",
  universityUrl: "https://christuniversity.in/",
  // Original: "...what AI does to us [em dash] and what we, in turn, must do differently."
  tagline:
    "We have asked what AI can do. It is time to ask what AI does to us, and what we, in turn, must do differently.",
  portals: {
    submission:
      "https://script.google.com/macros/s/AKfycbxjsTYQNHrErSHJ5JqY_GcHQhBabrb_rNQDgtYk62odB-LdBNJBXdmaMbXuCEyKyWWE/exec",
    tpc: "https://script.google.com/macros/s/AKfycbwQITCsSGut2rX_sB6yL4yhocx17ctv_w9TY2MHW72B8oQVJKcIJ6aie5Eplzs03fPAvw/exec",
    publicationInterest:
      "https://script.google.com/macros/s/AKfycbzKLM4uEdXARpdxb1QDpgRqgbGW5XqbFVZdrdVOiPhpmBp838xHTCMKQJnObeIfREgK/exec",
  },
} as const;

/**
 * Kengeri campus film looping beside the hero ribbon. Built from assets/ by
 * `node scripts/campus-loop.mjs` (footage only, end card trimmed, seamless crossfade loop, no audio).
 */
export const campusVideo = {
  webm: "/video/kengeri-loop.webm",
  mp4: "/video/kengeri-loop.mp4",
  mp4Small: "/video/kengeri-loop-sm.mp4",
  poster: "/video/kengeri-poster.webp",
} as const;

export type School = { name: string; short: string; url: string; image: string; venueImage: string };

export const organizers: School[] = [
  {
    name: "School of Business & Management",
    short: "Business & Management",
    url: "https://bkc.christuniversity.in/schools/school-of-business-and-management",
    image: "/images/schools/business.webp",
    venueImage: "/images/venue/business.webp",
  },
  {
    name: "School of Psychological Sciences, Education and Social Work",
    short: "Psychological Sciences",
    url: "https://christuniversity.in/schools/school-of-psychological-sciences,-education-and-social-work",
    image: "/images/schools/psychology.webp",
    venueImage: "/images/venue/psychology.webp",
  },
  {
    name: "School of Engineering and Technology",
    short: "Engineering & Technology",
    url: "https://christuniversity.in/schools/school-of-engineering-and-technology",
    image: "/images/schools/engineering.webp",
    venueImage: "/images/venue/engineering.webp",
  },
];

export type NavItem = { label: string; href: string; children?: NavItem[] };

export const nav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about/" },
  {
    label: "Committee",
    href: "/committee/",
    children: [
      { label: "Advisory", href: "/committee/advisory/" },
      { label: "Technical", href: "/committee/technical/" },
      { label: "Organizing", href: "/committee/organizing/" },
      { label: "Publicity", href: "/committee/publicity/" },
    ],
  },
  {
    label: "Thematic Tracks",
    href: "/thematic-tracks/",
    children: [
      { label: "CSE, AI & ML", href: "/thematic-tracks/cse-ai-ml/" },
      { label: "EEE & ME", href: "/thematic-tracks/eee-me/" },
      { label: "BBA", href: "/thematic-tracks/bba/" },
      { label: "Psychology", href: "/thematic-tracks/psychology/" },
    ],
  },
  { label: "Important Dates", href: "/important-dates/" },
  { label: "Submission", href: "/submission/" },
  { label: "Registration", href: "/registration/" },
  { label: "Publication", href: "/publication/" },
  { label: "Venue", href: "/venue/" },
  { label: "Contact", href: "/contact/" },
];

export const about = {
  vision: [
    "The world today is rapidly making space for Artificial intelligence across different sectors. Yet the most pertinent questions about AI are not purely computational but human based. How do individuals, organisations, communities adapt to the intelligent systems? What psychological, ethical, structural, and institutional challenges arise when machines begin to reason, recommend, and act alongside us?",
    "This conference envisions a structured, multi-disciplinary inquiry into the human dimensions of AI across nine academic departments spanning from engineering and design to psychology, business, and the humanities. Rather than treating AI as a domain owned by any single discipline, this event is designed so that every participating department anchors a distinct track, curates its own scholarly community, and contributes original research to a shared intellectual discussion.",
  ],
  rationale: [
    {
      title: "Interdisciplinary legitimacy",
      body: "AI's societal impact cannot be understood through a single lens; this conference models the collaborative approach that would give a well-rounded understanding.",
    },
    {
      title: "Departmental ownership",
      body: "Each department manages its track end-to-end: call for papers, peer review, keynote curation, and publication, building institutional research capacity.",
    },
    {
      title: "Publication output",
      body: "Tracks are designed to produce independently publishable special issues, edited volumes, or indexed proceedings/ISBN, giving every department a concrete research deliverable.",
    },
    {
      title: "Community building",
      body: "Structured networking, cross-track panels, and shared plenaries generate durable inter-departmental research collaborations.",
    },
  ],
};
