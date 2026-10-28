export const venue = {
  name: "CHRIST (Deemed to be University) Bangalore Kengeri Campus",
  address: ["Mysore Rd, Kanmanike, Kengeri, Kumbalgodu", "Bengaluru, Karnataka 560074"],
  phone: "080 6268 9800",
  phoneHref: "tel:+918062689800",
  maps: "https://maps.app.goo.gl/TAcuRVJwh8jpgt8WA",
  // From https://christuniversity.in/how-to-reach-bangalore-kengeri-campus
  travel: [
    { from: "Kempegowda Bus Stand (Majestic)", how: "About 27 km by Mysore Road, or bus 226N" },
    { from: "Kempegowda International Airport", how: "About 65 km, Vayu Vajra bus to Satellite Bus Stand, then taxi or bus" },
  ],
  // From bkc.christuniversity.in: crops of its 3838px dawn drone shot, plus its campus-life and lab banners.
  // Labels are alt text only; the grid shows no captions. Each row's spans add up to 12 columns.
  photos: [
    { label: "The academic blocks at sunrise", src: "/images/venue/kengeri-blocks.webp", span: "wide" },
    { label: "Tree-lined paths across the campus", src: "/images/venue/kengeri-paths.webp", span: "narrow" },
    { label: "Students studying under the trees", src: "/images/venue/kengeri-trees.webp", span: "third" },
    { label: "A student working on a model in the architecture studio", src: "/images/venue/kengeri-architecture.webp", span: "third" },
    { label: "A student in the chemistry lab", src: "/images/venue/kengeri-chemistry.webp", span: "third" },
    { label: "Students building an electric bike in the engineering lab", src: "/images/venue/kengeri-lab.webp", span: "narrow" },
    { label: "The campus choir on stage", src: "/images/venue/kengeri-choir.webp", span: "wide" },
    { label: "Students in the FESTO automation lab", src: "/images/venue/kengeri-festo.webp", span: "third" },
    { label: "A student with a laptop under the trees", src: "/images/venue/kengeri-laptop.webp", span: "third" },
    { label: "A researcher in the materials lab", src: "/images/venue/kengeri-materials.webp", span: "third" },
    { label: "Morning mist over the Kengeri campus", src: "/images/venue/kengeri-mist.webp", span: "wide" },
    { label: "A student in the computer lab", src: "/images/venue/kengeri-computers.webp", span: "narrow" },
  ] satisfies { label: string; src: string; span: "wide" | "narrow" | "third" }[],
};
