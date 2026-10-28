import type { Track } from "./tracks";

export type Member = {
  name: string;
  role?: string;
  org?: string;
  place?: string;
  url?: string;
  photo?: string;
};

export type Group = { title: string; scope?: "International" | "National" | "Industry"; members: Member[] };

// CHRIST members link to their CHRIST profile pages; portraits are the photos on those pages where one is larger than ours.
export const mentors: Member[] = [
  { name: "Dr Fr Joseph C C", role: "Vice Chancellor", org: "CHRIST University", photo: "/images/people/joseph-cc.webp", url: "https://christuniversity.in/vc" },
  { name: "Dr Fr Jiby Jose", role: "Director, School of Engineering and Technology", org: "CHRIST University", photo: "/images/people/jiby-jose.webp", url: "https://christuniversity.in/Sciences%20and%20Humanities%20(Engineering)/faculty-details/MzI2Ng==/OTU=" },
  { name: "Fr Shijin P J", role: "Associate Director, School of Engineering and Technology", org: "CHRIST University", photo: "/images/people/shijin-pj.webp", url: "https://christuniversity.in/civil/faculty-details/Njc1OA==/ODQ=" },
];

export const generalChairs: Member[] = [
  { name: "Dr Raghunandan Kumar", role: "Dean, School of Engineering and Technology", org: "CHRIST University", photo: "/images/people/raghunandan-kumar.webp", url: "https://christuniversity.in/dept/faculty-details/NzIx/ODQ=" },
  { name: "Dr Jain Mathew", role: "Dean, School of Business and Management", org: "CHRIST University", photo: "/images/people/jain-mathew.webp", url: "https://christuniversity.in/dept/faculty-details/OTY=/MzAx" },
  { name: "Dr Anuradha R", role: "HoD, School of Business and Management", org: "CHRIST University", photo: "/images/people/anuradha-r.webp", url: "https://christuniversity.in/dept/faculty-details/MjA2NA==/MzAx" },
  { name: "Dr Mary Anita E A", role: "Associate Dean, School of Engineering and Technology", org: "CHRIST University", photo: "/images/people/mary-anita.webp", url: "https://christuniversity.in/dept/faculty-details/NDc1NQ==/Nzk=" },
];

