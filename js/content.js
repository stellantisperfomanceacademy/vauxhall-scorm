/* Vauxhall Product & Technology 2026 — course content (authoritative source:
   Vauxhall_Product_Technology_2026.docx). Drives the slide engine in engine.js. */
window.COURSE = {
  meta: {
    title: "Vauxhall Product & Technology",
    subtitle: "Employee Learning Guide — 2026",
    blurb:
      "Everything a Vauxhall employee needs to know — history, the full 2026 range, and what the press are saying right now.",
    chips: ["45 Minutes", "Quiz Included", "Model Year 2026"],
    passMark: 0.75
  },

  objectives: [
    "Identify every model in the current Vauxhall 2026 range (cars AND vans).",
    "Recall the key milestones in Vauxhall's 168+ year history — including the fun bits.",
    "Quote what the motoring press currently say about each vehicle.",
    "Name discontinued models and explain what replaced them."
  ],

  /* ---- SECTION 1: HISTORY ---- */
  nameOrigin: {
    eyebrow: "Where did the name come from?",
    didYouKnow: "The Vauxhall name is over 800 years old.",
    body: [
      "In the 13th century, mercenary Sir Falkes de Breauté was granted land south of the Thames.",
      'His home became known as "Fawkes Hall" — which morphed into "Foxhall" and eventually "Vauxhall".',
      "His personal crest — a mythical Griffin — is still the basis for the Vauxhall logo today!"
    ]
  },

  timeline: [
    { year: "1857", text: "Alexander Wilson sets up a marine engine factory in Vauxhall, London. He names it after the area — and so the story begins." },
    { year: "1903", text: 'Vauxhall builds its very first "horseless carriage" — a 5HP, two-seater steered by a tiller (no steering wheel!) with absolutely no reverse gear.', fact: "It cost 130 Guineas (£136.50). Adjusted for inflation, that's roughly £17,000 today… not bad for a car that couldn't go backwards!" },
    { year: "1904", text: "Director Percy Kidner drives a brand-new 6HP, wheel-steered 4-seater in the gruelling London-to-Glasgow reliability trial. Despite being the smallest car there, it lost only 7 out of a possible 1,000 points.", fact: "Top speed? A breathtaking 18 mph. Fuel economy? An astounding 37 mpg — remarkable for any era, let alone 1904!" },
    { year: "1905", text: "Vauxhall moves to Luton, Bedfordshire, where the heart of the brand still beats today." },
    { year: "1910", text: 'The legendary "Prince Henry" (C-Type) launches — a 3-litre, 25HP sports car that put Vauxhall on the map internationally.' },
    { year: "1925", text: "General Motors acquires Vauxhall. Access to American investment supercharges the business." },
    { year: "1939–45", title: "War Effort", text: "Vauxhall's Luton factory switches entirely to wartime production. The plant produces over 250,000 Bedford military trucks and over 5,600 Churchill tanks — helping to equip the British Army from D-Day to VE Day.", fact: "The Churchill tank was designed and put into production in under 12 months — Vauxhall's workers built one every working hour." },
    { year: "1964", text: "The iconic Vauxhall Viva launches — a rival to the Mini and the Ford Anglia, beloved by a generation of British drivers." },
    { year: "1979", text: "The Astra arrives. It would go on to become one of the most important cars in British motoring history." },
    { year: "1983", text: "The Nova launches (later renamed the Corsa in 1993). A city car that would eventually become the UK's best-selling car." },
    { year: "2000s", text: "The Vectra, Zafira, and Insignia era. Vauxhall cements itself as a family favourite." },
    { year: "2017", text: "Vauxhall joins the Stellantis group (formerly PSA). A new chapter of shared technology and electrification begins." },
    { year: "2020", text: "Vauxhall launches its first fully electric cars: the Corsa-e and Mokka-e. The electric journey starts in earnest." },
    { year: "2023", text: "The Astra Electric arrives, making the iconic family hatchback available with zero emissions for the first time." },
    { year: "2024", text: "The all-new Grandland Electric launches, offering up to 325 miles of range. The brand-new Frontera arrives — a spiritual revival of a classic name." },
    { year: "2026", text: "Vauxhall's most electrified range ever. Every car and van now has an EV or hybrid option. The Griffin flies into the future." }
  ],

  /* ---- SECTION 2: CARS ---- */
  cars: [
    {
      name: "Corsa", image: "corsa",
      tagline: "Britain's Favourite Small Car",
      pitch: "The Corsa has been the UK's best-selling car multiple times — and in 2026 it's better than ever, with petrol, mild hybrid, and full electric options.",
      stats: [ {v:"266", l:"EV MILES (WLTP)"}, {v:"309", l:"BOOT LITRES"}, {v:"5★", l:"EURO NCAP"} ],
      keyFacts: [
        "Available as: Petrol (75/100/130PS), 48V Mild Hybrid (108 or 143PS), and Full Electric (136 or 156PS)",
        "Corsa Electric Long Range: up to 266 miles WLTP from a 51kWh battery (updated for 2026)",
        "Corsa Electric now features Vehicle-to-Load (V2L) — power your devices straight from the car",
        "Boot space: 309 litres (petrol/hybrid) or 267 litres (electric)",
        "5-star Euro NCAP safety rating",
        "Prices from: £19,725 (petrol) | £22,075 (mild hybrid) | £27,505 (electric)"
      ],
      headToHead: [
        "Corsa Electric (266 miles) edges out the Ford Puma Gen-E (259 miles) — Britain's former best-seller vs. its current challenger.",
        "LED headlights, lane keep assist, and rear park sensors all come as standard — rivals often charge extra."
      ],
      funFact: "The Corsa nameplate was launched in 1993, replacing the Nova. In total, more than 1.5 million Corsas have been sold in the UK alone — one of the best-selling cars in British motoring history.",
      press: [
        { quote: "All previous Corsas have reeked of mediocrity, but this one drives with poise and precision: it's more refined, efficient, comfortable and it looks smart too.", src: "Top Gear, 2026" },
        { quote: "It's significantly less peacocky than its Honda or Mini rivals, and it'll go further and has tons more room for people.", src: "Top Gear — Corsa Electric" }
      ]
    },
    {
      name: "Frontera", image: "frontera",
      tagline: "The Affordable SUV Everybody's Talking About",
      pitch: "New for 2024, the Frontera is Vauxhall's entry-level SUV — already making waves with its unbeatable price point and proper EV credentials.",
      stats: [ {v:"253", l:"EV MILES (EXT)"}, {v:"7", l:"SEATS (HYBRID)"}, {v:"£22,495", l:"FROM"} ],
      keyFacts: [
        "Available as: 48V Mild Hybrid (99 or 134PS) or Full Electric (113PS)",
        "Frontera Electric Standard Range: up to 189 miles from 44kWh battery",
        "Frontera Electric Extended Range: up to 253 miles from 54kWh battery",
        "Prices from: £22,495 (Electric) | £24,855 (Hybrid)",
        "Generous standard kit: LED lights, rear parking sensors, 10\" touchscreen",
        "Available in 5-seat and (Hybrid only) 7-seat configurations"
      ],
      headToHead: [
        "One of the most affordable electric SUVs on sale in the UK — £22,495 vs Renault 4 E-Tech at £23,445.",
        "The Hybrid's 134PS version does 0–62mph in 9 seconds — quicker than many expect."
      ],
      funFact: "The original Frontera was built from 1991 to 2004 as a proper 4x4 off-roader. The new 2024 Frontera shares only its name — but brings modern EV tech and a much lower price tag to a whole new generation.",
      press: [
        { quote: "Twenty-twenties Frontera is categorically not 1990s Frontera — in fact, it's a pretty solid effort from Vauxhall.", src: "Top Gear, 2026" },
        { quote: "As a sensible and very affordable small SUV it ticks all the right boxes: there's loads of space, plenty of standard kit, a comfortable driving experience and low running costs.", src: "RAC Drive, 2026" }
      ]
    },
    {
      name: "Mokka", image: "mokka",
      tagline: "The Bold One",
      pitch: "The Mokka turns heads wherever it goes. That distinctive Vizor front end is unmistakable — and the 2026 range now includes the 281PS Mokka GSE for serious performance fans.",
      stats: [ {v:"281", l:"PS (GSE)"}, {v:"5.9", l:"0–62 SEC (GSE)"}, {v:"250", l:"EV MILES"} ],
      keyFacts: [
        "Available as: 48V Mild Hybrid (1.2T, 134PS), or Full Electric (154PS, or 281PS GSE)",
        "Mokka Electric: up to 250 miles WLTP from a 54kWh battery",
        "Mokka GSE: 281PS, 0–62mph in 5.9 seconds — the most powerful Mokka ever built",
        "100kW rapid charging: 0–80% in 30 minutes",
        "The Vizor front design integrates grille, headlights, and badge into one dramatic module",
        "Prices from: approx. £25,000 (Hybrid) | £31,680 (Electric)"
      ],
      headToHead: [
        "Digital instrument cluster standard across the range — rivals often charge extra.",
        "The Mokka's Vizor design is genuinely unlike anything from Ford, Renault, or VW."
      ],
      funFact: '"Mokka" is the German word for mocha coffee — fitting for a car that gives you a bit of a kick! The Vizor front design, introduced on the 2021 Mokka, won multiple design awards and is now used across the whole Vauxhall range.',
      press: [
        { quote: "The small SUV class is a busy sector, but the Vauxhall Mokka has the sharp looks to help it stand out from the crowd. Revisions for 2025 have helped to make the Mokka even easier to live with.", src: "Auto Express, 2025" },
        { quote: "The regular Mokka Electric gets a 154bhp electric motor mated to a 54kWh battery for up to 250 miles of range… then there's the range-topping Mokka GSE, the first of a whole new breed of electric performance Vauxhalls.", src: "Top Gear, 2026" }
      ]
    },
    {
      name: "Astra", image: "astra",
      tagline: "The Iconic Family Hatch, Electrified",
      pitch: "The Astra has been a British staple since 1979. In 2026 it's available as Petrol, 48V Hybrid, PHEV, or full EV — the most powertrain options it's ever offered.",
      stats: [ {v:"281", l:"EV MILES (WLTP)"}, {v:"125", l:"MPG (PHEV)"}, {v:"52", l:"PHEV EV MILES"} ],
      keyFacts: [
        "Available as: 48V Hybrid (145PS), PHEV (196PS, up to 52 miles electric-only range), or Full Electric (156PS)",
        "Astra Electric 2026: up to 281 miles WLTP (hatch) from new 55.4kWh NMC battery",
        "NEW for 2026: Vehicle-to-Load (V2L) on Electric, three-level regen braking via paddles",
        "Astra PHEV: official 125mpg combined, 52-mile EV range, 7-speed gearbox for 2026",
        "Dual 10\" digital screens standard; clean, driver-focused cockpit",
        "Prices from: £29,995 (Astra range)"
      ],
      headToHead: [
        "Astra Electric's 55.4kWh battery delivers 281 miles — more efficient per kWh than the VW ID.3 Pro (269 miles from 59kWh). More range, smaller battery.",
        "PHEV covers most daily commutes on electricity alone — barely touches the fuel tank."
      ],
      funFact: "The Astra name has spanned eight generations since 1979. The current Astra Electric shares its platform with the Peugeot e-308 and Citroën ë-C4 — but Vauxhall's version is consistently the best-reviewed of the trio.",
      press: [
        { quote: "We like the eighth generation Astra, and the electric one is the best of the lot… it looks great, drives well. A solid all-round proposition.", src: "Top Gear" },
        { quote: "The Astra is not the longest range, the fastest charging or the most fun family EV. But it really is a smart, comfortable and weirdly charming car to live with, and it's got tonnes of equipment at an extraordinary price.", src: "Electrifying.com, 2026" }
      ]
    },
    {
      name: "Grandland", image: "grandland",
      tagline: "The Big SUV with Big Ambitions",
      pitch: "The all-new Grandland launched in 2024 and it means business. With up to 323 miles on the standard electric, and a 97kWh Long Range offering a massive 435 miles, it's the most capable Vauxhall ever made.",
      stats: [ {v:"435", l:"EV MILES (LR)"}, {v:"26", l:"MIN 20–80%"}, {v:"550", l:"BOOT LITRES"} ],
      keyFacts: [
        "Available as: 48V Mild Hybrid (134PS) or Full Electric (210PS FWD, 320PS AWD, or Long Range 97kWh)",
        "Grandland Electric (73kWh): up to 323 miles WLTP | 160kW rapid charging (20–80% in 26 minutes)",
        "Grandland Electric AWD: 320PS, 0–62mph in 6.1 seconds, up to 311 miles range",
        "Long Range (97kWh) version: up to 435 miles WLTP",
        "3D Vizor front | Intelli-Lux Pixel Matrix HD headlights (GS and above)",
        "GS and Ultimate: 16\" infotainment + wireless phone charging",
        "Boot: 550 litres (electric) — one of the best in class",
        "Prices from: £34,700 (Hybrid) | £35,455 (Electric)"
      ],
      headToHead: [
        "160kW rapid charging matches the Peugeot e-3008 and beats the VW ID.4 (135kW) — as fast to charge as the best.",
        "AWD version with 320PS undercuts most performance EV SUVs on price."
      ],
      funFact: "The 97kWh Long Range Grandland has enough battery capacity to drive from London to Edinburgh and back on a single charge — with miles to spare. That's over 800 miles of real-world range.",
      press: [
        { quote: "The EV is our preferred choice from behind the wheel because it's more comfortable, and with more than 400 miles of range quoted for the 97kWh battery version, the Grandland Electric is a decent option in the class.", src: "Auto Express, 2026" },
        { quote: "A vast improvement on the old Grandland it replaces and a rather pleasant family SUV, all told.", src: "Driving.co.uk (The Sunday Times), 2024" }
      ]
    }
  ],

  /* ---- SECTION 3: VANS ---- */
  vans: [
    {
      name: "Combo-e Life", image: "combo",
      tagline: "The Electric People Carrier",
      stats: [ {v:"174", l:"EV MILES"}, {v:"7", l:"SEATS"}, {v:"30", l:"MIN 0–80%"} ],
      keyFacts: [
        "Full EV: 136PS motor, 50kWh battery, up to 174 miles WLTP",
        "Seats up to 7 people — Medium or XL body styles",
        "0–80% charge in 30 minutes on 100kW rapid charger",
        "8-year battery warranty | Exempt from congestion charges | Zero VED",
        "6 months free BP Pulse subscription included"
      ],
      funFact: "The Combo-e Life shares its platform with the Citroën ë-Berlingo and Peugeot e-Rifter — essentially the same van in three different outfits. But Vauxhall's version consistently gets the best press in the UK market.",
      press: [
        { quote: "Spacious and ever-so useful, surprisingly affordable, recent redesign gives a cool appearance.", src: "The Independent, 2024" },
        { quote: "The Combo-e Life is full of surprises. By surprises, I mean little storage spaces. Every time you use it, you keep finding one you've never seen before.", src: "Carwow" }
      ]
    },
    {
      name: "Vivaro Electric", image: "vivaro",
      tagline: "The Zero-Emission Workhorse",
      stats: [ {v:"217", l:"EV MILES"}, {v:"1,226", l:"KG PAYLOAD"}, {v:"9", l:"SEATS (LIFE)"} ],
      keyFacts: [
        "136PS electric motor | 75kWh battery | Up to 217 miles WLTP (updated 2026 model)",
        "100kW rapid charging: 5–80% in 45 minutes",
        "Payload: up to 1,226kg",
        "Available as: Panel Van, Combi, Platform Cab, and Vivaro Life (people carrier, up to 9 seats)",
        "What Car? Medium Van of the Year winner",
        "Prices from: £42,055 exc. VAT (Electric)"
      ],
      funFact: "The Vivaro name dates back to 2001. The electric version was a genuine trailblazer — one of the first electric medium vans in the UK. Today it competes with the Ford E-Transit Custom and Mercedes eSprinter, often winning on value.",
      press: [
        { quote: "A stylish but practical package. Safety and equipment standards are high, so is build quality — we've no quarrels with the ride or handling.", src: "What Van?, 2024" }
      ]
    },
    {
      name: "Movano Electric", image: "movano",
      tagline: "The Electric Heavy-Hauler",
      stats: [ {v:"263", l:"EV MILES"}, {v:"1,480", l:"KG PAYLOAD"}, {v:"17", l:"M³ CARGO"} ],
      keyFacts: [
        "270PS electric motor | 75kWh battery | Up to 263 miles WLTP",
        "50kW DC rapid charging: 0–80% in 1 hour | 22kW AC: 0–80% in 4 hours",
        "Available: Panel Van L3/L4, Chassis Cab — 3.5T and 4.25T GVW",
        "4.25T payload: up to 1,480kg — still driveable on a standard car licence",
        "PIVG eligible (£5,000 government grant) | From approx. £46,795 exc. VAT (after grant)",
        "Cargo volume: up to 17m³"
      ],
      funFact: "The 4.25T version of the Movano Electric is legally driveable on a standard Category B car licence — no HGV licence needed. That means less paperwork, more drivers, and lower operating costs for businesses.",
      press: [
        { quote: "The Movano Electric comes in at a bit over £46,000 ex-VAT. It's well worth upgrading to the 4.25T chassis for less than £1,000 extra, as it doubles the payload and can still be driven on a standard car licence — making it cheaper than a Ford E-Transit and much cheaper than a Mercedes E-Sprinter.", src: "Carwow" }
      ]
    }
  ],

  /* ---- SECTION 4: RETIRED ---- */
  retired: [
    {
      name: "Crossland", image: "crossland",
      retired: "Retired Spring 2024",
      notice: "The Crossland was discontinued in Spring 2024 and is no longer on sale new. It has been replaced in the Vauxhall line-up by the new Frontera. You may still encounter customers with existing Crosslands on the road.",
      specs: [
        "Engine: 1.2T petrol — 108PS (manual) or 128PS (auto)",
        "No EV or hybrid option was ever offered",
        "Boot: 410 litres",
        "Economy: up to 48.7 mpg",
        "Price when new: from £22,550"
      ],
      why: "The Crossland's role as an affordable, practical small SUV is now fulfilled by the new Frontera — which does everything the Crossland did, but adds full EV capability and 7-seat options. A clear upgrade for both customers and the planet.",
      funFact: 'The Crossland was originally called the "Crossland X" when it launched in 2017 — the "X" was quietly dropped in 2020. No one seems to have noticed.'
    },
    {
      name: "Insignia", image: "insignia",
      retired: "Retired 2022",
      notice: "The Insignia was discontinued in 2022 and is no longer sold new. Vauxhall has not directly replaced it in the same D-segment saloon/estate class. Customers looking for a larger family car are typically directed to the Grandland.",
      specs: [
        "Engines: 1.5 Turbo D (120–162PS) | 2.0 Turbo D (167–207PS)",
        "Trims: Design and GS Line",
        "Boot: 490 litres (hatch) | 530 litres (Sports Tourer estate)",
        "No hybrid or EV version was ever offered"
      ],
      why: "The D-segment saloon/estate market has shrunk dramatically as buyers moved to SUVs. Rather than replace the Insignia, Vauxhall chose to invest in electrifying its SUV line-up — a decision that reflected changing customer preferences rather than a quality issue.",
      funFact: "The Insignia won the 2009 European Car of the Year award — beating the Ford Fiesta and Volkswagen Golf. Not bad for a car that many people overlook!"
    }
  ],

  /* ---- SECTION 5: COMPARISON ---- */
  comparison: {
    headers: ["Model", "Powertrain Options", "Top EV Range", "From Price", "Top Press Quote"],
    rows: [
      ["Corsa", "Petrol / Hybrid / Electric", "266 miles", "£19,725", '"Poise and precision" — Top Gear'],
      ["Frontera", "Hybrid / Electric", "253 miles", "£22,495", '"Ticks all the right boxes" — RAC'],
      ["Mokka", "Hybrid / Electric / GSE", "250 miles", "£25,000", '"Sharp looks to stand out" — Auto Express'],
      ["Astra", "Hybrid / PHEV / Electric", "281 miles", "£29,995", '"The best of the lot" — Top Gear'],
      ["Grandland", "Hybrid / Electric / AWD / LR", "435 miles*", "£34,700", '"Over 400 miles of range" — Auto Express'],
      ["Combo-e Life", "Electric", "174 miles", "POA", '"Full of surprises" — Carwow'],
      ["Vivaro Electric", "Electric", "217 miles", "£42,055 ex.VAT", '"High safety standards" — What Van?'],
      ["Movano Electric", "Electric", "263 miles", "£46,795 ex.VAT", '"Cheaper than Ford E-Transit" — Carwow']
    ],
    note: "*Long Range 97kWh version. Standard 73kWh: 323 miles."
  },

  /* ---- SECTION 6: QUIZ (correct = index) ---- */
  quiz: [
    { q: "What does the Vauxhall Griffin logo represent?",
      a: ["The coat of arms of Luton", "The personal crest of Sir Falkes de Breauté", "A mythical Roman war symbol", "The emblem of General Motors"], correct: 1 },
    { q: "In what year did Vauxhall first produce a car?",
      a: ["1893", "1899", "1903", "1910"], correct: 2 },
    { q: "How much did Vauxhall's first car cost — and what couldn't it do?",
      a: ["£500 — it had no brakes", "130 Guineas (£136.50) — it had no reverse gear", "£1,000 — it had no steering wheel", "Free — it was a prototype"], correct: 1 },
    { q: "What did the Vauxhall factory produce during World War Two?",
      a: ["Spitfire aircraft", "Ration packs", "Churchill tanks and Bedford military trucks", "Naval submarines"], correct: 2 },
    { q: "What is the WLTP range of the 2026 Corsa Electric Long Range (51kWh)?",
      a: ["222 miles", "246 miles", "252 miles", "266 miles"], correct: 3 },
    { q: "True or False: The 2026 Vauxhall Astra Electric features Vehicle-to-Load (V2L) for the first time.",
      a: ["True", "False"], correct: 0 },
    { q: "Which Vauxhall model is available with a 281PS GSE powertrain in 2026?",
      a: ["Corsa", "Astra", "Mokka", "Grandland"], correct: 2 },
    { q: "How long does it take to charge the Grandland Electric from 20–80% on a 160kW rapid charger?",
      a: ["45 minutes", "26 minutes", "35 minutes", "50 minutes"], correct: 1 },
    { q: "What is the maximum WLTP range of the Grandland Electric Long Range (97kWh)?",
      a: ["325 miles", "380 miles", "410 miles", "435 miles"], correct: 3 },
    { q: "In which year did Vauxhall join the Stellantis group?",
      a: ["2014", "2017", "2020", "2022"], correct: 1 },
    { q: "True or False: The Vivaro Electric can seat up to 9 people in Vivaro Life configuration.",
      a: ["True", "False"], correct: 0 },
    { q: "What replaced the discontinued Crossland in the Vauxhall range?",
      a: ["Mokka", "Frontera", "Combo-e Life", "Nothing — the segment was dropped"], correct: 1 }
  ],

  outro: {
    title: "Well done!",
    body: [
      "Well done for completing the module!",
      "Remember: knowing your product inside-out is what turns a good salesperson into a great one.",
      "Good luck out there — the Griffin is counting on you."
    ]
  }
};
