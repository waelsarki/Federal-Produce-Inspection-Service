/**
 * The site's directory, mirroring the navigation of the official Federal Produce
 * Inspection Service website. Every destination is a page inside this portal;
 * nothing links back to an external site.
 *
 * Reference page content lives in lib/fpis-content.ts.
 */

export type QuickLink = {
  label: string;
  /** Local route: an /information page, an applicant flow page, or this site. */
  href: string;
  description?: string;
};

export type QuickLinkSection = {
  label: string;
  links: QuickLink[];
};

export type QuickLinkGroup = {
  label: string;
  links: QuickLink[];
  sections: QuickLinkSection[];
  /** Whether this group is listed in the footer. */
  showInFooter?: boolean;
};

/** Builds the route for a reference page defined in lib/fpis-content.ts. */
export function infoHref(slug: string): string {
  return `/information/${slug}`;
}

/** The three e-Services entries, also used for the highlighted quick actions. */
export const FPIS_ESERVICES: QuickLink[] = [
  { label: "Create an Account", href: "/register", description: "Register an exporter profile and start an application." },
  { label: "Apply for Certificate", href: "/apply", description: "Submit shipment details for inspection and certification." },
  { label: "Verify Certificate", href: "/verify", description: "Check the status of a certificate reference." },
];

export const FPIS_QUICK_LINK_GROUPS: QuickLinkGroup[] = [
  {
    label: "About",
    links: [
      { label: "About Us", href: infoHref("about-us"), description: "Who we are, our mandate, mission and vision." },
      { label: "Vision, Mission & Mandate", href: infoHref("vision-mission-mandate"), description: "The standards FPIS upholds and its statutory duties." },
      { label: "Why FPIS Was Created", href: infoHref("why-fpis-was-created"), description: "The 1954 cocoa out turn report and the quality control service it produced." },
      { label: "Our Activities", href: infoHref("our-activities") },
      { label: "Role of Stakholders", href: infoHref("role-of-stakeholders"), description: "Duties of clearing agents, Nigeria Customs Service and shipping lines." },
      { label: "Enforcement of Export Standard Act", href: infoHref("enforcement-of-export-standard-act") },
      { label: "Fumigant Act", href: infoHref("fumigant-act") },
    ],
    sections: [],
    showInFooter: true,
  },
  {
    label: "Services",
    links: [{ label: "What We Do", href: infoHref("what-we-do") }],
    sections: [{ label: "e-Services", links: FPIS_ESERVICES }],
    showInFooter: true,
  },
  {
    label: "SOP",
    links: [
      { label: "Guideline for Commodity Export", href: infoHref("guideline-for-commodity-export") },
      { label: "Statutory Function", href: infoHref("statutory-function") },
      { label: "FPIS Operational Area", href: infoHref("operational-area") },
      { label: "FPIS Activities At Warehouse", href: infoHref("activities-at-warehouse") },
      { label: "Function of FPIS At Sea-Port / Airport / Land-Border / Dry Port", href: infoHref("seaport-airport-border-dry-port") },
      { label: "Procedures for Produce Warehouse Registration", href: infoHref("warehouse-registration-procedure") },
      { label: "Cost and Documentation", href: infoHref("cost-and-documentation") },
      { label: "Special Power of Enforcement", href: infoHref("special-power-of-enforcement") },
      { label: "Offence and Penalty", href: infoHref("offence-and-penalty") },
    ],
    sections: [
      {
        label: "Commodity List & Prohibited Items",
        links: [
          { label: "Commodity List", href: infoHref("commodity-list") },
          { label: "Prohibited Export Items", href: infoHref("prohibited-export-items") },
        ],
      },
      { label: "Definition of Technical Terms", links: [{ label: "Definition of Technical Terms", href: infoHref("definition-of-technical-terms") }] },
    ],
    showInFooter: true,
  },
  {
    label: "Section of FPIS",
    links: [
      { label: "Quality Control & Certification", href: infoHref("quality-control-and-certification") },
      { label: "Pest Control & Fumigation Unit", href: infoHref("pest-control-and-fumigation") },
      { label: "Monitoring and Enforcement Unit", href: infoHref("monitoring-and-enforcement") },
      { label: "Task Force Unit", href: infoHref("task-force-unit") },
      { label: "Training School", href: infoHref("training-school") },
      { label: "Laboratory & Research Unit", href: infoHref("laboratory-and-research") },
      { label: "ICT Unit", href: infoHref("ict-unit") },
    ],
    sections: [],
  },
  {
    label: "Publications",
    links: [
      { label: "News", href: infoHref("news") },
      { label: "Press Release", href: infoHref("press-release") },
      { label: "Circulars", href: infoHref("circulars") },
      { label: "Events", href: infoHref("events") },
      { label: "Staff Training", href: infoHref("staff-training") },
      { label: "Gallery", href: infoHref("gallery") },
    ],
    sections: [],
  },
  {
    label: "More",
    links: [
      { label: "History", href: infoHref("history") },
      { label: "Contact", href: infoHref("contact") },
      { label: "Login", href: "/login" },
      { label: "Staff login", href: "/staff/login" },
      { label: "Home", href: "/" },
    ],
    sections: [],
  },
];

/** Every directory entry, flattened — used for counts and single-list views. */
export const FPIS_QUICK_LINKS: QuickLink[] = FPIS_QUICK_LINK_GROUPS.flatMap((group) => [
  ...group.links,
  ...group.sections.flatMap((section) => section.links),
]);

/**
 * The subset of the directory listed in the footer. Section of FPIS, Publications
 * and More are reachable from the header menu, /quick-links and /information.
 */
export const FPIS_FOOTER_LINK_GROUPS: QuickLinkGroup[] = FPIS_QUICK_LINK_GROUPS.filter((group) => group.showInFooter);
