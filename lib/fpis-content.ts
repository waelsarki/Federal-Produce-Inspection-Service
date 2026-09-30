/**
 * Federal Produce Inspection Service reference content, reproduced inside this
 * portal so every section of the agency's published material is available here
 * without sending applicants to an external site.
 *
 * Source material is the FPIS publication set described in README.md.
 */

export type InfoBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "steps"; items: { title: string; text: string }[] }
  | { kind: "definitions"; items: { term: string; meaning: string }[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "note"; label: string; text: string }
  | { kind: "empty"; title: string; text: string }
  | { kind: "links"; items: { label: string; href: string; note: string }[] };

export type InfoPage = {
  slug: string;
  group: string;
  title: string;
  eyebrow: string;
  summary: string;
  blocks: InfoBlock[];
};

export const VISION =
  "To regulate and ensure that only good quality agricultural produce that meet national and international quality standards are exported out of or imported into Nigeria, thereby creating foreign exchange earnings and employment for Nigerians involved in either export or processing of agricultural produce.";

export const MISSION =
  "To technically conduct quality check-test and fumigation on all agricultural produce meant for export to ensure they conform to prescribed exportable standards; and to check-weigh produce and inspect packaging, bag markings, sewing and sealing of graded produce to avoid tampering.";

export const MANDATE: string[] = [
  "Inspection and quality control of all agricultural produce to ensure compliance with prescribed national and international standards as a precondition for export and processing.",
  "Ensure only pest-free quality produce are exported or imported in or out of Nigeria.",
  "All vessels bringing in imported or bagged agricultural produce are disinfested and fumigated.",
  "Disinfest by spraying ship-holds, container units, hatches, barges or any other receptacle carrying fumigated export produce.",
  "To reject any produce that failed to meet the national import or export standards.",
  "Fumigate infested imported agricultural produce before leaving the port premises.",
];

export const HEAD_OFFICES: { term: string; meaning: string }[] = [
  {
    term: "National Administrative Headquarter",
    meaning:
      "Federal Ministry of Industry, Trade & Investment, Block C, Old Garki, Abuja, Federal Capital Territory. Tel: +234 803 335 8961, +234 803 335 2974. Email: info@fpis.com",
  },
  {
    term: "National Operational Headquarter",
    meaning:
      "No. 1, NEPA / PHCN Road, Ijora-Olopa, Lagos, Lagos State. Tel: +234 803 232 4786. Email: info@fpis.com",
  },
];

export const MISSION_VISION_MANDATE_BLOCKS: InfoBlock[] = [
  { kind: "heading", text: "Vision" },
  { kind: "paragraph", text: VISION },
  { kind: "heading", text: "Mission" },
  { kind: "paragraph", text: MISSION },
  { kind: "heading", text: "Mandate" },
  { kind: "paragraph", text: "Federal Produce Inspection Service is mandated to discharge the following statutory duties:" },
  { kind: "list", items: MANDATE },
];

const aboutUs: InfoPage = {
  slug: "about-us",
  group: "About",
  title: "About Us",
  eyebrow: "WHO WE ARE",
  summary: "The agency, its mandate, its mission and its vision.",
  blocks: [
    {
      kind: "paragraph",
      text: "The Federal Produce Inspection Services (FPIS) is a regulatory Federal Government agency under the Federal Ministry of Industry, Trade and Investment. FPIS was established by the Law of Nigeria No. 24 of 1950 as a Produce Enforcement of Export Standard Law.",
    },
    {
      kind: "paragraph",
      text: "In 1959 an Act of Parliament empowered FPIS to regulate pest control in port areas and to control pest infestation in agricultural export produce inside the port and its environs. That law was subsequently amended in 2009, 2010 and finally in 2016.",
    },
    ...MISSION_VISION_MANDATE_BLOCKS,
    { kind: "heading", text: "Headquarters" },
    { kind: "definitions", items: HEAD_OFFICES },
  ],
};

const visionMissionMandate: InfoPage = {
  slug: "vision-mission-mandate",
  group: "About",
  title: "Vision, Mission & Mandate",
  eyebrow: "WHAT DRIVES FPIS",
  summary: "The standards FPIS upholds and the statutory duties it discharges.",
  blocks: MISSION_VISION_MANDATE_BLOCKS,
};

const whyFpisWasCreated: InfoPage = {
  slug: "why-fpis-was-created",
  group: "About",
  title: "Why FPIS Was Created",
  eyebrow: "BACKGROUND",
  summary: "The 1954 cocoa out turn report and the quality control service it produced.",
  blocks: [
    {
      kind: "paragraph",
      text: "There was a serious out turn report of bad cocoa from the overseas market in 1954 which reminded the government of a great need to have a rather independent produce department to cross-check the work of the regional produce inspection service. To meet the desired quality control standard of export commodities for the world market, the Federal Produce Inspection Service was created.",
    },
    {
      kind: "paragraph",
      text: "The Service is responsible to the Federal Government and is charged with check-testing all duly graded and sealed export produce of the State Produce Inspection Services to ensure that the quality conforms with prescribed standards and grades.",
    },
    {
      kind: "paragraph",
      text: "The Service maintains effective quality control of export commodities through rebagging, inspection, check-testing, pest control such as fumigation of infested stacks of produce, spraying, fogging, dusk misting, stores and ship-holds inspection, and the application of modern storage devices. The inspection aspect is principally empirical, while check-testing involves actual cut test analysis. Others may involve laboratory tests as in the case of palm oil. Different kinds of produce have established methods of quality control.",
    },
    {
      kind: "paragraph",
      text: "All check-tested produce that failed to maintain the prescribed grades and standards were rejected for shipment. These rejects are stamped with an official rejection stamp issued for that purpose. When the above steps have been taken, a comprehensive report is officially made to the Chief Produce Officer of the State of origin giving reasons for the rejection.",
    },
  ],
};
const ourActivities: InfoPage = {
  slug: "our-activities",
  group: "About",
  title: "Our Activities",
  eyebrow: "ON THE GROUND",
  summary: "What FPIS officers do at ports, warehouses, mills, borders and dry ports.",
  blocks: [
    { kind: "paragraph", text: "FPIS is empowered by its establishing laws and regulations to carry out functions at airports and seaports, registered produce warehouses, processing and crushing mills, land borders or any other part of the Federation where agricultural produce is handled, stored, concealed or processed. These functions include the following:" },
    { kind: "list", items: [
      "Boarding any vessel berthed at the ports ship-side that intends to carry agricultural produce for export, to inspect and disinfest (spray) the ship-holds and remove pests before loading already fumigated commodities, to prevent re-infestation.",
      "Fumigation of empty export containers belonging to shipping lines at their terminals inside the port before they are issued to exporters.",
      "Inspection at the port gate of all containers stuffed with agricultural produce entering the port, to ascertain whether they passed through FPIS quality test.",
      "Fumigation of all imported produce on board vessels before it is bulked out of the port to the hinterland.",
      "Returning to the warehouse any container of produce that evaded the quality test, fumigation and payment of statutory levies.",
      "Impounding agricultural produce smuggled into the port and found to be of poor quality, for destruction.",
      "Cross-checking seals, markings and documents that accompany produce graded in the states, for compliance with state dues.",
      "Arrival check-test (ACT) of all produce from the state, including testing for moisture content.",
      "Pre-shipment check-test (SCT), inspection and quality control of all produce at registered warehouses.",
      "Pest control of produce through pre-shipment fumigation or prior to local processing at registered warehouses and mills.",
      "Check-weighing produce for compliance with approved standard weight, and inspecting packaging for markings, sewing and sealing.",
      "Identification or rejection of poor quality produce on arrival, or deteriorated produce in storage.",
      "Issuance of certificate of quality, fumigation, weight and good packaging material to exporters.",
      "Monitoring of produce movement at the nation's border posts for compliance with produce export regulations.",
      "Enforcing payment of all statutory government export and fumigation levies.",
      "Arrest and prosecution of persons that contravene the export of agricultural produce guidelines and regulations.",
      "Organizing training and enlightenment workshops, seminars and conferences for relevant stakeholders.",
      "Rendering statistical data to the Export Commodity Coordinating Committee (ECCC), which also ensures payment of mandatory levies for Nigeria's membership of the International Commodity Association.",
      "Representing the Government of Nigeria at international meetings such as CODEX involving the export of agricultural commodities.",
    ] },
  ],
};

const roleOfStakeholders: InfoPage = {
  slug: "role-of-stakeholders",
  group: "About",
  title: "Role of Stakeholders",
  eyebrow: "WHO DOES WHAT",
  summary: "The obligations of clearing agents, Nigeria Customs Service and shipping lines.",
  blocks: [
    { kind: "heading", text: "Licensed Clearing and Forwarding Agent" },
    { kind: "paragraph", text: "They should ensure that their client (exporter or importer), when representing them, produces the following documents before loading any agricultural produce for export or import:" },
    { kind: "list", items: [
      "Certificate of check-test issued by any FPIS office nationwide.",
      "Receipt of payment of export levy.",
      "Receipt of payment of fumigation levy.",
      "Collection of certificate of quality, fumigation, good packaging material and weight at any FPIS office on behalf of the exporter.",
    ] },
    { kind: "heading", text: "Nigeria Customs Service (NCS)" },
    { kind: "paragraph", text: "The Nigeria Customs Service is expected to collaborate with FPIS to ensure that all exporters of agricultural produce provide evidence of handling by FPIS, which is statutorily in charge of certifying the quality of agricultural produce for export before the produce is released to the exporter. The exporter is expected to provide:" },
    { kind: "list", items: [
      "Quality check-test certificate issued by FPIS.",
      "Receipt of payment of export levy from FPIS.",
      "Receipt of payment of fumigation levy from FPIS.",
    ] },
    { kind: "heading", text: "Shipping Line" },
    { kind: "paragraph", text: "Ship owners are expected to work in collaboration with FPIS to ensure the following:" },
    { kind: "list", items: [
      "No delays of containers carrying produce at the port, so that deterioration of quality is averted.",
      "Shipping lines should inform FPIS by application of the arrival time of ships that will load agro-commodities, so the hatches can be sprayed to control pest infestation.",
      "Any letter from FPIS instructing them not to manifest containers carrying poor quality produce for export should be treated with seriousness.",
      "Shipping lines should demand evidence of fumigation from FPIS, being the only government agency authorised by law to fumigate agricultural commodities as a quality control parameter.",
    ] },
    { kind: "note", label: "Why this matters", text: "Clearance of export produce depends on each party holding up its part. FPIS certificates and levy receipts are the evidence that Nigeria Customs Service and shipping lines are required to demand." },
  ],
};
const enforcementOfExportStandardAct: InfoPage = {
  slug: "enforcement-of-export-standard-act",
  group: "About",
  title: "Enforcement of Export Standard Act",
  eyebrow: "STATUTORY FRAMEWORK",
  summary: "The Produce Ordinance FPIS enforces and the commodities it covers.",
  blocks: [
    { kind: "paragraph", text: "FPIS enforces the Produce Enforcement of Export Standard Law, made as the Law of Nigeria No. 24 of 1950 and commenced on 27 September 1951. The repeal of that law led to the establishment of the Federal Produce Inspection Service by the Law of Nigeria No. 36 of 1958." },
    { kind: "paragraph", text: "The Service, being established by an Act of Parliament, was further empowered by the Law of Nigeria No. 21 of 1959 and No. 35 of 1970 (Pest Control in Port Areas (Amendment) Regulations 1970) to control pest infestation and ensure standards of produce inside ports, bonded warehouses, mills, borders, dry ports and all other areas of the Federation handling the export of agricultural produce, as empowered by the Laws of the Federation of Nigeria Volume 13 dated 31 December 2010." },
    { kind: "heading", text: "How the Act is enforced" },
    { kind: "list", items: [
      "Check-testing of graded produce to confirm it retains the grade given by the State Produce Inspection Service.",
      "Fumigation and disinfestation of produce, stores, ship-holds, hatches and containers.",
      "Inspection of packaging, markings, sewing and sealing, and check-weighing against approved standard weights.",
      "Identification and rejection of poor quality produce on arrival and deteriorated produce in storage.",
      "Enforcement of the payment of statutory export and fumigation levies.",
      "Special powers of enforcement, including stop and search, seizure, entry and sealing of illegal warehouses.",
      "Prosecution of offenders under the offences and penalties provided by the Act.",
    ] },
    { kind: "heading", text: "Raw and semi-processed commodities to which the Ordinance applies" },
    { kind: "list", items: [
      "Cocoa beans, cocoa liquor, cocoa butter, cocoa powder",
      "Ginger, cashew, cashew kernel, dried hibiscus, chilies, capsicum",
      "Cotton lint, cotton seed, cotton seed powder, cotton waste, cotton yarn, cotton seed oil",
      "Sesame seed, gum arabic, soya beans, copra, kolanut, bitter kolanut",
      "Shea nut, shea butter, coffee, palm kernel, palm kernel cake, palm kernel oil, palm kernel shell, palm oil",
      "Raffia cane, raffia seed, locust beans, rubber, forest nuts, charcoal",
      "Garri, cassava starch, cassava chips, garlic, potatoes, rice, sorghum, sugar cane",
      "Turmeric, yam, melon seeds, groundnut, groundnut powder, groundnut cake",
      "Hides and skin, kenaf, tobacco, wheat bread, bee wax, black stone flower, moringa",
      "Beans (cow pea), bambara nut, aya tiger nut, alligator pepper, corn, pigeon pea, honey comb, millet, crushed bone and hoof",
    ] },
    { kind: "note", label: "Reference copy", text: "The Produce Ordinance is held at the FPIS National Operational Headquarter, Ijora-Olopa, Lagos, and may be inspected there. This portal does not host the ordinance document itself." },
  ],
};

const fumigantAct: InfoPage = {
  slug: "fumigant-act",
  group: "About",
  title: "Fumigant Act",
  eyebrow: "PEST CONTROL LAW",
  summary: "Fumigation and disinfestation requirements that apply to export produce.",
  blocks: [
    { kind: "paragraph", text: "Fumigation and disinfestation are regulated under the Pest Control in Port Areas (Amendment) Regulations, which empowered FPIS to regulate pest control in port areas and to control pest infestation in agricultural export produce inside the port and its environs. FPIS is the only government agency authorised by law to fumigate agricultural commodities to control pest infestation." },
    { kind: "heading", text: "Requirements for export produce" },
    { kind: "list", items: [
      "All produce for export must be fumigated for a minimum period of 72 hours and is valid for 21 days, after which it must be re-fumigated prior to release for shipment.",
      "The law requires that all agricultural produce for export is fumigated within 21 days before it is stuffed for export.",
      "Produce must be covered with a fumigation sheet for 12 hours after placing the fumigant, with the ends of the sheets pressed down with sandbags so the covering is airtight.",
      "A confirmation snaking test is carried out after offs-heating at the end of covering for 72 hours, to confirm the effectiveness of the fumigation.",
      "Exporters are responsible for providing fumigation materials such as fumigation sheets, fumigant and sandbags.",
      "Any container, pallet, produce bag or other receptacle associated with produce meant for export must be disinfected with approved chemicals at the recommended dosage.",
      "All produce warehouses must be disinfected as need arises to prevent cross infestation.",
    ] },
    { kind: "heading", text: "Fumigation levy" },
    { kind: "paragraph", text: "A fumigation levy is payable on produce prepared for export. The current statutory rate is published under Cost and Documentation." },
    { kind: "note", label: "Enforcement", text: "It is an offence to refuse an order from an FPIS officer on fumigation and disinfestation matters. Defiance of that order attracts a penalty or prosecution depending on the severity of the offence." },
    { kind: "links", items: [
      { label: "Cost and Documentation", href: "/information/cost-and-documentation", note: "Fumigation and export levy rates." },
      { label: "Pest Control & Fumigation Unit", href: "/information/pest-control-and-fumigation", note: "How FPIS carries out fumigation." },
    ] },
  ],
};
const guidelineForCommodityExport: InfoPage = {
  slug: "guideline-for-commodity-export",
  group: "SOP",
  title: "Guideline for Commodity Export",
  eyebrow: "STANDARD OPERATING PROCEDURE",
  summary: "What an exporter must have in place before produce can be shipped.",
  blocks: [
    { kind: "paragraph", text: "The requirements below apply to every exporter of agricultural produce leaving Nigeria." },
    { kind: "list", items: [
      "A company duly registered by the Corporate Affairs Commission (CAC), with which you intend to transact the export business.",
      "A valid certificate of registration with the Nigeria Export Promotion Council (NEPC) as a registered Nigerian exporter.",
      "A valid commodity warehouse registered by FPIS, either within the port of shipment area or a bonded export warehouse if outside the port of shipment area. The warehouse must be managed by a warehouse manager licensed by FPIS, renewable annually on or before 30 June of every year.",
      "Presentation of the export commodity at one of the registered produce warehouses described above.",
    ] },
    { kind: "heading", text: "Quality test" },
    { kind: "paragraph", text: "An arrival check-test (ACT) must be carried out on all produce arriving into the registered warehouse to determine whether the produce is of exportable quality before it is received. A shipment check-test (SCT) must also be carried out to ascertain whether it retains its quality as tested on arrival before it is released for export." },
    { kind: "heading", text: "Fumigation" },
    { kind: "paragraph", text: "All produce for export must be fumigated for a minimum period of 72 hours, and the fumigation is valid for 21 days, after which it must be re-fumigated prior to release for shipment. Exporters are responsible for providing fumigation materials such as fumigation sheets, fumigant and sandbags." },
    { kind: "heading", text: "Packaging and moisture content" },
    { kind: "paragraph", text: "All produce presented for export must be packaged to the standard prescribed by the FPIS ordinance and by international standards. The moisture content (MC) of all produce presented for export must be taken to ensure it does not exceed the maximum limit prescribed by law." },
    { kind: "heading", text: "Statutory payments" },
    { kind: "definitions", items: [
      { term: "Disinfestation levy", meaning: "Paid during warehouse registration when the warehouse is fumigated to kill all pests prior to registration, and repeated once every year prior to renewal of the warehouse registration." },
      { term: "Export levy", meaning: "Charged per metric tonne, at a rate that depends on the commodity. See Cost and Documentation for the current rates." },
      { term: "Fumigation levy", meaning: "Charged per metric tonne during fumigation for both shipment and control, at the same rate for all crops." },
    ] },
    { kind: "paragraph", text: "Export levy is paid through the bank on presentation of a valid NXP Form, a completed copy of the Certificate of Commodity Export (C.O.E) form from the Export Commodities Coordinating Committee (ECCC), and a valid NEPC registration." },
    { kind: "heading", text: "Certification" },
    { kind: "paragraph", text: "At the end of the shipment, once the vessel carrying the produce has sailed and the Bill of Lading (BL) is ready, a certificate of quality, fumigation, good packaging material and weight is issued to the exporter by FPIS at a cost." },
    { kind: "links", items: [
      { label: "Cost and Documentation", href: "/information/cost-and-documentation", note: "Current levy rates and payment forms." },
      { label: "Procedures for Produce Warehouse Registration", href: "/information/warehouse-registration-procedure", note: "How to register a warehouse." },
      { label: "Start an application", href: "/register", note: "Begin an export certificate application in this portal." },
    ] },
  ],
};
const statutoryFunction: InfoPage = {
  slug: "statutory-function",
  group: "SOP",
  title: "Statutory Function",
  eyebrow: "WHAT THE LAW REQUIRES",
  summary: "The functions FPIS is established to perform.",
  blocks: [
    { kind: "list", items: [
      "Inspection and quality control of all agricultural produce to ensure compliance with internationally prescribed grades and standards as a precondition for export.",
      "Conduct arrival and shipment check-tests on all agricultural produce prior to export at registered produce stores, warehouses and processing factories.",
      "Fumigation to control pest infestation during storage or prior to export of all agricultural commodities.",
      "Spraying and disinfestation of produce stores, ship-holds, hatches and containers or any other receptacle used in carrying agricultural produce.",
      "Inspection of packaging to ensure proper packaging materials, markings, sewing and sealing of all graded produce.",
      "Check-weighing all agricultural produce for export to ensure compliance with approved standard weights.",
      "Identification and rejection of poor quality produce on arrival and deteriorated produce in storage.",
      "Enforce payment of government statutory fumigation and commodity export levies.",
      "Issuance of certificate of inspection, quality, weight, fumigation and good packaging materials to exporters.",
      "Monitoring of non-oil export (agricultural commodities) at the nation's seaports, airports and border posts to ensure compliance with export regulations and for statistical data collection.",
      "Organizing training and enlightenment workshops, seminars and conferences for FPIS staff and other relevant stakeholders.",
      "Rendering statistical data on the volume of agricultural commodity exports to the Federal Government and to stakeholders such as the Export Commodity Coordinating Committee (ECCC).",
      "Advising the Federal Government and other stakeholders on produce quality control and fumigation matters.",
      "Representing Nigeria at national and international commodity association meetings such as CODEX Alimentarius, where international commodity standards are set in collaboration with other agencies.",
    ] },
  ],
};

const operationalArea: InfoPage = {
  slug: "operational-area",
  group: "SOP",
  title: "FPIS Operational Area",
  eyebrow: "WHERE FPIS OPERATES",
  summary: "Registered warehouses, processing mills, ports and border posts.",
  blocks: [
    { kind: "heading", text: "Registered produce warehouse" },
    { kind: "paragraph", text: "A registered produce warehouse can be for private or commercial purposes and is classified into three:" },
    { kind: "list", ordered: true, items: [
      "Grading store or warehouse, usually registered by the State Produce Inspection Service.",
      "Port of shipment registered warehouses.",
      "Bonded export warehouse or terminal, registered by FPIS.",
    ] },
    { kind: "heading", text: "Processing mills" },
    { kind: "paragraph", text: "Though privately owned, processing mills must be registered by FPIS, which ensures that tests are carried out on the quality of all raw produce before processing. A quality produce leads to quality products." },
    { kind: "heading", text: "Airports, dry ports and seaports" },
    { kind: "paragraph", text: "FPIS inspects all produce exported through the airport to ensure quality and good packaging. At the seaport, FPIS ensures that container units carrying produce that did not pass through a registered produce warehouse are returned. FPIS also fumigates infested produce imported into the country and sprays vessels that berth to load agricultural produce from Nigeria." },
    { kind: "heading", text: "Border posts" },
    { kind: "paragraph", text: "Enforcement of quality standards and checking of smuggling of all agricultural produce leaving the country through border posts." },
  ],
};
const activitiesAtWarehouse: InfoPage = {
  slug: "activities-at-warehouse",
  group: "SOP",
  title: "FPIS Activities At Warehouse",
  eyebrow: "AT THE REGISTERED WAREHOUSE",
  summary: "Arrival check-test, pre-shipment check-test, fumigation and rejection.",
  blocks: [
    { kind: "heading", text: "Conduct of arrival check-test" },
    { kind: "paragraph", text: "The manager, by application, informs FPIS of the desire to bring produce into the registered warehouse. The FPIS officer inspects the bags of produce to cross-check the information on the waybill, markings, seal number and weight on arrival, to detect evidence of initial grading by the State Produce Inspection Service and any tampering in transit. In this way stolen produce can be identified, the activities of Licensed Buying Agents (LBAs) can be checked, and the exporter advised as the need arises. The officer gives instruction for stacking on dunnage or wooden pallets as the produce sample is taken and the quality test conducted." },
    { kind: "paragraph", text: "Samples from the arrival check-test are sent to the laboratory for specific quality parameters that can only be determined through laboratory analysis." },
    { kind: "heading", text: "Pre-shipment check-test" },
    { kind: "paragraph", text: "During shipment, samples are collected by scooping each bag after the bags are laid in lots of 100 bags each. Depending on the type of test, some go for cut analysis to detect the quality parameter standard of that produce before approval is given for shipment." },
    { kind: "heading", text: "Fumigation of agricultural commodities for export" },
    { kind: "paragraph", text: "Fumigation is the process of getting rid of pests in agricultural produce. It may be done in the warehouse periodically to control pests in stored produce, or prior to shipment during export. Pest infestation in stored produce is detected through a test procedure called snaking." },
    { kind: "list", items: [
      "The law requires that all agricultural produce for export is fumigated within 21 days before it is stuffed for export.",
      "Produce must be covered with a fumigation sheet for 12 hours after placing the fumigant inside, with the ends of the sheets pressed down with sandbags to ensure the covering is airtight.",
      "A confirmation snaking test is carried out after offs-heating at the end of covering for 72 hours, to confirm the effectiveness of the fumigation process.",
      "The produce is then released or rejected for export.",
    ] },
    { kind: "heading", text: "Rejection of poor quality produce for export" },
    { kind: "paragraph", text: "After the series of pre-shipment cut tests and quality parameters such as moisture content are established, produce that does not meet the export standard required is rejected, depending on the type of defect detected." },
  ],
};

const seaportAirportBorderDryPort: InfoPage = {
  slug: "seaport-airport-border-dry-port",
  group: "SOP",
  title: "Function of FPIS At Sea-Port / Airport / Land-Border / Dry Port",
  eyebrow: "AT THE PORTS AND BORDERS",
  summary: "Ship-hold inspection, container fumigation, interception and levy collection.",
  blocks: [
    { kind: "definitions", items: [
      { term: "Ship-hold inspection", meaning: "Officers are required by law to board any vessel berthing within Nigerian seaports that intends to load agricultural produce, to inspect the holds, barges and hatches against pest infestation and thereafter spray them in preparation for loading." },
      { term: "Fumigation of container units", meaning: "Shipping lines are expected to apply and position all 20ft or 40ft container units they intend to issue to customers for loading agricultural produce for export at the terminals, to be sprayed by the Pest Control Unit before they are issued out." },
      { term: "Examination of export containers", meaning: "FPIS officers examine all export containers entering the seaports to ensure that those carrying agricultural produce have been certified at the registered produce warehouses." },
      { term: "Fumigation of imported agricultural produce", meaning: "The Pest Control Unit has the statutory responsibility to fumigate any imported agricultural produce that is inspected and found to be infested, before it is allowed to be offloaded out of the port." },
      { term: "Interception", meaning: "Interception of all containers stuffed at illegal places with agricultural produce, to enforce compliance with produce export regulations." },
      { term: "Cargo inspection", meaning: "Inspection of outgoing cargo at the airport cargo shed to ensure quality conformity with international standards, and fumigation of produce imported into or exported out of the country." },
      { term: "Enforcement of quality and fumigation", meaning: "Enforcement on agricultural produce leaving the country through the nation's borders, to ensure all produce meant for export is free from pest infestation." },
      { term: "Statutory federal government revenue", meaning: "FPIS collects fumigation levies and Export Commodity Coordinating Committee (ECCC) levies payable by all exporters of agricultural produce, including those loading from illegally unregistered places direct to the ports." },
    ] },
  ],
};
const warehouseRegistrationProcedure: InfoPage = {
  slug: "warehouse-registration-procedure",
  group: "SOP",
  title: "Procedures for Produce Warehouse Registration",
  eyebrow: "LICENSING A WAREHOUSE",
  summary: "From formal application to certificate of registration and fumigation.",
  blocks: [
    { kind: "steps", items: [
      { title: "Formal application", text: "A formal application for registration of a produce warehouse is addressed to the Operational Headquarter, Federal Produce Inspection Service, Ijora-Olopa, Lagos." },
      { title: "Inspection of the proposed warehouse", text: "FPIS officers inspect the proposed warehouse to confirm it meets the requirements listed below." },
      { title: "Disinfestation", text: "The Pest Control Unit disinfests the warehouse to kill all existing pests, on an application addressed to the Chief Produce Superintendent in charge of the Unit." },
      { title: "Licensing of a competent Warehouse Manager", text: "The manager must be knowledgeable in produce handling or be trained, and must be an identity-card carrying staff member of the company seeking registration." },
      { title: "Payment", text: "Payment of registration and licence fees, and of the disinfestation levy at the prescribed rate per cubic metre." },
      { title: "Certification", text: "On completion of the above requirements, the Certificate of Registration (First Schedule), the Warehouse Manager's Licence (Fourth Schedule) and the Certificate of Fumigation are issued." },
    ] },
    { kind: "heading", text: "Warehouse requirements" },
    { kind: "list", items: [
      "The warehouse must be strategically located with easy access road for haulage within its premises.",
      "The roof must be leakproof and the warehouse well ventilated.",
      "The floor must be decked to avoid keeping produce on a dusty floor, and pallets must be provided because produce must not be kept on the bare floor.",
      "Office accommodation for FPIS must be provided.",
      "Tools such as scales, scoops, buckets and sample bags must be available for use within the warehouse.",
      "Proper drainage in and around the premises to prevent flooding during the rainy season.",
      "Whitewashed interior walls for easy detection of pest infestation.",
      "Good hygiene in and around the warehouse to prevent adulteration.",
      "There must be no cargo prior to registration, and only agricultural produce will be allowed to be handled in the warehouse after registration.",
    ] },
    { kind: "note", label: "Renewal", text: "A warehouse manager's licence is renewable annually on or before 30 June of every year, together with the disinfestation levy for the yearly fumigation prior to renewal." },
  ],
};

const costAndDocumentation: InfoPage = {
  slug: "cost-and-documentation",
  group: "SOP",
  title: "Cost and Documentation",
  eyebrow: "STATUTORY FEES",
  summary: "Fumigation, disinfestation and export levy rates, and how they are paid.",
  blocks: [
    { kind: "heading", text: "Statutory payments" },
    { kind: "definitions", items: [
      { term: "Fumigation levy", meaning: "Charged at N750 per metric tonne, the same rate for all crops." },
      { term: "Disinfestation (spraying)", meaning: "Charged at N500 per cubic metre." },
    ] },
    { kind: "heading", text: "Export levy" },
    { kind: "table", head: ["Commodity", "Rate"], rows: [
      ["Cocoa and all cocoa products", "$5 / MT (Naira equivalent)"],
      ["Ginger", "$5 / MT (Naira equivalent)"],
      ["Rubber", "$5 / MT (Naira equivalent)"],
      ["Gum Arabic", "$5 / MT (Naira equivalent)"],
      ["Cotton and its products", "$5 / MT (Naira equivalent)"],
      ["Shea Nut", "$3 / MT (Naira equivalent)"],
      ["Kola Nut", "$3 / MT (Naira equivalent)"],
      ["Cashew Nut and products", "$3 / MT (Naira equivalent)"],
      ["Sesame Seed", "$3 / MT (Naira equivalent)"],
      ["Ground Nut", "$3 / MT (Naira equivalent)"],
      ["Dried Hibiscus Flowers and all others", "$3 / MT (Naira equivalent)"],
    ] },
    { kind: "heading", text: "Documents for payment" },
    { kind: "list", items: [
      "The payment form is collected at the Export Coordinating Committee (ECC) resident at the FPIS Operational Headquarters, Ijora-Olopa, Lagos.",
      "A valid NXP Form for that shipment must be presented.",
      "A completed copy of the Certificate of Commodity Export (C.O.E) form is required.",
      "A valid NEPC registration as a registered Nigerian exporter is required.",
    ] },
    { kind: "heading", text: "Other handling charges" },
    { kind: "paragraph", text: "Any person requiring the services of an FPIS officer for statutory oversight visits shall, in addition to the statutory fees, pay for the services of such officer for those visits at a rate agreed by the firm. The head of FPIS may authorise payment to officers in respect of overtime service such as may be agreed upon." },
    { kind: "heading", text: "Certification" },
    { kind: "paragraph", text: "Certification of quality, fumigation, weight and packaging is issued to the exporter once the shipment has sailed and the Bill of Lading is ready." },
    { kind: "note", label: "Rates", text: "Rates above are the statutory figures published by FPIS. Always confirm the current schedule at an FPIS office before making payment, as fees are subject to review." },
  ],
};
const specialPowerOfEnforcement: InfoPage = {
  slug: "special-power-of-enforcement",
  group: "SOP",
  title: "Special Power of Enforcement",
  eyebrow: "ENFORCEMENT POWERS",
  summary: "The powers FPIS officers exercise over produce and premises.",
  blocks: [
    { kind: "list", items: [
      "A produce officer on uniform shall stop and search any vehicle, container or booster suspected on reasonable grounds to be carrying produce intended for export, or if imported, to unload it for inspection and clearance from pest infestation at a convenient place.",
      "Power to seize and detain produce, whether or not intended for export, on the ground of infestation, and to fumigate the produce and the vehicle at the owner's expense.",
      "Power of entry and sealing of illegal warehouses kept with the intent to store or export produce.",
      "Any person who, without reasonable excuse, contravenes or fails to comply with any order or other requirement of a Pest Control Inspector or Produce Officer of FPIS shall be guilty of an offence against the Act, and the penalties prescribed for an offence thereunder shall be imposed on conviction.",
    ] },
    { kind: "note", label: "Exemption", text: "Produce in transit from another country is exempt from these regulations." },
  ],
};

const offenceAndPenalty: InfoPage = {
  slug: "offence-and-penalty",
  group: "SOP",
  title: "Offence and Penalty",
  eyebrow: "NON-COMPLIANCE",
  summary: "What counts as an offence and what it attracts.",
  blocks: [
    { kind: "list", items: [
      "Any officer found to be compromising the standard shall be subjected to disciplinary action in line with the civil service rules.",
      "It is an offence to refuse an order from an FPIS officer on fumigation and disinfestation matters. Defiance of that order attracts a penalty or prosecution, depending on the magnitude or severity of the offence.",
      "Illegal operation of a warehouse and smuggling of produce with intent to export are liable to prosecution.",
    ] },
    { kind: "heading", text: "Warehouses" },
    { kind: "paragraph", text: "Any agent, transporter or employee of an exporter having produce in his control shall be liable to an offence if he exposes such produce to rain, water or undue mixing of varieties." },
    { kind: "heading", text: "A store manager" },
    { kind: "paragraph", text: "A store manager shall be liable to an offence if he defies the order of an FPIS officer and produce comes in contact with the floor or wall, or is exposed to heat. The penalty is de-licensing him from being the licensed warehouse manager." },
    { kind: "links", items: [
      { label: "Special Power of Enforcement", href: "/information/special-power-of-enforcement", note: "The powers officers exercise on site." },
      { label: "Fumigant Act", href: "/information/fumigant-act", note: "Fumigation requirements that orders enforce." },
    ] },
  ],
};

const prohibitedExportItems: InfoPage = {
  slug: "prohibited-export-items",
  group: "SOP",
  title: "Prohibited Export Items",
  eyebrow: "NOT FOR EXPORT",
  summary: "Items that may not be exported from Nigeria.",
  blocks: [
    { kind: "paragraph", text: "The following are the prohibited items for export:" },
    { kind: "list", ordered: true, items: [
      "Maize",
      "Scrap metal",
      "Rough and sawn wood",
      "Wild animals",
      "Artefacts",
      "Raw hides and skin",
      "Unprocessed rubber",
    ] },
    { kind: "note", label: "Note", text: "Presenting a prohibited item for export, or presenting produce that has evaded quality test and fumigation, exposes the exporter to rejection, seizure and prosecution." },
  ],
};
const definitionOfTechnicalTerms: InfoPage = {
  slug: "definition-of-technical-terms",
  group: "SOP",
  title: "Definition of Technical Terms",
  eyebrow: "GLOSSARY",
  summary: "The terms FPIS uses in quality control and inspection.",
  blocks: [
    { kind: "definitions", items: [
      { term: "Check-testing", meaning: "Confirmation of quality analysis of graded produce from the states." },
      { term: "Pre-shipment check-test", meaning: "Test conducted before receiving produce into a registered warehouse." },
      { term: "LBA (Licensed Buying Agent)", meaning: "Merchant authorised to buy produce from farmers." },
      { term: "Defects", meaning: "Faults observed in produce during cut analysis that affect the quality of that produce." },
      { term: "Infestation", meaning: "Presence of pest in produce." },
      { term: "Snaking", meaning: "A process of laying produce in a snake-like shape with a view to detecting pest infestation, using a hand lens in certain cases." },
      { term: "Offs-heating", meaning: "Uncovering of the fumigation sheet from a fumigated produce stack." },
      { term: "Fumigation sheet", meaning: "Material used for covering a fumigated produce stack." },
      { term: "Pest infestation", meaning: "Presence of pest in produce." },
      { term: "Pest", meaning: "Includes rodents, vermin, insects, parasites and fungus deleterious to produce intended for export or in storage." },
      { term: "Produce", meaning: "Has the meaning assigned by section 3 of the Produce Enforcement of Export Standard Act 2002 to date, whether intended for export from or import into Nigeria." },
      { term: "Arrival check-test (ACT)", meaning: "Test carried out on produce arriving into a registered warehouse, to confirm it was graded by the State Produce Inspection Service and retains its original grade." },
      { term: "Shipment check-test (SCT)", meaning: "Test carried out when produce is ready to be loaded out for export, to confirm its final quality meets the prescribed export quality standard." },
      { term: "Moisture content (MC)", meaning: "Measurement taken with specific moisture meters, for example an Aqua-boy for cocoa or a grain moisture meter for grains, to determine whether produce is damp. Damp produce results in the growth of mycotoxins and aflatoxins." },
    ] },
    { kind: "links", items: [
      { label: "Quality Control & Certification", href: "/information/quality-control-and-certification", note: "Where these terms are applied." },
      { label: "FPIS Activities At Warehouse", href: "/information/activities-at-warehouse", note: "How check-tests and fumigation are carried out." },
    ] },
  ],
};
const commodityList: InfoPage = {
  slug: "commodity-list",
  group: "SOP",
  title: "Commodity List",
  eyebrow: "WHAT NIGERIA EXPORTS",
  summary: "Major export produce, their producing states, and commodities covered by the Ordinance.",
  blocks: [
    { kind: "paragraph", text: "Between 2011 and 2016 the major export produce of Nigeria included cocoa, cashew, ginger, rubber, cotton, sesame seed, gum arabic, palm kernel cake, chilies, shea nut, hibiscus flower, groundnut and soya beans. The origin of these produce is widespread among the states of the country, as shown in the table below." },
    { kind: "table", head: ["S/N", "Produce", "Major producing state"], rows: [
      ["1", "Cocoa beans", "Ondo, Osun, Rivers, Akwa Ibom, Ekiti, Oyo"],
      ["2", "Cashew nuts", "Kogi, Enugu, Benue, many SE, SW and NC states"],
      ["3", "Sesame seed", "Kano, Jigawa, Benue, Nasarawa, Kaduna"],
      ["4", "Ginger", "Kaduna"],
      ["5", "Rubber", "Cross River, Delta, Ondo, Edo"],
      ["6", "Shea nut and butter", "Niger, Kogi, FCT and other NC states"],
      ["7", "Gum arabic", "Yobe, Borno, Jigawa"],
      ["8", "Palm kernel", "Akwa Ibom, Cross River, Imo, Rivers, Bayelsa, Anambra, SS, SW and some NC states"],
      ["9", "Soya beans", "Kano, Borno, Benue"],
      ["10", "Chilies", "Katsina and bordering states"],
      ["11", "Hibiscus", "Jigawa, Borno"],
      ["12", "Cotton lint", "Katsina, Gombe, Adamawa, Zamfara and bordering states"],
      ["13", "Cassava chips", "NC, SS and SE states"],
      ["14", "Turmeric", "NW and NE states"],
      ["15", "Groundnut", "NC, NW and NE states"],
      ["16", "Moringa seeds", "NC, NW and NE states"],
      ["17", "Cassia seeds", "NC, NW and NE states"],
    ] },
    { kind: "heading", text: "Raw and semi-processed commodities to which the FPIS Ordinance applies" },
    { kind: "list", ordered: true, items: [
      "Cocoa beans", "Ginger", "Cashew", "Dried hibiscus", "Cotton lint", "Cotton seed", "Sesame seed", "Gum arabic",
      "Crushed bone and hoof", "Soya beans", "Copra", "Kolanut", "Shea nuts", "Coffee", "Palm kernel",
      "Raffia cane and raffia seed", "Locust beans", "Cocoa liquor", "Palm oil", "Palm kernel cake", "Palm kernel oil",
      "Cotton seed powder", "Cotton waste", "Capsicum", "Cotton yarn", "Cotton seed oil", "Rubber", "Garri",
      "Forest nuts", "Charcoal", "Garlic", "Potatoes", "Groundnut and powder", "Rice", "Shea butter", "Sorghum",
      "Sugar cane", "Turmeric", "Yam", "Sesame cake", "Melon seeds", "Groundnut cake", "Hides and skin", "Kenaf",
      "Cocoa butter", "Tobacco", "Wheat bread", "Cassava starch", "Cassava chips", "Cashew kernel", "Bitter kolanut",
      "Bee wax", "Black stone flower", "Beans (cow pea)", "Bambara nut", "Aya tiger nut", "Alligator pepper", "Corn",
      "Palm kernel shell", "Moringa", "Cassia tora", "Pigeon pea", "Honey comb", "Groundnut (peanut)", "Millet",
      "Cocoa powder",
    ] },
    { kind: "links", items: [
      { label: "Prohibited Export Items", href: "/information/prohibited-export-items", note: "Items that may not be exported." },
      { label: "Enforcement of Export Standard Act", href: "/information/enforcement-of-export-standard-act", note: "The Ordinance behind this list." },
    ] },
  ],
};
const qualityControlAndCertification: InfoPage = {
  slug: "quality-control-and-certification",
  group: "Section of FPIS",
  title: "Quality Control & Certification",
  eyebrow: "SECTION OF FPIS",
  summary: "Check-testing, moisture content testing and issue of certificates.",
  blocks: [
    { kind: "paragraph", text: "FPIS performs the following quality control functions at the registered warehouse and issues the certificate that allows produce to be exported." },
    { kind: "definitions", items: [
      { term: "Registered warehouse", meaning: "Samples from the arrival check-test are sent to the laboratory for scientific analysis that cannot be resolved technically before the application for shipment." },
      { term: "Arrival check-test (ACT)", meaning: "Ensures that the produce was graded by the State Produce Inspection Service of the state where it originated, and cross-checks whether it retains its original grade." },
      { term: "Shipment check-test (SCT)", meaning: "Done when the produce is ready to be loaded out for export, to confirm its final quality meets the prescribed export quality standard before it is released to the exporter." },
      { term: "Moisture content (MC)", meaning: "Measured with specific moisture meters, for example an Aqua-boy for cocoa or a grain moisture meter for grains, to determine whether the produce is damp. Damp produce results in the growth of mycotoxins and aflatoxins." },
      { term: "Certification", meaning: "FPIS issues a certificate of quality, fumigation, good packaging material and weight to all agricultural produce that passed the quality test and is exported out of Nigeria." },
      { term: "Reports", meaning: "Monthly, quarterly and yearly reports of export activities are generated, together with the presentation of export statistics." },
      { term: "Export statistics data", meaning: "Statistical data is rendered to the Export Commodity Coordinating Committee (ECCC), which among other functions ensures payment of the mandatory levies for Nigeria's membership of the International Commodity Association." },
    ] },
    { kind: "links", items: [
      { label: "Laboratory & Research Unit", href: "/information/laboratory-and-research", note: "Where samples are analysed." },
      { label: "Generate a certificate application", href: "/apply", note: "Submit shipment details in this portal." },
    ] },
  ],
};

const pestControlAndFumigation: InfoPage = {
  slug: "pest-control-and-fumigation",
  group: "Section of FPIS",
  title: "Pest Control & Fumigation Unit",
  eyebrow: "SECTION OF FPIS",
  summary: "Spraying and fumigation of vessels, containers, pallets and warehouses.",
  blocks: [
    { kind: "paragraph", text: "The Pest Control Unit carries out the spraying and fumigation duties of the Service. The Unit is the only unit authorised by law to fumigate agricultural commodities to control pest infestation as a quality control parameter." },
    { kind: "definitions", items: [
      { term: "Boarding of berthed vessels in seaport", meaning: "The shipping line alerts FPIS by application on the arrival of a ship or barge to load agricultural produce. Officers stand by to inspect and set up precaution signs, and within about 30 minutes, depending on the size of the ship, spray the hatches to get rid of pests and insects hazardous to agricultural produce." },
      { term: "Spraying containers and pallets", meaning: "Any container used for loading or bulking produce, pallets used for storing commodities, produce bags and any other receptacle associated with produce meant for export must be disinfected with approved chemicals at the recommended dosage." },
      { term: "Warehouses", meaning: "All produce warehouses must be disinfected as need arises and, as far as possible, cross infestation is prevented. Hence different warehouses are used for specific produce and at different temperatures." },
      { term: "Imported produce", meaning: "The Unit has the statutory responsibility to fumigate any imported agricultural produce that is inspected and found to be infested, before it is allowed out of the port." },
      { term: "Ship-holds and hatches", meaning: "Holds, barges and hatches of vessels intending to load produce are inspected for pest infestation and sprayed in preparation for loading." },
    ] },
    { kind: "links", items: [
      { label: "Fumigant Act", href: "/information/fumigant-act", note: "The rules the Unit enforces." },
      { label: "Cost and Documentation", href: "/information/cost-and-documentation", note: "Fumigation and disinfestation levies." },
    ] },
  ],
};
const monitoringAndEnforcement: InfoPage = {
  slug: "monitoring-and-enforcement",
  group: "Section of FPIS",
  title: "Monitoring and Enforcement Unit",
  eyebrow: "SECTION OF FPIS",
  summary: "Monitoring produce movement and enforcing export compliance.",
  blocks: [
    { kind: "paragraph", text: "The Monitoring and Enforcement Unit, working with the Task Force, is mandated to move around the zone to stop indiscriminate stuffing of agricultural produce at illegal places, and monitors produce movement at the nation's border posts, seaports and airports to ensure compliance with produce export regulations. The Unit is also responsible for statistical data collection on non-oil export." },
    { kind: "heading", text: "What the Unit monitors and enforces" },
    { kind: "list", items: [
      "Monitoring of produce movement at the nation's border posts, seaports and airports to ensure compliance with produce export regulations.",
      "Enforcement of quality standards and checking of smuggling of all agricultural produce leaving the country through border posts.",
      "Interception of containers stuffed at illegal places with agricultural produce, to enforce compliance with produce export regulations.",
      "Return of container units carrying produce that did not pass through a registered produce warehouse.",
      "Inspection at the port gate of all containers stuffed with produce entering the port, to ascertain whether they passed through FPIS quality test.",
      "Enforcement of the payment of statutory government export and fumigation levies, including for produce loaded from illegally unregistered places direct to the ports.",
      "Arrest and prosecution of persons that contravene the export of agricultural produce guidelines and regulations.",
      "Collection of data on non-oil exports for statistical reporting.",
    ] },
    { kind: "links", items: [
      { label: "Function of FPIS At Sea-Port / Airport / Land-Border / Dry Port", href: "/information/seaport-airport-border-dry-port", note: "Where monitoring happens." },
      { label: "Offence and Penalty", href: "/information/offence-and-penalty", note: "Consequences of non-compliance." },
    ] },
  ],
};

const taskForceUnit: InfoPage = {
  slug: "task-force-unit",
  group: "Section of FPIS",
  title: "Task Force Unit",
  eyebrow: "SECTION OF FPIS",
  summary: "Surveillance against smuggling and illegal stuffing of produce.",
  blocks: [
    { kind: "paragraph", text: "The Task Force Unit is mandated to move around the zone to stop indiscriminate stuffing of agricultural produce at illegal places, and to checkmate smuggling of produce intended for export." },
    { kind: "heading", text: "Duties" },
    { kind: "list", items: [
      "Surveillance to checkmate smuggling of agricultural produce.",
      "Interception of all containers stuffed at illegal places with agricultural produce.",
      "Impounding agricultural produce smuggled into the port and observed to be of poor quality, for destruction.",
      "Support for the enforcement of quality standards on produce leaving the country through border posts.",
      "Assisting in the enforcement of the payment of statutory export and fumigation levies.",
    ] },
    { kind: "links", items: [
      { label: "Monitoring and Enforcement Unit", href: "/information/monitoring-and-enforcement", note: "The Unit the Task Force works alongside." },
      { label: "Special Power of Enforcement", href: "/information/special-power-of-enforcement", note: "Powers available on operations." },
    ] },
  ],
};

const trainingSchool: InfoPage = {
  slug: "training-school",
  group: "Section of FPIS",
  title: "Training School",
  eyebrow: "SECTION OF FPIS",
  summary: "Training of FPIS staff, warehouse managers and store keepers.",
  blocks: [
    { kind: "paragraph", text: "The Training School organizes training and enlightenment workshops, seminars and conferences for Federal Produce Inspection Service staff and other relevant stakeholders." },
    { kind: "heading", text: "Who is trained" },
    { kind: "list", items: [
      "FPIS officers, on the technical duties required by the Act and its regulations.",
      "Warehouse managers and store keepers, who must be knowledgeable in produce handling or be trained, and who must be identity-card carrying staff of the company seeking warehouse registration.",
      "Licensed Buying Agents and other stakeholders involved in handling agricultural produce for export.",
    ] },
    { kind: "heading", text: "Training areas" },
    { kind: "list", items: [
      "Quality control and check-testing practice.",
      "Fumigation and disinfestation procedure, including the 72-hour fumigation period, offs-heating and snaking tests.",
      "Packaging, marking, sewing and sealing of graded produce, and check-weighing.",
      "Warehouse handling requirements, including dunnage and pallets, hygiene and pest prevention.",
      "Produce export regulations, levies and documentation.",
    ] },
    { kind: "links", items: [
      { label: "Procedures for Produce Warehouse Registration", href: "/information/warehouse-registration-procedure", note: "The manager licensing requirement." },
      { label: "Definition of Technical Terms", href: "/information/definition-of-technical-terms", note: "Glossary used in training." },
    ] },
  ],
};
const laboratoryAndResearch: InfoPage = {
  slug: "laboratory-and-research",
  group: "Section of FPIS",
  title: "Laboratory & Research Unit",
  eyebrow: "SECTION OF FPIS",
  summary: "Scientific analysis of export produce and locally crushed mills.",
  blocks: [
    { kind: "paragraph", text: "FPIS Laboratory Services is the arm of the agency that investigates and pronounces on the quality, safety, efficacy and wholesomeness of all export produce and produce for locally crushing mills." },
    { kind: "heading", text: "When the laboratory is used" },
    { kind: "list", items: [
      "Samples from the arrival check-test are sent to the laboratory for certain specific quality parameters that can only be determined through laboratory analysis.",
      "Samples from arrival check-tests at the registered warehouse are sent for scientific analysis that cannot be sorted out technically before the application for shipment.",
      "Quality control of some produce, such as palm oil, involves laboratory tests rather than only empirical inspection.",
    ] },
    { kind: "heading", text: "What the Unit determines" },
    { kind: "definitions", items: [
      { term: "Quality", meaning: "Confirmation that the produce meets the prescribed grade and standard for export." },
      { term: "Safety and wholesomeness", meaning: "Assessment of the produce for parameters that would make it unfit for export, including defects established by cut analysis." },
      { term: "Moisture content and contaminants", meaning: "Testing that supports detection of damp produce, which results in the growth of mycotoxins and aflatoxins." },
      { term: "Infestation", meaning: "Confirmation of the presence of pests in produce." },
    ] },
    { kind: "links", items: [
      { label: "Quality Control & Certification", href: "/information/quality-control-and-certification", note: "How laboratory results feed certification." },
      { label: "Definition of Technical Terms", href: "/information/definition-of-technical-terms", note: "Terms used in analysis." },
    ] },
  ],
};

const ictUnit: InfoPage = {
  slug: "ict-unit",
  group: "Section of FPIS",
  title: "ICT Unit",
  eyebrow: "SECTION OF FPIS",
  summary: "Digital services that support the Service and its exporters.",
  blocks: [
    { kind: "paragraph", text: "The Information and Communications Technology Unit supports the Service's digital operations, including the e-Services used by exporters to register, apply for certificates and verify issued certificates." },
    { kind: "heading", text: "What the Unit supports" },
    { kind: "list", items: [
      "Exporter registration and applicant account administration.",
      "Certificate applications and the review workflow.",
      "Issued certificate records and certificate verification.",
      "Export statistics reporting to the Export Commodity Coordinating Committee (ECCC).",
      "Internal systems used by FPIS offices, warehouses and port units.",
    ] },
    { kind: "heading", text: "e-Services in this portal" },
    { kind: "links", items: [
      { label: "Create an account", href: "/register", note: "Register an exporter profile." },
      { label: "Apply for certificate", href: "/apply", note: "Submit shipment details for inspection and certification." },
      { label: "Verify certificate", href: "/verify", note: "Check a certificate reference issued by FPIS." },
    ] },
    { kind: "note", label: "Status", text: "This portal is a development preview. Registration, applications and verification currently run in the applicant's own browser and are not connected to FPIS production systems." },
  ],
};
const news: InfoPage = {
  slug: "news",
  group: "Publications",
  title: "News",
  eyebrow: "LATEST NEWS",
  summary: "News items published by the Service.",
  blocks: [
    { kind: "heading", text: "NAFDAC moves against peddlers of unwholesome food products" },
    { kind: "paragraph", text: "The National Agency for Food and Drug Administration and Control (NAFDAC) has commissioned 73 brand new HILUX utility vehicles, saloon cars and staff vehicles as part of its drive against the peddling of unwholesome food products." },
    { kind: "heading", text: "Why Nigeria export is rejected abroad" },
    { kind: "paragraph", text: "Speaking in Lagos through its President, Lucky Awimero, the National Council of Managing Directors of Licensed Customs Agents (NCMDLCA) said that until the agencies responsible for export are streamlined, Nigeria's export would continue to be rejected abroad." },
    { kind: "heading", text: "Jute bags - the most reliable packaging material for produce" },
    { kind: "paragraph", text: "Jute is one of the oldest traditional packaging materials and was the most commonly used packaging material. This purely natural material is made from the bark of the jute plant. Jute is strong and durable and has ventilating and absorbent properties, which makes it suitable for agricultural produce." },
    { kind: "heading", text: "Federal Government levy enforcement" },
    { kind: "paragraph", text: "Fumigation and commodity export levies are statutory levies exporters of agricultural produce are expected to pay before exportation. FPIS enforces the payment of these levies appropriately." },
    { kind: "heading", text: "Laboratory analysis & research" },
    { kind: "paragraph", text: "FPIS Laboratory Services is the arm of the agency that investigates and pronounces on the quality, safety, efficacy and wholesomeness of all export produce and produce for locally crushing mills." },
    { kind: "heading", text: "Disinfestation" },
    { kind: "paragraph", text: "Spraying and disinfestation of produce stores, ship-holds, hatches, containers and other produce receptacles, in order to control pests in stored produce." },
    { kind: "links", items: [
      { label: "Press Release", href: "/information/press-release", note: "Official statements." },
      { label: "Circulars", href: "/information/circulars", note: "Notices issued to exporters." },
    ] },
  ],
};

const pressRelease: InfoPage = {
  slug: "press-release",
  group: "Publications",
  title: "Press Release",
  eyebrow: "PUBLICATIONS",
  summary: "Official statements issued by the Service.",
  blocks: [
    {
      kind: "empty",
      title: "No press releases published yet",
      text: "Official statements from the Service will be published here as they are issued. In the meantime, current items appear under News.",
    },
    { kind: "links", items: [
      { label: "Read the latest news", href: "/information/news", note: "Current items and announcements." },
      { label: "Circulars", href: "/information/circulars", note: "Notices to exporters and stakeholders." },
    ] },
  ],
};
const circulars: InfoPage = {
  slug: "circulars",
  group: "Publications",
  title: "Circulars",
  eyebrow: "PUBLICATIONS",
  summary: "Notices and directives issued to exporters and stakeholders.",
  blocks: [
    {
      kind: "empty",
      title: "No circulars published yet",
      text: "Directives on produce inspection, fumigation and levies will be published here as they are issued. Requirements currently in force are set out in the Standard Operating Procedure section.",
    },
    { kind: "links", items: [
      { label: "Guideline for Commodity Export", href: "/information/guideline-for-commodity-export", note: "Export requirements in force." },
      { label: "Cost and Documentation", href: "/information/cost-and-documentation", note: "Statutory levy rates." },
      { label: "News", href: "/information/news", note: "Current items and announcements." },
    ] },
  ],
};

const events: InfoPage = {
  slug: "events",
  group: "Publications",
  title: "Events",
  eyebrow: "PUBLICATIONS",
  summary: "Workshops, seminars and conferences held by the Service.",
  blocks: [
    {
      kind: "empty",
      title: "No events scheduled",
      text: "Workshops, seminars and conferences organized by FPIS for staff and stakeholders will be listed here when scheduled.",
    },
    { kind: "links", items: [
      { label: "Staff Training", href: "/information/staff-training", note: "Training and seminar records." },
      { label: "Training School", href: "/information/training-school", note: "What the School covers." },
    ] },
  ],
};

const staffTraining: InfoPage = {
  slug: "staff-training",
  group: "Publications",
  title: "Staff Training",
  eyebrow: "PUBLICATIONS",
  summary: "Training and enlightenment programmes for staff and stakeholders.",
  blocks: [
    { kind: "paragraph", text: "The Service organizes training and enlightenment workshops, seminars and conferences for Federal Produce Inspection Service staff and other relevant stakeholders. Records of these programmes will be published here." },
    {
      kind: "empty",
      title: "No training records published yet",
      text: "Completed and upcoming training programmes will be listed here.",
    },
    { kind: "links", items: [
      { label: "Training School", href: "/information/training-school", note: "Who the School trains and in what." },
      { label: "Events", href: "/information/events", note: "Workshops and conferences." },
    ] },
  ],
};

const gallery: InfoPage = {
  slug: "gallery",
  group: "Publications",
  title: "Gallery",
  eyebrow: "PUBLICATIONS",
  summary: "Photographs of FPIS operations.",
  blocks: [
    {
      kind: "empty",
      title: "No photographs published yet",
      text: "Images of FPIS inspection, fumigation and port operations will be published here.",
    },
    { kind: "links", items: [
      { label: "Our Activities", href: "/information/our-activities", note: "What officers do in the field." },
      { label: "Pest Control & Fumigation Unit", href: "/information/pest-control-and-fumigation", note: "Fumigation operations described." },
    ] },
  ],
};
const whatWeDo: InfoPage = {
  slug: "what-we-do",
  group: "Services",
  title: "What We Do",
  eyebrow: "OUR FUNCTIONS",
  summary: "The statutory origin of the Service and the work it carries out.",
  blocks: [
    { kind: "paragraph", text: "The Federal Government of Nigeria, in creating awareness for economic diversification and to build an agriculture-based economy, promulgated the Law of Nigeria (L.N.) No. 24 of 1950, which commenced on 27 September 1951 and was referred to as the Produce Enforcement of Export Standard Law. The repeal of that law led to the establishment of the Federal Produce Inspection Service by the Law of Nigeria (L.N.) No. 36 of 1958. This Service, being established by an Act of Parliament, was further empowered by (L.N.) No. 21 of 1959 and No. 35 of 1970, the Pest Control in Port Areas (Amendment) Regulations 1970, to control pest infestation and ensure standards of produce inside the port, bonded warehouses, mills, borders, dry ports and all other areas of the Federation handling the export of agricultural produce, as empowered by the Laws of the Federation of Nigeria (L.N.) Volume 13 dated 31 December 2010." },
    { kind: "heading", text: "Warehouse registration" },
    { kind: "paragraph", text: "FPIS has the responsibility to register all warehouses and mills within the zone that are involved in handling agricultural produce, whether for local purposes or for export." },
    { kind: "heading", text: "What FPIS does" },
    { kind: "list", items: [
      "Check-tests the quality of all produce that are presented for export across the federation.",
      "Fumigates all the produce presented for export to kill and destroy all pest infestations prior to export and prior to local processing in crushing mills.",
      "Issues certificates of quality, fumigation, good packaging material and weight to all agricultural produce that pass the quality test and are exported out of Nigeria.",
      "Enforces payment of the statutory government levies. Fumigation and commodity export levies are statutory levies exporters of agricultural produce are expected to pay before exportation.",
      "Inspects and ensures that ship-holds, hatches and barges that load agricultural produce, or any other receptacle, are pest free.",
      "Disinfests any registered produce warehouse in the zone that handles agricultural produce with chemical sprays to keep it pest free and avoid damage to the produce.",
      "Surveillance through the Task Force and Monitoring units to stop indiscriminate stuffing of agricultural produce at illegal places.",
      "Renders monthly, quarterly and yearly reports of activities in the zone to headquarters, and represents the department or the Ministry at stakeholder meetings, seminars, workshops and other official engagements.",
      "Renders statistical data to the Export Commodity Coordinating Committee (ECCC), which among other functions ensures payment of mandatory levies for Nigeria's membership of the International Commodity Association.",
      "Laboratory analysis and research: investigates and pronounces on the quality, safety, efficacy and wholesomeness of all export produce and produce for locally crushing mills.",
      "Trains warehouse managers and store keepers, organizing training and enlightenment workshops, seminars and conferences for FPIS staff and other relevant stakeholders.",
    ] },
    { kind: "links", items: [
      { label: "Statutory Function", href: "/information/statutory-function", note: "The full list of statutory functions." },
      { label: "Our Activities", href: "/information/our-activities", note: "What officers do in the field." },
    ] },
  ],
};

const SERVICES_PAGES: InfoPage[] = [whatWeDo];

const history: InfoPage = {
  slug: "history",
  group: "History",
  title: "History",
  eyebrow: "HISTORY OF PRODUCE INSPECTION IN NIGERIA",
  summary: "From absent quality control in 1917 to today's national inspection service.",
  blocks: [
    { kind: "paragraph", text: "Before 1917, when the known export commodities were palm kernel, palm oil and cocoa, quality control was clearly absent. The lack of control was largely due to the fact that there were no prescribed standards and grades to follow. In the absence of organized farming and inspection, the commodities were sold at giveaway prices, resulting in huge financial losses. These heavy losses compelled the government to make the Department of Customs and Excise take over the responsibility of controlling produce inspection for export in 1917." },
    { kind: "paragraph", text: "To be more effective in the control duties, a special produce inspection section was created under the Department of Agriculture in 1926. This new set-up provided grades and standards for each produce, and these became operative first in the then Western Region. The control measures so far introduced did not go down well with the producers, who then started practices such as adulteration of graded produce. To meet this challenge, government introduced measures through special training of produce inspectors in the use of security-sealing devices for graded produce. The result of this special training was very encouraging." },
    { kind: "paragraph", text: "In 1928 the services were extended to the Eastern Region. In the same year palm kernel impurity limits were pegged at 5% in the Eastern Region, against 4% in the Western Region. Two separate commissions in 1931 and 1936 favourably reported that the produce inspection service be made an integral part of export trade in Nigeria. Consequently, in 1936, inspection of groundnuts was introduced in the Northern Region." },
    { kind: "paragraph", text: "The whole exercise led to the creation, in 1945, of the Office of Chief Inspector of Produce, who would be responsible to the Director of Agriculture. After being with the Department of Marketing and Export for three years, the Produce Inspection Board was created in 1950. This was empowered to make laws and regulations for produce inspection throughout Nigeria, and the discriminatory palm kernel standards in the East and Western Regions were normalized." },
    { kind: "paragraph", text: "This resulted in tremendous improvement in the quality standards of export produce. With this heart-warming achievement, regionalization of the produce inspection service was introduced in October 1954 to enforce the quality standards and grades of produce for export." },
    { kind: "table", head: ["Year", "Milestone"], rows: [
      ["1917", "Customs and Excise take over produce inspection for export."],
      ["1926", "Special produce inspection section created under the Department of Agriculture."],
      ["1928", "Services extended to the Eastern Region; palm kernel impurity limits fixed."],
      ["1931 / 1936", "Commissions report that produce inspection be integral to export trade; groundnut inspection begins in the Northern Region."],
      ["1945", "Office of Chief Inspector of Produce created."],
      ["1950", "Produce Inspection Board created and empowered to make regulations."],
      ["1950", "Law of Nigeria No. 24 of 1950, the Produce Enforcement of Export Standard Law, commenced 27 September 1951."],
      ["1954", "Regionalization of the produce inspection service to enforce quality standards for export."],
      ["1958", "Federal Produce Inspection Service established by the Law of Nigeria No. 36 of 1958."],
      ["1959 / 1970", "Pest Control in Port Areas Regulations, as amended, empower FPIS to control pest infestation in port areas."],
      ["2009 / 2010 / 2016", "Further amendments to the law governing FPIS."],
    ] },
    { kind: "links", items: [
      { label: "Why FPIS Was Created", href: "/information/why-fpis-was-created", note: "The 1954 cocoa out turn report." },
      { label: "About Us", href: "/information/about-us", note: "The agency today." },
    ] },
  ],
};
const contact: InfoPage = {
  slug: "contact",
  group: "History",
  title: "Contact",
  eyebrow: "GET IN TOUCH",
  summary: "How to reach the Federal Produce Inspection Service.",
  blocks: [
    { kind: "paragraph", text: "The National Administrative and National Operational headquarters can be reached at the addresses and numbers below. For guidance on an application, contact the Operational Headquarter, Ijora-Olopa, Lagos." },
    { kind: "definitions", items: HEAD_OFFICES },
    { kind: "heading", text: "Guidance on applications" },
    { kind: "list", items: [
      "Federal Produce Inspection Service, Ijora-Olopa, Lagos. Telephone: 08032324786, 08023167442. Email: jimhya22@yahoo.com",
      "General enquiries: info@fpis.com",
    ] },
    { kind: "note", label: "Prototype limits", text: "The contact form published by FPIS is not connected to this development preview. Please use the telephone numbers and email addresses above, or continue an existing application through the applicant dashboard." },
    { kind: "links", items: [
      { label: "Sign in to the applicant dashboard", href: "/login", note: "Track an application you submitted." },
      { label: "Start a new application", href: "/register", note: "Register and apply for a certificate." },
      { label: "Verify a certificate", href: "/verify", note: "Check a certificate reference." },
    ] },
  ],
};

const ABOUT_PAGES: InfoPage[] = [aboutUs, visionMissionMandate, whyFpisWasCreated, ourActivities, roleOfStakeholders, enforcementOfExportStandardAct, fumigantAct];
const SOP_PAGES: InfoPage[] = [guidelineForCommodityExport, statutoryFunction, operationalArea, activitiesAtWarehouse, seaportAirportBorderDryPort, warehouseRegistrationProcedure, costAndDocumentation, specialPowerOfEnforcement, offenceAndPenalty, commodityList, prohibitedExportItems, definitionOfTechnicalTerms];
const SECTION_PAGES: InfoPage[] = [qualityControlAndCertification, pestControlAndFumigation, monitoringAndEnforcement, taskForceUnit, trainingSchool, laboratoryAndResearch, ictUnit];
const PUBLICATION_PAGES: InfoPage[] = [news, pressRelease, circulars, events, staffTraining, gallery];
const MORE_PAGES: InfoPage[] = [history, contact];

export const INFO_PAGES: InfoPage[] = [
  ...ABOUT_PAGES,
  ...SERVICES_PAGES,
  ...SOP_PAGES,
  ...SECTION_PAGES,
  ...PUBLICATION_PAGES,
  ...MORE_PAGES,
];

export function getInfoPage(slug: string): InfoPage | undefined {
  return INFO_PAGES.find((page) => page.slug === slug);
}

/** Ordered groups used by the footer directory and the /information index. */
export const INFO_GROUPS: { label: string; slugs: string[] }[] = [
  { label: "About", slugs: ["about-us", "vision-mission-mandate", "why-fpis-was-created", "our-activities", "role-of-stakeholders", "enforcement-of-export-standard-act", "fumigant-act"] },
  { label: "Services", slugs: ["what-we-do"] },
  { label: "SOP", slugs: ["guideline-for-commodity-export", "statutory-function", "operational-area", "activities-at-warehouse", "seaport-airport-border-dry-port", "warehouse-registration-procedure", "cost-and-documentation", "special-power-of-enforcement", "offence-and-penalty", "commodity-list", "prohibited-export-items", "definition-of-technical-terms"] },
  { label: "Section of FPIS", slugs: ["quality-control-and-certification", "pest-control-and-fumigation", "monitoring-and-enforcement", "task-force-unit", "training-school", "laboratory-and-research", "ict-unit"] },
  { label: "Publications", slugs: ["news", "press-release", "circulars", "events", "staff-training", "gallery"] },
  { label: "More", slugs: ["history", "contact"] },
];

















