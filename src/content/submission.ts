export const abstractOption = {
  title: "Extended Abstract",
  deadline: "October 20, 2026",
  wordLimit:
    "The extended abstract should be limited to 1,500 words, excluding the title, author details, keywords, and references.",
  formatting:
    "The document should use Times New Roman 12pt or Calibri 11pt, with 1.5 line spacing and 1-inch margins in a single-column layout. Authors may include a maximum of one to two tables or figures, and only where essential to the argument. The final file should be submitted as a Word (.docx) and should include references formatted in APA style, which are not counted toward the word limit.",
  sections: [
    { name: "Introduction and Literature Review", words: 400, body: "Sets up the problem context, briefly surveys relevant prior work, and identifies the gap the study addresses." },
    { name: "Objective or Research Question", words: 100, body: "Clearly states the aim of the study in direct relation to that gap." },
    { name: "Methodology", words: 300, body: "Describes the research design, data source or sample, and the analytical technique or model used. Kept brief, since fuller detail will appear in the final paper." },
    { name: "Key Findings or Expected Results", words: 350, body: "Presents the main results (or anticipated results, if the work is still in progress) and highlights what is novel about them." },
    { name: "Implications and Conclusion", words: 250, body: "Addresses the theoretical and practical implications of the work, particularly for human-AI collaboration, and offers a brief concluding statement." },
    { name: "Transitions and framing", words: 100, body: "A buffer for transitions and framing between sections, bringing the total to 1,500 words." },
  ],
};

export const manuscriptOption = {
  title: "Full Manuscript",
  deadline: "December 1, 2026",
  intro:
    "Authors are requested to prepare their manuscripts formally according to the following guidelines. Manuscripts that do not comply with the prescribed format may be returned for revision before the review process.",
  formatting: [
    ["Paper Size", "A4 (210 mm × 297 mm)"],
    ["Font", "Times New Roman"],
    ["Font Size (Body Text)", "12 pt"],
    ["Line Spacing", "1.5"],
    ["Text Alignment", "Justified"],
    ["Margins", "2.54 cm (1 inch) on all sides"],
    ["Page Numbers", "Bottom center"],
    ["Language", "English"],
    ["File Format", "Microsoft Word (.doc/.docx)"],
  ] as [string, string][],
  headings: [
    ["Main Headings", "Times New Roman, 14 pt, Bold, Capitalize Each Word, Left Aligned"],
    ["Sub-Headings", "Times New Roman, 12 pt, Bold, Capitalize Each Word, Left Aligned"],
    ["Sub-Sub-Headings", "Times New Roman, 12 pt, Italic, Capitalize Each Word, Left Aligned"],
    ["Body Text", "Times New Roman, 12 pt, Regular, Justified, 1.5 Line Spacing"],
  ] as [string, string][],
  titlePage: [
    "Title of the Paper",
    "Full Names of All Authors (exactly as indexed in Scopus, maintaining the correct order of authorship)",
    "Institutional Affiliation of each author",
    "Department, Institution, City, State, Country",
    "Official E-mail Address of all authors",
    "Contact Number of the Corresponding Author",
    "ORCID ID of all authors",
    "Corresponding Author Identification",
  ],
  structure: [
    "Title",
    "Abstract",
    "Keywords (4-6)",
    "Introduction",
    "Literature Review",
    "Materials and Methods / Methodology",
    "Results and Discussion",
    "Conclusion",
    "Acknowledgements (Optional)",
    "Funding Information (If Applicable)",
    "Conflict of Interest Statement",
    "References",
  ],
  references:
    "All references must follow the APA 7th Edition citation style and be listed alphabetically at the end of the manuscript, with DOI for journal articles.",
  plagiarism:
    "All submitted manuscripts will be screened for plagiarism using standard plagiarism detection software. Manuscripts with significant similarity (over 15%) and AI content (over 15%) may be rejected without review.",
};