export const advisory: Group[] = [
  {
    title: "International Advisory Board",
    scope: "International",
    members: [
      // Source links this name to an ISBAT profile of a different person; link omitted.
      { name: "Dr Ganesan Palanisamy", role: "Professor and Dean, Faculty of Graduate Studies and Research", org: "ISBAT University", place: "Kampala, Uganda" },
      { name: "Prof Dr Cyril Adonis", role: "Associate Professor, Department of Psychology", org: "University of South Africa", place: "South Africa", url: "https://www.unisa.ac.za/sites/corporate/default/Colleges/Human-Sciences/Schools,-departments,-centres,-institutes-&-units/School-of-Social-Sciences/Department-of-Psychology/Staff-members/Professor-Cyril-Adonis" },
      { name: "Prof Dr Patricia M. Greenfield", role: "Distinguished Professor, Department of Psychology", org: "University of California, Los Angeles", place: "USA", url: "https://www.psych.ucla.edu/faculty-page/pmgreen/" },
      { name: "Prof Dr Jeffrey Moore", role: "Professor, College of Business and Economics", org: "Anderson University", place: "USA", url: "https://andersonuniversity.edu/faculty_profile/jeffrey-moore/" },
      { name: "Dr Jeong-Hoi Koo", role: "Professor", org: "Miami University", place: "Oxford, OH, USA", url: "https://miamioh.edu/profiles/cec/jeong-hoi-koo.html" },
      { name: "Mr Joby Babu", role: "Vice President, Forward Deployed Engineering & Customer Success", place: "United States", url: "https://www.linkedin.com/in/jobybabu/" },
      { name: "Dr Makesh Karuppiah", role: "Senior Scientist", org: "EnviroApps", place: "USA", url: "https://www.linkedin.com/in/makesh/" },
    ],
  },
  {
    title: "Industry Advisory Board",
    scope: "Industry",
    members: [
      { name: "Dr Kathiresan Velayutham", role: "Technical Specialist", org: "HCL Tech", place: "Bengaluru, Karnataka", url: "https://www.linkedin.com/in/dr-kathiresan-velayutham-59770376/" },
      { name: "Mr Subarna Panda", role: "Assistant Manager", org: "KPMG India", place: "Bengaluru, Karnataka", url: "https://www.linkedin.com/in/subarna-panda-584587256/" },
      // Source spells "Consultatnt".
      { name: "Mr Deepak Chavan", role: "Consultant", org: "Jolly Clamps", place: "Mumbai Metropolitan Region", url: "https://www.linkedin.com/in/deepak-chavan-32322214/" },
      { name: "Mr S. Purushothaman", role: "AVP, Innovation, Process & Technology Development", org: "iSolve Technologies Pvt Ltd", place: "India" },
    ],
  },
  {
    title: "National Advisory Board",
    scope: "National",
    members: [
      { name: "Dr Asokan Thondiyath", role: "HoD and Professor, Department of Engineering Design", org: "IIT Madras", place: "Chennai", url: "https://ed.iitm.ac.in/~asokan/" },
      { name: "Dr A. Sivakumar", role: "Professor", org: "VIT Vellore", place: "Vellore" },
      // Source: "Dr..Domnic S".
      { name: "Dr Domnic S", role: "Professor, Director", org: "National Institute of Technology, Trichy", place: "Tiruchirappalli", url: "https://www.nitt.edu/home/academics/departments/ca/facultymca/domnic/" },
      { name: "Dr R. Thangarajan", role: "Professor, Department of Information Technology", org: "Kongu Engineering College", place: "Tamil Nadu", url: "https://hece.kongu.edu/contact.php" },
      { name: "Dr Pamela Vinitha Eric", role: "Professor & HoD-AIML", org: "NMIT, Nitte Deemed University", place: "Bengaluru", url: "https://nitte.edu.in/nmit/btech-in-artificialintelligence-and-machinelearning.php#Faculty" },
      { name: "Dr Clara Kanmani A", role: "Professor", org: "Mangalore Institute of Technology and Engineering", place: "Mangalore", url: "https://mite.ac.in/member/dr-clara-kanmani-a/" },
      { name: "Prof Dr K. Thiyagu", role: "Associate Professor", org: "Central University of Karnataka", place: "Periye, Kasaragod", url: "https://schools.cukerala.ac.in/Dept/Faculty_Preview?Id=107" },
      { name: "Prof Dr K. N. Jayakumar", role: "Professor, Department of Psychology", org: "Periyar University", place: "Salem, Tamil Nadu", url: "https://faculty.periyaruniversity.ac.in/faculty/profile?id=121" },
      { name: "Dr Rekha K S", role: "Professor, Computer Science & Engineering", org: "JSS Science and Technology University", place: "Mysuru" },
    ],
  },
];

export const tpcIntro =
  "We invite distinguished academicians, researchers, industry professionals, and practitioners to join the Technical Programme Committee (TPC) of the IIC 2027";

const ORC = "https://orcid.org/";
const SCH = "https://scholar.google.com/citations?hl=en&user=";
const SCO = "https://www.scopus.com/authid/detail.uri?authorId=";

