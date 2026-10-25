export type Campus = { name: string; place: string; url: string; image: string; venue?: true };

// In the order CHRIST lists them. Places follow each campus's "How to reach" page on christuniversity.in.
// Photos: CHRIST's own sites, except Central and Delhi NCR (Wikimedia Commons, CC BY-SA, credited on the
// Venue page) and Pune Lavasa (Wikimedia Commons, CC0).
export const campuses: Campus[] = [
  { name: "Bangalore Central Campus", place: "Hosur Road, Bengaluru", url: "https://christuniversity.in/", image: "/images/campuses/central.webp" },
  { name: "Bangalore Kengeri Campus", place: "Mysore Road, Bengaluru", url: "https://bkc.christuniversity.in/", image: "/images/campuses/kengeri.webp", venue: true },
  { name: "Bangalore Bannerghatta Road Campus", place: "Bannerghatta Road, Bengaluru", url: "https://brc.christuniversity.in/", image: "/images/campuses/bgr.webp" },
  { name: "Bangalore Yeshwanthpur Campus", place: "Yeshwanthpur, Bengaluru", url: "https://byc.christuniversity.in/", image: "/images/campuses/byc.webp" },
  { name: "Pune Lavasa Campus", place: "Lavasa, Pune", url: "https://lavasa.christuniversity.in/", image: "/images/campuses/lavasa.webp" },
  { name: "Delhi NCR Campus", place: "Ghaziabad, Delhi NCR", url: "https://ncr.christuniversity.in/", image: "/images/campuses/ncr.webp" },
];

export const campusCredits = [
  { label: "Central Campus", author: "Rameshng", license: "CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:Christ_University_Hosur_road_Bangalore_4819.JPG" },
  { label: "Delhi NCR Campus", author: "Junaiidfarooq", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:CHRIST(_Deemed_to_be_University),_NCR_Campus.jpg" },
];
