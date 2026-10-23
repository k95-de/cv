/* ============================================================================
   THE FLOW · November edition · all words on the page (EN + DE)
   Khaled: edit text here, save, reload. Every fact comes from the live site
   (k95-de.github.io/cv) or APPLY/bot/profile.md. Keep it that way.
   ========================================================================== */
window.CV = {
  ui: {
    loading:   { en: "Priming the circuit", de: "Kreislauf wird befüllt" },
    menu:      { en: "Menu", de: "Menü" },
    close:     { en: "Close", de: "Schließen" },
    scroll:    { en: "Scroll to flow", de: "Scrollen" },
    skip:      { en: "Skip to content", de: "Zum Inhalt" },
    navAbout:  { en: "Profile", de: "Profil" },
    navCircuit:{ en: "The circuit", de: "Der Kreislauf" },
    navKit:    { en: "Toolkit", de: "Werkzeuge" },
    navEdu:    { en: "Education", de: "Ausbildung" },
    navContact:{ en: "Contact", de: "Kontakt" },
    downloadCV:{ en: "Download CV (PDF)", de: "Lebenslauf (PDF)" },
    copyLink:  { en: "Copy link", de: "Link kopieren" },
    copied:    { en: "Copied", de: "Kopiert" },
    soundOn:   { en: "Sound on", de: "Ton an" },
    soundOff:  { en: "Sound off", de: "Ton aus" },
    classic:   { en: "Ride the 3D pipe (classic version)", de: "Durch das 3D-Rohr fahren (klassische Version)" },
    backTop:   { en: "Back to the source", de: "Zurück zum Anfang" },
    heatHint:  { en: "Move to add heat", de: "Bewegen = Wärme" },
    tapHint:   { en: "Drag to add heat", de: "Ziehen = Wärme" },
    drag:      { en: "Scroll", de: "Scroll" },
    station:   { en: "Station", de: "Station" },
    gateOpen:  { en: "Gate opens", de: "Tor öffnet" },
    gatePass:  { en: "Gate passed", de: "Tor geschafft" },
    rights:    { en: "Built by hand. No templates.", de: "Von Hand gebaut. Ohne Vorlage." },
    availShort:{ en: "Available now", de: "Ab sofort verfügbar" },
    coolDown:  { en: "Cooling down", de: "Kühlt ab" },
    coolDone:  { en: "Circuit at rest", de: "Kreislauf in Ruhe" }
  },

  hero: {
    eyebrow: { en: "Interactive CV · Nuremberg, Germany", de: "Interaktiver Lebenslauf · Nürnberg" },
    first: "Khaled",
    last: "Abdelhadi",
    role: { en: "Thermal & Fluid Engineer", de: "Ingenieur für Thermik & Fluide" },
    sub:  { en: "1D simulation · vehicle cooling · hydraulics", de: "1D-Simulation · Fahrzeugkühlung · Hydraulik" },
    line: { en: "I turn heat, flow and pressure into design decisions.",
            de: "Ich mache aus Wärme, Strömung und Druck klare Design-Entscheidungen." }
  },

  marquee: ["GT-SUITE", "1D CFD", "Cooling circuits", "Pump sizing", "E-motor cooling",
            "Battery & HV cooling", "ANSYS Maxwell", "Altair HyperWorks", "PTC Creo", "Python", "MATLAB"],

  about: {
    kicker: { en: "01 · Profile", de: "01 · Profil" },
    statement: {
      en: "Five years inside the cooling circuits of electric and diesel trucks and buses at MAN and TRATON. I take 3D geometry, supplier data and test results and turn them into validated 1D models that show a team where the heat goes, and what to change.",
      de: "Fünf Jahre in den Kühlkreisläufen von E- und Diesel-Lkw und Bussen bei MAN und TRATON. Ich nehme 3D-Geometrie, Lieferantendaten und Messwerte und baue daraus validierte 1D-Modelle. Die zeigen dem Team, wohin die Wärme geht und was man ändern muss."
    },
    facts: [
      { n: 5, pre: "~", label: { en: "years of simulation at MAN / TRATON", de: "Jahre Simulation bei MAN / TRATON" } },
      { n: 8, label: { en: "positions on the route", de: "Stationen auf der Route" } },
      { n: 2, label: { en: "degrees: B.Sc. and M.Eng.", de: "Abschlüsse: B.Sc. und M.Eng." } },
      { n: 3, label: { en: "languages", de: "Sprachen" } }
    ]
  },

  circuit: {
    kicker: { en: "02 · The circuit", de: "02 · Der Kreislauf" },
    title:  { en: "A career as one flow", de: "Ein Werdegang als eine Strömung" },
    intro:  { en: "Every station is a junction in the line. The coolant picks up heat the further it goes.",
              de: "Jede Station ist eine Verzweigung in der Leitung. Je weiter das Kühlmittel fließt, desto mehr Wärme nimmt es auf." },
    end:    { en: "The flow continues", de: "Die Strömung geht weiter" },
    endLine:{ en: "A flow never stops. It finds new paths.", de: "Eine Strömung hört nie auf. Sie findet neue Wege." }
  },

  /* kind: "edu" = gate panel (narrow), "job" = full station */
  stations: [
    { kind: "edu", gate: "start", years: "2013",
      org: { en: "Bachelor's begins", de: "Bachelor beginnt" },
      place: { en: "Middle East Technical University · Northern Cyprus Campus", de: "Middle East Technical University · Northern-Cyprus-Campus" },
      role: { en: "Mechanical Engineering · 4 semesters", de: "Maschinenbau · 4 Semester" } },
    { kind: "edu", years: "2015",
      org: { en: "Transfer to Alfaisal", de: "Wechsel zur Alfaisal" },
      place: { en: "Alfaisal University · Riyadh", de: "Alfaisal University · Riad" },
      role: { en: "Mechanical Engineering continues", de: "Maschinenbau geht weiter" } },
    { kind: "job", img: "assets/jobs/aero.webp", years: "2016–18",
      dur: { en: "Jun 2016 – Jun 2018 · 2 yrs", de: "Juni 2016 – Juni 2018 · 2 Jahre" },
      org: "Shell Eco-Marathon Asia", place: { en: "Singapore", de: "Singapur" },
      role: { en: "CFRP Design & Manufacturing Student", de: "Werkstudent CFK-Konstruktion & Fertigung" },
      tools: ["PTC Creo", "CNC", "CFRP lay-up", "Tensile testing"],
      bullets: {
        en: ["Designed the vehicle body in Creo and built carbon-fibre moulds from CNC-machined foam.",
             "Led the composite lay-up and curing of a monocoque shell, proven by tensile testing."],
        de: ["Fahrzeugkarosserie in Creo konstruiert und CFK-Formen aus CNC-gefrästem Schaum gebaut.",
             "Lay-up und Aushärtung eines Monocoques geleitet, durch Zugversuche nachgewiesen."] } },
    { kind: "job", img: "assets/jobs/mold.webp", years: "2017–18",
      dur: { en: "Jul 2017 – Jan 2018 · 7 mos", de: "Juli 2017 – Jan. 2018 · 7 Monate" },
      org: "Alfanar Electric", place: { en: "Riyadh, Saudi Arabia", de: "Riad, Saudi-Arabien" },
      role: { en: "Plastic Mould Design & Manufacturing Student", de: "Werkstudent Kunststoff-Werkzeugbau" },
      tools: ["PTC Creo", "CNC", "Plastic-flow simulation", "Steel moulds"],
      bullets: {
        en: ["Designed and machined steel injection moulds in PTC Creo and programmed the CNC.",
             "Ran plastic-flow simulations to find and remove common moulding defects."],
        de: ["Stahl-Spritzgusswerkzeuge in PTC Creo konstruiert und gefertigt, CNC programmiert.",
             "Kunststoff-Fließsimulationen genutzt, um typische Gussfehler zu finden und zu beheben."] } },
    { kind: "edu", gate: "done", years: "2018",
      org: { en: "B.Sc. Mechanical Engineering", de: "B.Sc. Maschinenbau" },
      place: { en: "Alfaisal University · Riyadh", de: "Alfaisal University · Riad" },
      role: { en: "Bachelor's completed", de: "Bachelor abgeschlossen" } },
    { kind: "edu", gate: "start", years: "2019",
      org: { en: "Master's begins", de: "Master beginnt" },
      place: { en: "Esslingen University · Germany", de: "Hochschule Esslingen · Deutschland" },
      role: { en: "Design & Development in Mechanical & Automotive Engineering", de: "Design & Development in Mechanical & Automotive Engineering" } },
    { kind: "job", img: "assets/jobs/battery.webp", years: "2020",
      dur: { en: "Jan 2020 – Aug 2020 · 8 mos", de: "Jan. 2020 – Aug. 2020 · 8 Monate" },
      org: "A123 Systems", place: { en: "Stuttgart, Germany", de: "Stuttgart, Deutschland" },
      role: { en: "Engineering Development & Management Student", de: "Werkstudent Entwicklung & Projektmanagement" },
      tools: ["JIRA", "ASPICE / V-cycle", "BMS", "Project KPIs"],
      bullets: {
        en: ["Built project KPIs from JIRA tickets across the V-cycle (ASPICE) phases for milestone forecasting.",
             "Analysed the battery-management hardware/software architecture and the mechanical pack design."],
        de: ["Projekt-KPIs aus JIRA-Tickets über die V-Modell-Phasen (ASPICE) für die Meilenstein-Prognose gebaut.",
             "Hardware- und Software-Architektur des Batteriemanagements und das mechanische Pack-Design analysiert."] } },
    { kind: "job", img: "assets/jobs/stress.webp", years: "2020",
      dur: { en: "Mar 2020 – Aug 2020 · 6 mos", de: "März 2020 – Aug. 2020 · 6 Monate" },
      org: "Esslingen Rennstall", place: { en: "Formula Student · Esslingen", de: "Formula Student · Esslingen" },
      role: { en: "CFRP Monocoque Structure · Simulation Member", de: "CFK-Monocoque-Struktur · Simulation" },
      tools: ["Altair HyperWorks", "FEA", "CFRP monocoque", "BOM"],
      bullets: {
        en: ["Optimised the CFRP monocoque in Altair HyperWorks for less weight and more torsional stiffness.",
             "Delivered a production-ready BOM and 2D drawings for the next chassis generation."],
        de: ["CFK-Monocoque in Altair HyperWorks optimiert: weniger Gewicht, mehr Torsionssteifigkeit.",
             "Fertigungsreife Stückliste und 2D-Zeichnungen für die nächste Chassis-Generation geliefert."] } },
    { kind: "job", img: "assets/jobs/emotor.webp", years: "2020–21",
      dur: { en: "Oct 2020 – Mar 2021 · 6 mos", de: "Okt. 2020 – März 2021 · 6 Monate" },
      org: "MAN Truck & Bus", place: { en: "Nuremberg, Germany", de: "Nürnberg, Deutschland" },
      role: { en: "1D Simulation Student · E-Motor Cooling", de: "Werkstudent 1D-Simulation · E-Motor-Kühlung" },
      tools: ["GT-SUITE", "3D → 1D", "Oil circuit", "Drive-cycle validation"],
      bullets: {
        en: ["Built a bus e-motor 1D thermal model in GT-SUITE from scratch, including the oil circuit.",
             "Converted 3D geometry to 1D and validated transient results against drive-cycle test data."],
        de: ["1D-Thermomodell eines Bus-E-Motors in GT-SUITE von Grund auf gebaut, inklusive Ölkreislauf.",
             "3D-Geometrie nach 1D überführt und transiente Ergebnisse gegen Fahrzyklus-Messdaten validiert."] } },
    { kind: "edu", gate: "done", years: "2021",
      org: { en: "M.Eng. Mechanical & Automotive Engineering", de: "M.Eng. Mechanical & Automotive Engineering" },
      place: { en: "Esslingen University · Germany", de: "Hochschule Esslingen · Deutschland" },
      role: { en: "Master's completed · thesis graded 1.2", de: "Master abgeschlossen · Masterarbeit mit 1,2" } },
    { kind: "job", img: "assets/jobs/flux.webp", years: "2021–22",
      dur: { en: "Dec 2021 – May 2022 · 6 mos", de: "Dez. 2021 – Mai 2022 · 6 Monate" },
      org: "MAN Truck & Bus", place: { en: "Nuremberg, Germany", de: "Nürnberg, Deutschland" },
      role: { en: "1D / 2D Simulation Engineer · E-Motor Cooling", de: "1D-/2D-Simulationsingenieur · E-Motor-Kühlung" },
      tools: ["ANSYS Maxwell", "GT-SUITE", "Loss maps", "Hotspots"],
      bullets: {
        en: ["Simulated e-motor electromagnetics in ANSYS Maxwell and calibrated GT thermal models with AUDI-Toolbox loss maps.",
             "Found critical hotspots, demagnetisation risk and previously uncovered system losses."],
        de: ["E-Motor-Elektromagnetik in ANSYS Maxwell simuliert und GT-Thermomodelle mit AUDI-Toolbox-Verlustkarten kalibriert.",
             "Kritische Hotspots, Entmagnetisierungsrisiko und bisher nicht erfasste Systemverluste gefunden."] } },
    { kind: "job", img: "assets/jobs/bus.webp", years: "2022–25",
      dur: { en: "May 2022 – Apr 2025 · 3 yrs", de: "Mai 2022 – Apr. 2025 · 3 Jahre" },
      org: "MAN Truck & Bus", place: { en: "Nuremberg, Germany", de: "Nürnberg, Deutschland" },
      role: { en: "1D Simulation Engineer · Vehicle Cooling Systems", de: "1D-Simulationsingenieur · Fahrzeug-Kühlsysteme" },
      tools: ["GT-SUITE", "3D CFD data", "Pump sizing", "Cooling circuits"],
      bullets: {
        en: ["Led thermal simulations for electric and diesel truck cooling in GT, calibrated against 3D CFD data and physical tests.",
             "Optimised pump sizing and operating points across interconnected circuits: battery, HV, cabin, refrigerant.",
             "Recommended design changes such as venting positions, flow restrictors and pipe diameters."],
        de: ["Thermische Simulationen für E- und Diesel-Lkw-Kühlung in GT geleitet, gegen 3D-CFD-Daten und Messungen kalibriert.",
             "Pumpenauslegung und Betriebspunkte über vernetzte Kreisläufe optimiert: Batterie, HV, Kabine, Kältemittel.",
             "Design-Änderungen empfohlen, zum Beispiel Entlüftungspositionen, Drosseln und Rohrdurchmesser."] } },
    { kind: "job", img: "assets/jobs/network.webp", years: "2025–26",
      dur: { en: "Apr 2025 – Mar 2026 · 1 yr", de: "Apr. 2025 – März 2026 · 1 Jahr" },
      org: "TRATON R&D Germany", place: { en: "Nuremberg, Germany", de: "Nürnberg, Deutschland" },
      role: { en: "1D Simulation Expert · Vehicle Cooling Systems", de: "1D-Simulationsexperte · Fahrzeug-Kühlsysteme" },
      tools: ["GT-SUITE", "Variant sub-models", "Methodology", "Team onboarding"],
      bullets: {
        en: ["Built and owned the 1D cooling-circuit models for interconnected circuits: battery, HV components, cabin, refrigerant.",
             "Built configurable variant sub-models, for example for different battery counts, reused across vehicles.",
             "Documented the simulation methodology now used across the team and onboarded new engineers.",
             "Added pipe insulation to coolant-line models and assessed immersion cooling for a customer-specific project."],
        de: ["1D-Kühlkreislaufmodelle für vernetzte Kreisläufe gebaut und verantwortet: Batterie, HV-Komponenten, Kabine, Kältemittel.",
             "Konfigurierbare Varianten-Teilmodelle gebaut, zum Beispiel für verschiedene Batterieanzahlen, fahrzeugübergreifend genutzt.",
             "Die teamweit genutzte Simulationsmethodik dokumentiert und neue Ingenieure eingearbeitet.",
             "Rohrisolierung in die Kühlleitungsmodelle eingebaut und Tauchkühlung für ein Kundenprojekt bewertet."] } },
    { kind: "job", img: "assets/jobs/ai.webp", years: "2026",
      dur: { en: "Mar 2026 – Aug 2026 · 6 mos", de: "März 2026 – Aug. 2026 · 6 Monate" },
      org: { en: "Study & Growth", de: "Studium & Weiterentwicklung" },
      place: { en: "Self-study & continuous improvement", de: "Selbststudium & ständige Verbesserung" },
      role: { en: "AI · Project Management · Sales Operations", de: "KI · Projektmanagement · Sales Operations" },
      tools: ["AI tools & automation", "Project management", "Sales operations"],
      bullets: {
        en: ["Deepened practical AI skills: modern tools, workflows and automation.",
             "Sharpened project-management and sales-operations basics, bridging engineering and the business side."],
        de: ["Praktische KI-Kenntnisse vertieft: moderne Tools, Workflows und Automatisierung.",
             "Grundlagen in Projektmanagement und Sales Operations geschärft, als Brücke zwischen Technik und Business."] } }
  ],

  kit: {
    kicker: { en: "03 · Toolkit", de: "03 · Werkzeuge" },
    title:  { en: "What I bring to the bench", de: "Was ich mitbringe" },
    groups: [
      { h: { en: "Simulation", de: "Simulation" },
        items: ["GT-SUITE", "1D CFD", "Thermal management", "ANSYS Maxwell", "Altair HyperWorks", "Plastic-flow simulation"] },
      { h: { en: "Fluid systems", de: "Fluidsysteme" },
        items: { en: ["Pressure loss & pipe sizing", "Pump sizing & operating points", "Flow distribution", "2- / 3-way & check valves", "Venting & flow restrictors"],
                 de: ["Druckverlust & Rohrauslegung", "Pumpenauslegung & Betriebspunkte", "Strömungsverteilung", "2-/3-Wege- & Rückschlagventile", "Entlüftung & Drosseln"] } },
      { h: { en: "Design", de: "Konstruktion" },
        items: ["PTC Creo", "SpaceClaim", "2D drawings & tolerances", "CFRP & composites"] },
      { h: { en: "Data & process", de: "Daten & Prozess" },
        items: ["Python", "MATLAB / Simulink", "JIRA", "Agile / Scrum", "ASPICE V-cycle"] }
    ],
    certsTitle: { en: "Recent certificates", de: "Aktuelle Zertifikate" },
    certs: [
      { t: "Design of Industrial Piping Systems", by: "L&T EduTech · Coursera", y: "2026" },
      { t: "Applied Computational Fluid Dynamics", by: "Siemens · Coursera", y: "2026" },
      { t: "AI for Design and Optimization", by: "University of Michigan · Coursera", y: "2026" },
      { t: "Python for Data Science, AI & Development", by: "IBM · Coursera", y: "2026" },
      { t: "Claude Code 101", by: "Anthropic Academy", y: "2026" },
      { t: "SimOps Fundamentals", by: "Simulation process automation", y: "2025" }
    ]
  },

  edu: {
    kicker: { en: "04 · Education", de: "04 · Ausbildung" },
    items: [
      { deg: "M.Eng.", y: "2019 – 2021",
        name: { en: "Design & Development in Mechanical & Automotive Engineering", de: "Design & Development in Mechanical & Automotive Engineering" },
        where: { en: "Esslingen University · Germany", de: "Hochschule Esslingen · Deutschland" },
        note: { en: "Thesis graded 1.2: a methodology for electric-motor simulation for buses and trucks.",
                de: "Masterarbeit mit 1,2 bewertet: Methodik der E-Motor-Simulation für Busse und Lkw." } },
      { deg: "B.Sc.", y: "2013 – 2018",
        name: { en: "Mechanical Engineering", de: "Maschinenbau" },
        where: { en: "Alfaisal University · Riyadh (started at METU Northern Cyprus Campus)", de: "Alfaisal University · Riad (Start an der METU Northern Cyprus Campus)" },
        note: { en: "Hands-on alongside: Shell Eco-Marathon Asia and Alfanar Electric.",
                de: "Praxis nebenbei: Shell Eco-Marathon Asia und Alfanar Electric." } }
    ],
    langTitle: { en: "Languages", de: "Sprachen" },
    langs: [
      { l: { en: "Arabic", de: "Arabisch" }, v: { en: "Native", de: "Muttersprache" }, p: 1 },
      { l: { en: "English", de: "Englisch" }, v: { en: "Fluent", de: "Fließend" }, p: .9 },
      { l: { en: "German", de: "Deutsch" }, v: { en: "Professional (B2)", de: "B2 (Beruf)" }, p: .7 }
    ]
  },

  /* recruiter mode: one calm page, skimmable in 30 seconds (facts only from the sections above) */
  rec: {
    toggle:   { en: "Recruiter mode · 30 s", de: "Recruiter-Modus · 30 s" },
    heroSub:  { en: "One calm page · print-ready", de: "Eine ruhige Seite · druckfertig" },
    kicker:   { en: "30-second summary", de: "Kurzprofil in 30 Sekunden" },
    docTitle: { en: "Khaled Abdelhadi · 30-second CV", de: "Khaled Abdelhadi · Lebenslauf in 30 Sekunden" },
    photoAlt: { en: "Portrait of Khaled Abdelhadi", de: "Porträt von Khaled Abdelhadi" },
    strengthsTitle: { en: "Core strengths", de: "Stärken" },
    toolsTitle: { en: "Tools", de: "Tools" },
    expTitle:   { en: "Experience", de: "Berufserfahrung" },
    eduTitle:   { en: "Education", de: "Ausbildung" },
    langTitle:  { en: "Languages", de: "Sprachen" },
    locTitle:   { en: "Location", de: "Ort" },
    earlier:    { en: "Earlier", de: "Davor" },
    location:   { en: "Nuremberg, Germany", de: "Nürnberg, Deutschland" },
    reloc:      { en: "Open to relocation and remote work", de: "Offen für Umzug und Remote-Arbeit" },
    thesis:     { en: "Thesis graded 1.2", de: "Masterarbeit: Note 1,2" },
    email:      { en: "Email", de: "E-Mail" },
    copy:       { en: "Share link", de: "Link teilen" },
    print:      { en: "Print / save PDF", de: "Drucken / PDF" },
    full:       { en: "Back to the full experience", de: "Zurück zur ganzen Seite" },
    switchOn:   { en: "Recruiter mode on", de: "Recruiter-Modus an" },
    switchOff:  { en: "Recruiter mode off", de: "Recruiter-Modus aus" },
    /* each proof max ~12 words, every claim traceable to APPLY/bot/profile.md or the stations above */
    strengths: [
      { h: { en: "1D thermal simulation", de: "1D-Thermosimulation" },
        p: { en: "~5 years in GT-SUITE at MAN / TRATON, electric and diesel trucks.",
             de: "~5 Jahre GT-SUITE bei MAN / TRATON, E- und Diesel-Lkw." } },
      { h: { en: "Vehicle cooling circuits", de: "Fahrzeug-Kühlkreisläufe" },
        p: { en: "Built and owned the 1D cooling-circuit models, calibrated against 3D CFD and test-bench data.",
             de: "1D-Kühlkreislaufmodelle gebaut und verantwortet, kalibriert mit 3D-CFD- und Prüfstandsdaten." } },
      { h: { en: "Pumps & hydraulics", de: "Pumpen & Hydraulik" },
        p: { en: "Optimised pump sizing; recommended venting positions, flow restrictors and pipe diameters.",
             de: "Pumpenauslegung optimiert; Entlüftung, Drosseln und Rohrdurchmesser empfohlen." } },
      { h: { en: "E-motor thermal", de: "E-Motor-Thermik" },
        p: { en: "Bus e-motor 1D model built from scratch; found hotspots and demagnetisation risk.",
             de: "Bus-E-Motor-1D-Modell neu aufgebaut; Hotspots und Entmagnetisierungsrisiko gefunden." } },
      { h: { en: "Methods & team", de: "Methodik & Team" },
        p: { en: "Variant sub-models reused across vehicles; documented the team's simulation method.",
             de: "Varianten-Teilmodelle fahrzeugübergreifend genutzt; Simulationsmethodik fürs Team dokumentiert." } }
    ],
    emailCta:  { en: "Email me", de: "E-Mail schreiben" },
    cvShort:   { en: "CV (PDF)", de: "CV (PDF)" },
    newTab:    { en: "opens in a new tab", de: "öffnet in neuem Tab" },
    tools: ["GT-SUITE", "1D CFD", "ANSYS Maxwell", "Altair HyperWorks", "PTC Creo", "SpaceClaim", "Python", "MATLAB / Simulink", "JIRA"]
  },

  contact: {
    kicker: { en: "05 · Contact", de: "05 · Kontakt" },
    big1: { en: "Let's", de: "Lass uns" },
    big2: { en: "talk flow", de: "reden" },
    line: { en: "Available now. Based in Nuremberg, open to relocation and remote work.",
            de: "Ab sofort verfügbar. Wohnort Nürnberg, offen für Umzug und Remote-Arbeit." },
    citizen: { en: "German-Egyptian citizen", de: "Deutsch-ägyptischer Staatsbürger" },
    email: "kabdelhadi795@gmail.com",
    linkedinUrl: "https://www.linkedin.com/in/khaled-de",
    cv: "assets/Khaled-Abdelhadi-CV.pdf"
  }
};