export const technical: Group[] = [
  {
    title: "International Technical Programme Committee",
    scope: "International",
    members: [
      { name: "Dr Mohd Afjal", role: "Assistant Professor, College of Economics and Management", org: "Al Qasimia University", place: "United Arab Emirates", url: SCH + "wuh62tgAAAAJ" },
      { name: "Dr Anwar Basha Haffishthullah", role: "Senior Lecturer", org: "INTI International University", place: "Nilai, Malaysia", url: SCH + "qvU8kgoAAAAJ" },
      { name: "Dr Abdellatif Hraich", role: "Professor, National School of Applied Sciences", org: "Abdelmalek Essaadi University", place: "Tetouan, Morocco", url: ORC + "0009-0007-5341-533X" },
      { name: "Dr Ikram El Haji", role: "Professor", org: "Higher National School of Mines", place: "Rabat, Morocco", url: SCO + "59219699800" },
      // Source spells "Professer".
      { name: "Dr Mohamed Hamdaoui", role: "Professor", org: "Université Moulay Ismail de Meknes", place: "Meknes, Morocco", url: ORC + "0009-0008-9063-0984" },
      { name: "Dr Ravi Samikannu", role: "Associate Professor", org: "Botswana International University of Science and Technology", place: "Palapye, Botswana", url: ORC + "0000-0002-6945-6562" },
      { name: "Dr Sivaram Murugan", role: "Professor", org: "Sivas Bilim Ve Teknoloji Üniversitesi", place: "Sivas, Türkiye", url: ORC + "0000-0001-6103-0789" },
    ],
  },
  {
    title: "National Technical Programme Committee",
    scope: "National",
    members: [
      { name: "Dr C. Ganeshkumar", role: "Associate Professor, School of Management Studies", org: "University of Hyderabad", place: "Telangana", url: SCH + "SXly7KQAAAAJ" },
      { name: "Dr Kishore Kumar Pedapenki", role: "Professor and Dean IQAC, Dean R&D", org: "Audisankara (Deemed to be University)", place: "Andhra Pradesh", url: ORC + "0000-0002-4192-5101" },
      { name: "Prof Dr G Naveen", role: "HoD, Electrical and Electronics Engineering", org: "Joginpally B R Engineering College", place: "Hyderabad, Telangana", url: ORC + "0009-0004-8176-3911" },
      { name: "Dr Praveena Anaji", role: "Assistant Professor, Electrical and Electronics Engineering", org: "Jain Institute of Technology", place: "Karnataka", url: SCO + "60170976400" },
      { name: "Dr Divya V", role: "Assistant Professor", org: "University College of Engineering, Thiruvarur", place: "Nagapattinam, Tamil Nadu", url: ORC + "0000-0003-2249-7591" },
      { name: "Dr Mithun B N", role: "Professor and Head", org: "APS College of Engineering", place: "Bengaluru, Karnataka", url: "https://www.scopus.com/pages/authors/58660224200" },
      { name: "Dr Rekha K. S", role: "Professor", org: "JSS Science and Technology University", place: "Mysuru, Karnataka", url: "https://www.scopus.com/pages/authors/57907454300" },
      { name: "Dr K R Prakash", role: "Professor", org: "National Institute of Engineering", place: "Mysore, Karnataka", url: "https://www.scopus.com/pages/authors/57201947259" },
      { name: "Dr Sagar B S", role: "Assistant Director, IQAC & Assistant Professor", org: "REVA University", place: "Bengaluru, Karnataka", url: "https://www.reva.edu.in/school-member/sagar-b-s" },
      { name: "Dr Ankur Sisodia", role: "Assistant Professor", org: "Noida Institute of Engineering and Technology", place: "Greater Noida, Uttar Pradesh", url: ORC + "0000-0002-2253-0382" },
      { name: "Dr Sonali Vijay Shinkar", role: "Assistant Professor", org: "SCTR's Pune Institute of Computer Technology", place: "Pune, Maharashtra", url: ORC + "0000-0002-8873-4708" },
      { name: "Dr D. Chandra Sekhar", role: "Associate Professor", org: "Vidya Jyothi Institute of Technology (Autonomous)", place: "Hyderabad, Telangana", url: ORC + "0000-0003-4222-8946" },
      { name: "Dr P. Selvaraj", role: "Professor", org: "Dr. M.G.R. Educational and Research Institute (Deemed to be University)", place: "Chennai, Tamil Nadu", url: SCO + "57211320537" },
      { name: "Dr M. Gayathri", role: "Assistant Professor", org: "SCSVMV Deemed University", place: "Kancheepuram, Tamil Nadu", url: ORC + "0009-0005-2451-9629" },
      { name: "Dr Shekhar", role: "Professor & Head", org: "Alliance University", place: "Bengaluru, Karnataka", url: SCO + "59971801900" },
      { name: "Dr Bhupesh Kumar Namdeti", role: "Professor", org: "Vidya Jyothi Institute of Technology", place: "Hyderabad, Telangana", url: ORC + "0009-0007-1652-7711" },
      { name: "Dr Ravikant Nanwatkar", role: "Assistant Professor", org: "D.Y. Patil College of Engineering, Akurdi, Savitribai Phule Pune University", place: "Pune, Maharashtra", url: ORC + "0000-0002-4842-7455" },
      { name: "Dr Srikanth Goud B", role: "Associate Professor", org: "Anurag University", place: "Hyderabad, Telangana", url: ORC + "0000-0002-5107-9738" },
      { name: "Dr Saleem S Tevaramani", role: "Assistant Professor", org: "K S Institute of Technology", place: "Bengaluru, Karnataka", url: SCH + "ti3l0TEAAAAJ" },
      { name: "Prof Dr Satish Muppidi", role: "Professor", org: "GMR Institute of Technology (Deemed to be University)", place: "Andhra Pradesh", url: ORC + "0000-0003-1714-1769" },
      { name: "Dr Nandish B M", role: "Associate Professor", org: "Jain Institute of Technology", place: "Bengaluru, Karnataka", url: ORC + "0000-0001-5956-0545" },
      { name: "Dr Mallikarjunaswamy S", role: "Professor and Chief Executive", org: "JSS Academy of Technical Education", place: "Bengaluru, Karnataka", url: "https://www.linkedin.com/in/dr-mallikarjunaswamy-s-777b3421/" },
      { name: "Dr Rajesh Panda", role: "Assistant Professor", org: "Sri Sivasubramaniya Nadar College of Engineering", place: "Chennai, Tamil Nadu", url: "https://www.ssn.edu.in/electrical-and-electronics-engineering-department/faculty/dr-rajesh-panda-assistant-professor/" },
      { name: "Dr Hima Bindu Eluri", role: "Associate Professor", org: "Geethanjali College of Engineering and Technology", place: "Keesara, Telangana", url: ORC + "0000-0003-2283-4455" },
      { name: "Dr D. Krishna", role: "Associate Professor", org: "Anurag University", place: "Hyderabad, Telangana", url: ORC + "0000-0001-9834-0254" },
      { name: "Dr T. Chandra Shekar", role: "Associate Professor", org: "MVSR Engineering College", place: "Hyderabad, Telangana", url: ORC + "0000-0003-1720-5160" },
      { name: "Dr Prajwala TR", role: "Associate Professor", org: "PES University", place: "Bengaluru, Karnataka", url: ORC + "0000-0003-0453-3616" },
      { name: "Dr Ushus Maria Joseph", role: "Associate Professor", org: "Mar Baselios Christian College of Engineering and Technology", place: "Kuttikkanam, Kerala", url: SCO + "57903180900" },
      { name: "Dr Sreenath M V", role: "Associate Professor", org: "Nitte University, Bengaluru Campus", place: "Karnataka", url: ORC + "0009-0008-0672-4778" },
      { name: "Dr M Sarfraz", role: "Associate Professor", org: "Aligarh Muslim University", place: "Aligarh, Uttar Pradesh", url: ORC + "0000-0002-5586-3546" },
      { name: "Dr Annie Chacko", role: "Associate Professor", org: "MBC College of Engineering and Technology", place: "Peermade, Idukki, Kerala", url: ORC + "0009-0003-8749-7397" },
      { name: "Dr S Karthik", role: "Dean CSE", org: "SNS College of Technology", place: "Coimbatore, Tamil Nadu", url: "https://www.linkedin.com/in/dr-s-karthik-b2034a8a/" },
      { name: "Mr Farhan Raza Rizvi", role: "Assistant Professor", org: "Noida Institute of Engineering and Technology", place: "Uttar Pradesh", url: SCO + "58134531700" },
      { name: "Mr Darshith", role: "Senior Hardware Engineer", org: "Moonrider", url: SCO + "59725490000" },
      { name: "Ms Nivedha M", role: "Faculty", org: "SASTRA University", place: "Tamil Nadu", url: ORC + "0009-0003-7152-6675" },
      { name: "Mr Shaik Khadarvali", role: "Assistant Professor", org: "K.S.R.M. College of Engineering", place: "Kadapa, Andhra Pradesh", url: ORC + "0000-0002-4252-4211" },
    ],
  },
];

const CU = "https://christuniversity.in/";

export const coreOrganizing: Member[] = [
  { name: "Dr Sunanda Vincent Jaiwant", photo: "/images/people/sunandha-vincent-jaiwant.webp", url: CU + "dept/faculty-details/MzEyMg==/MzAx" },
  { name: "Dr Bhuvana Jayabalan", photo: "/images/people/bhuvana-jayabalan.webp", url: CU + "computer-science/faculty-details/ODQzNA==/NjI=" },
  { name: "Dr Ambili Jayachandran", photo: "/images/people/ambili-jayachandran.webp", url: "https://bkc.christuniversity.in/business-and-management/faculty-details/MTAzNTg=/MzAx" },
];

const PH = "/images/people/";

// Names follow each member's CHRIST faculty page; photos are taken from the same pages.
export const trackCommittee: Record<Track["slug"], Member[]> = {
  "cse-ai-ml": [
    { name: "Dr Sincy John", role: "Assistant Professor", org: "Computer Science and Engineering", photo: PH + "sincy-john.webp", url: "https://bkc.christuniversity.in/computer-science-and-engineering/faculty-details/OTYwNQ==/Nzk=" },
    { name: "Dr Alpha Vijayan", role: "Assistant Professor", org: "Artificial Intelligence and Data Science Engineering", photo: PH + "alpha-vijayan.webp", url: CU + "ai-and-data-science-engineering/faculty-details/ODU4Ng==/OTY=" },
  ],
  "eee-me": [
    { name: "Dr Varaprasad Janamala", role: "Associate Professor", org: "Electrical and Electronics Engineering", photo: PH + "varaprasad-janamala.webp", url: CU + "electrical-and-electronics-engineering/faculty-details/MTQ2Nw==/ODA=" },
    { name: "Dr Umesh V", role: "Associate Professor", org: "Mechanical and Automobile Engineering", photo: PH + "umesh-v.webp", url: CU + "mechanical-and-automobile-engineering/faculty-details/MTk0Nw==/ODM=" },
  ],
  bba: [
    { name: "Dr Muthulakshmi P", role: "Assistant Professor", org: "Business and Management", photo: PH + "muthulakshmi-p.webp", url: "https://m.christuniversity.in/dept/faculty-details/ODc3NA==/MzAx" },
    { name: "Dr Ramya J B", role: "Assistant Professor", org: "Business and Management", photo: PH + "ramya-jb.webp", url: CU + "business-and-management/faculty-details/OTU0MQ==/MzAx" },
  ],
  psychology: [
    { name: "Dr Sujatha", role: "Assistant Professor", org: "Psychology", photo: PH + "sujatha.webp", url: "https://m.christuniversity.in/dept/faculty-details/ODU3Mw==/NzAx" },
    { name: "Dr Abhishek Prasad", role: "Assistant Professor", org: "Psychology", photo: PH + "abhishek-prasad.webp", url: CU + "psychology/faculty-details/ODk4NQ==/NzAx" },
  ],
};

export const publicity = {
  team: "Publicity Team",
  social: "Social Media Team",
  socialOrg: "Bachelor of Business Administration, Bangalore Kengeri Campus",
};
