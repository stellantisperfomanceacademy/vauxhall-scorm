/* Vauxhall Product & Technology 2026 — course content */
window.COURSE = {
  /* Set editMode: false before publishing to LMS */
  editMode: false,

  meta: {
    title: "Vauxhall Product & Technology",
    subtitle: "v3.0",
    blurb:
      "From one of Britain's oldest motoring names to a fully electrified future – get under the skin of every Vauxhall, sharpen your brand story, and turn insight into sales.",
    chips: ["30 Minutes", "Quiz Included"],
    passMark: 0.75
  },

  objectives: [
    "Identify every model in the current Vauxhall 2026 range (cars AND vans).",
    "Recall the key milestones in Vauxhall's 168+ year history, including the fun bits.",
    "Quote what the motoring press currently say about each vehicle.",
    "Name discontinued models and explain what replaced them."
  ],

  timeline: [
    {
      year: "1213",
      title: "A name 800 years in the making",
      eyebrow: "Where did the name come from?",
      layout: "immersive",
      bg: "images/timeline1/FawkesHill.png",
      bgSoft: true,
      bullets: [
        "In the 13th century, Sir Falkes de Breauté was granted land south of the Thames.",
        "His home 'Fawkes Hall' became 'Foxhall', then 'Vauxhall' — a name that has lasted over 800 years.",
        "His personal crest, the mythical Griffin, remains the Vauxhall badge to this day."
      ],
      assets: [
        { src: "images/timeline1/Sir Faulkes de Breaute.png", cls: "tl-im-portrait", anim: "slide-up"  },
        { src: "images/timeline1/OriginalGriffin.png",        cls: "tl-im-griffin",  anim: "fade-drop" }
      ]
    },
    {
      year: "1857",
      title: "The Vauxhall Iron Works",
      eyebrow: "Where the story really begins",
      layout: "immersive",
      riverScene: true,
      bullets: [
        "Scottish engineer Alexander Wilson set up the Vauxhall Iron Works on the site of old Fawkes Hall.",
        "No cars yet — Wilson built pumps and massive marine engines for riverboats like the famous <em>Jabberwock</em>.",
        "Wilson left in 1894, and the company pivoted to the petrol engine. The rest is history."
      ],
      assets: [
        { src: "images/timeline1/newspaper_Jabberwock.png", cls: "tl-im-newspaper-float-tr", anim: "float-in" }
      ]
    },
    {
      year: "1903",
      title: "A719 · Horseless Carriage",
      eyebrow: "The very first Vauxhall",
      layout: "immersive",
      bg: "images/timeline2/LondonOLD2.png",
      text: "Vauxhall builds its very first car: a 5HP two-seater, steered by a tiller rather than a steering wheel, with no reverse gear whatsoever.",
      fact: "It cost 130 Guineas (around £136). Adjusted for inflation, that is roughly £17,000 today. Not bad for a car that could not go backwards.",
      bullets: [
        "Using their marine petrol engines, Vauxhall produced its very first 'horseless carriage' in 1903.",
        "A 5hp two-seater steered by a tiller — no steering wheel, no reverse gear, absolutely no regrets."
      ],
      assets: [
        { src: "images/timeline2/1903.png",    cls: "tl-im-car",   anim: "slide-up"  },
        { src: "images/timeline2/guiena2.png", cls: "tl-im-coin2", anim: "coin-roll" },
        { src: "images/timeline2/guiena1.png", cls: "tl-im-coin1", anim: "coin-roll" }
      ]
    },
    {
      year: "1904",
      title: "London to Glasgow",
      titleRed: true,
      mapRoute: true,
      eyebrow: "The reliability trial",
      layout: "immersive",
      bg: "images/timeline3/oldmapreliabilitytrail.png",
      text: "Director Percy Kidner drives a 6HP four-seater in the gruelling London-to-Glasgow reliability trial. The smallest car entered — losing just 7 of 1,000 points.",
      bullets: [
        "The London-to-Glasgow reliability trial was the ultimate test of early motoring endurance.",
        "Vauxhall's 6HP four-seater — the smallest car entered — lost just 7 out of 1,000 points.",
        "Top speed: 18 mph. Fuel economy: 37 mpg. A genuine triumph for the young brand."
      ],
      assets: [
        { src: "images/timeline3/1904 4 seater -2.jpg", cls: "tl-im-car", anim: "slide-up" }
      ]
    },
    { year: "1905", text: "Vauxhall uproots from London and moves to Luton, Bedfordshire — home to its factory for 120 years, until the site closed in 2025. Production has since moved to Ellesmere Port." },
    {
      year: "1910",
      title: "Prince Henry C-Type",
      eyebrow: "Born to race",
      layout: "immersive",
      bg: "images/timeline4/BritishRaceTrack2_BG.png",
      text: "The legendary 'Prince Henry' C-Type: a 3-litre, 25HP sports car that dominated hillclimbs and put Vauxhall on the international map.",
      fact: "The Prince Henry was considered one of the fastest road cars in the world at the time. Vauxhall was no longer just a local brand.",
      bullets: [
        "The 'Prince Henry' C-Type: 3-litre, 25HP — one of the fastest road cars in the world in 1910.",
        "Named after Prince Henry of Prussia's 1910 reliability trial, which it dominated.",
        "Vauxhall's racing pedigree was born. The brand would never look back."
      ],
      assets: [
        { src: "images/timeline4/princeHenry.jpg", cls: "tl-im-float-photo-bl", anim: "float-in" },
        { src: "images/timeline4/1923 OHV.jpg",    cls: "tl-im-float-photo-tr", anim: "float-in"  }
      ]
    },
    {
      year: "1925",
      title: "General Motors Era",
      eyebrow: "American investment arrives",
      layout: "immersive",
      bgContrast: true,
      bg: "images/timeline5/GMDEAL_newspaperVauxhall.png",
      bullets: [
        "General Motors acquires Vauxhall in 1925 for $2.5 million. American investment changes everything.",
        "Mass production begins: the affordable 14/40 model puts Vauxhall in every British household.",
        "The GM deal was controversial — but it gave Vauxhall the capital to build cars ordinary families could actually afford."
      ],
      assets: [
        { src: "images/timeline5/gmLOGO.png",           cls: "tl-im-logo",       anim: "fade-drop" },
        { src: "images/timeline5/VauxhallLogoOld.png", cls: "tl-im-logo-vx-lg", anim: "fade-drop" }
      ]
    },
    {
      year: "1931",
      title: "Mass Market & Bedford",
      eyebrow: "Cars for everyone",
      layout: "immersive",
      bgPan: true,
      bg: "images/timeline5/1931Mass Market & Bedfords_pano.png",
      bullets: [
        "Vauxhall pivoted to affordable cars for everyday families — first British car with a synchromesh gearbox (no more grinding gears!).",
        "April 1931 saw the birth of the commercial Bedford brand, launching with a two-ton truck.",
        "An instant success — Bedford went on to spawn decades of iconic buses and vans."
      ]
    },
    {
      year: "1939",
      title: "War Effort",
      eyebrow: "Luton at war · 1939–1945",
      layout: "immersive",
      bg: "images/timeline7/War Production_BG.png",
      text: "Vauxhall's Luton factory switches entirely to wartime production. Over 250,000 Bedford military trucks and 5,600 Churchill tanks — one built every working hour.",
      fact: "The Churchill tank was designed and put into production in under 12 months. The workforce tripled overnight.",
      bullets: [
        "The Luton factory converts entirely to war production from 1939.",
        "Over 250,000 Bedford military trucks supplied to the Allied forces.",
        "5,600 Churchill tanks — designed and built in under 12 months. One every working hour."
      ],
      assets: [
        { src: "images/timeline7/ChurchillTankTransparent.png", cls: "tl-im-tank-scroll", anim: "scroll" },
        { src: "images/timeline7/warproductionline.jpg", cls: "tl-im-float-photo-tl", anim: "float-in" }
      ]
    },
    {
      year: "1950s",
      title: "Massive Growth",
      eyebrow: "Building at scale",
      layout: "immersive",
      bg: "images/timeline8/factorylineBG.png",
      text: "The 1950s brought massive growth. By 1953, output topped 100,000 vehicles a year, and the one-millionth Vauxhall rolled off the line.",
      bullets: [
        "The 1950s brought massive growth. By 1953, output topped 100,000 vehicles a year, and the one-millionth Vauxhall rolled off the line.",
        "Soon after, the Dunstable plant employed 22,000 people and launched the iconic Victor saloon."
      ],
      assets: [
        { src: "images/timeline8/50s car.jpg", cls: "tl-im-viva-bl", anim: "float-in" },
        { src: "images/timeline7/EllesmerePortfirstVauxhallViva1stJune1964.jpg", cls: "tl-im-float-photo-tr", anim: "float-in" }
      ]
    },
    {
      year: "1960–70s",
      title: "From Viva to Astra",
      eyebrow: "Britain's living rooms",
      layout: "room-explore",
      bg: "images/timeline9/70sCarsLivingRoom2.png",
      driveway: "images/timeline9/70sCarsDriveway2.png",
      windowHotspot: { x: 16, y: 7, w: 66, h: 60 },
      drivewayCars: [
        { label: "Viva",     x: 16, y: 74 },
        { label: "Cavalier", x: 48, y: 74 },
        { label: "Astra",    x: 78, y: 74 }
      ],
      text: "As car ownership became a reality for most families, Vauxhall sales exploded. Click the window to step outside and see the cars that defined the era.",
      bullets: [
        "As car ownership became a reality for most families, Vauxhall sales exploded.",
        "The compact Viva was a massive hit in the 60s.",
        "The 1970s brought the beloved Cavalier (1975) and the debut of the Astra (1979) — names that would dominate British roads for decades.",
        "Click the window to step outside and see Viva, Cavalier, and Astra on every driveway →"
      ],
      drivewayBullets: [
        "Viva, Cavalier, Astra — three generations of Vauxhall on one street.",
        "From the 60s compact that got Britain moving to the 1979 Astra that became an icon.",
        "By the 1980s, Vauxhall was Britain's second best-selling brand."
      ]
    },
    {
      year: "1983",
      title: "Nova & Ellesmere Port",
      eyebrow: "The city car era",
      layout: "immersive",
      bg: "images/nova/novaad1_BG.jpg",
      bgContrast: true,
      bgPan: true,
      britain1980sScene: true,
      bullets: [
        "The Nova launches in 1983 — small, affordable, and perfectly timed for city living.",
        "Built at Ellesmere Port, it would later be renamed the Corsa in 1993.",
        "It went on to become the UK's best-selling car nameplate of all time — over 1.5 million sold."
      ],
      assets: [
        { src: "images/nova/novafron1.jpg", cls: "tl-im-nova-front", anim: "float-in" },
        { src: "images/nova/novaad2.jpg",   cls: "tl-im-float-photo-tr", anim: "float-in" }
      ]
    },
    {
      year: "2000s",
      title: "Britain's Family Favourite",
      layout: "immersive",
      britain2000sScene: true,
      carLineup: true,
      bullets: [
        "The Vectra dominated company car fleets and family driveways through the 2000s.",
        "The Zafira brought seven-seat practicality to Britain — the compact MPV everyone wanted.",
        "The Insignia arrived in 2008 and won European Car of the Year in 2009."
      ],
      fact: "Vauxhall was Britain's second best-selling brand for much of this era — only Ford sold more.",
      assets: [
        { src: "images/Vectra.webp",                      label: "Vectra",   cls: "tl-im-car-vectra" },
        { src: "images/vauxhall-zafira-3.jpg",            label: "Zafira",   cls: "tl-im-car-zafira" },
        { src: "images/vauxhall-insignia-rear-quarter.jpg", label: "Insignia", cls: "tl-im-car-insignia" }
      ]
    },
    {
      year: "2017",
      title: "A New Chapter",
      eyebrow: "Stellantis era",
      layout: "immersive",
      stellantisScene: true,
      stellantisLogo: "images/logos/stell-logo-white.png",
      floatingLogos: [
        "images/logos/Vauxhall-Logo-1857-768x483.png",
        "images/logos/1983.png",
        "images/logos/Vauxhall-Logo-1989-768x469.png",
        "images/logos/Vauxhall-Logo-2003-768x473.png",
        "images/logos/Vauxhall-Logo-2008-768x432.png",
        "images/logos/Vauxhall-Logo-2009-768x539.png",
        "images/logos/Vauxhall-Logo-2011-768x483.png",
        "images/logos/VX_LOGO_V_CMYK.png"
      ],
      text: "Vauxhall joins the Stellantis group (formerly PSA). A new chapter of shared platforms, electrification, and global scale begins.",
      fact: "Through every badge change, the Griffin endures — a symbol of British motoring that has lasted over 800 years.",
      bullets: [
        "Vauxhall joins Stellantis in 2017 — unlocking shared EV platforms and global investment.",
        "The move accelerates electrification: every model now has an EV or hybrid option."
      ]
    },
    {
      year: "2020",
      title: "The Electric Journey Begins",
      layout: "immersive",
      electric2020Scene: true,
      carLineup: "dual",
      bullets: [
        "In 2020, Vauxhall launches its first fully electric cars: the Corsa-e and Mokka-e.",
        "Both plug in at home or rapid charge on the road — zero emissions, everyday practicality.",
        "It marks the start of a new chapter — today every Vauxhall model has an electric option."
      ],
      fact: "The Corsa-e became one of the UK's best-selling electric cars in its first year on sale.",
      assets: [
        { src: "images/corsa_charging.jpeg", label: "Corsa-e", cls: "tl-im-car-corsa-e" },
        { src: "images/mokkaCharging.jpg",   label: "Mokka-e", cls: "tl-im-car-mokka-e" }
      ]
    },
    {
      year: "2023",
      title: "Astra Electric",
      layout: "immersive",
      bg: "images/astraelectricBG.jpg",
      bgContrast: true,
      bullets: [
        "The Astra Electric arrives in 2023 — the iconic family hatchback, now with zero emissions.",
        "A British favourite since 1979, electrified for the next generation of drivers."
      ]
    },
    {
      year: "2024",
      title: "Grandland & Frontera",
      layout: "immersive",
      bg: "images/Grandland Electric.jpg",
      bgContrast: true,
      panelTop: true,
      bullets: [
        "The all-new Grandland Electric launches with up to 323 miles of range.",
        "The Frontera arrives as a spiritual revival of a classic name."
      ]
    },
    {
      year: "2026",
      title: "The Future is Electric",
      eyebrow: "Vauxhall today",
      layout: "immersive",
      bg: "images/timeline10/ellsmerePortBG.png",
      bullets: [
        "Vauxhall's most electrified range ever — every car and van available as EV or hybrid. Zero compromises.",
        "Ellesmere Port becomes the UK's first dedicated all-electric car factory.",
        "From the Iron Works of 1857 to the electric grid — the Griffin flies into the future."
      ]
    }
  ],

  /* ---- SECTION 2: CARS ---- */
  cars: [
    {
      name: "Corsa", image: "corsa", imageSrc: "images/corsa_stretched.png",
      heroPos: { x: 50, y: 50, fit: "cover" },
      tagline: "Britain's Favourite Small Car",
      pitch: "The Corsa has been the UK's best-selling car multiple times. In 2026 it is better than ever, with petrol, mild hybrid, and full electric options.",
      stats: [ {v:"266", l:"EV MILES (WLTP)"}, {v:"309", l:"BOOT LITRES"}, {v:"5★", l:"EURO NCAP"} ],
      keyFacts: [
        "Available as: Petrol (75/100/130PS), 48V Mild Hybrid (108 or 143PS), and Full Electric (136 or 156PS)",
        "Corsa Electric Long Range: up to 266 miles WLTP from a 51kWh battery",
        "Corsa Electric now features Vehicle-to-Load (V2L): power your devices directly from the car",
        "Boot space: 309 litres (petrol/hybrid) or 267 litres (electric)",
        "5-star Euro NCAP safety rating",
        "Prices from: £20,590 (petrol) | £22,940 (mild hybrid) | £27,505 (electric)"
      ],
      headToHead: [
        { label: "EV Range", vauxhall: "Corsa-e: 266 miles WLTP", rival: "Ford Puma Gen-E: 259 miles" },
        { label: "Standard Kit", vauxhall: "LED lights, lane keep, rear sensors included", rival: "Rivals charge extra for the same level" }
      ],
      hotspots: [
        { x: 16, y: 48, label: "Powertrain & Range", facts: [
          "Available as Petrol (75–130PS), 48V Mild Hybrid, and Full Electric",
          "Corsa Electric Long Range: up to 266 miles WLTP from 51kWh battery"
        ]},
        { x: 52, y: 78, label: "Tech & Space", facts: [
          "V2L: power your devices directly from the car (new for 2026)",
          "Boot: 309 litres (petrol/hybrid) | 267 litres (electric)"
        ]},
        { x: 84, y: 36, label: "Safety & Price", facts: [
          "5-star Euro NCAP safety rating",
          "Prices from £20,590 (petrol) | £22,940 (hybrid) | £27,505 (electric)"
        ]}
      ],
      funFact: "The Corsa nameplate launched in 1993, replacing the Nova. More than 1.5 million Corsas have been sold in the UK alone, making it one of the best-selling cars in British motoring history.",
      press: [
        { quote: "All previous Corsas have reeked of mediocrity, but this one drives with poise and precision: it's more refined, efficient, comfortable and it looks smart too.", src: "Top Gear, 2026" },
        { quote: "It's significantly less peacocky than its Honda or Mini rivals, and it'll go further and has tons more room for people.", src: "Top Gear, Corsa Electric" }
      ]
    },
    {
      name: "Frontera", image: "frontera",
      heroPos: { x: 50, y: 58 },
      tagline: "The Affordable SUV Everybody's Talking About",
      pitch: "New for 2024, the Frontera is Vauxhall's entry-level SUV. Already making waves with its unbeatable price point and proper EV credentials.",
      stats: [ {v:"253", l:"EV MILES (EXT)"}, {v:"7", l:"SEATS (HYBRID)"}, {v:"£24,795", l:"FROM"} ],
      keyFacts: [
        "Available as: 48V Mild Hybrid (110 or 145PS) or Full Electric (113PS)",
        "Frontera Electric Standard Range: up to 189 miles from 44kWh battery",
        "Frontera Electric Extended Range: up to 253 miles from 54kWh battery",
        "Prices from: £24,795 (Electric) | £25,220 (Hybrid)",
        "Generous standard kit: LED lights, rear parking sensors, 10-inch touchscreen",
        "Available in 5-seat and (Hybrid only) 7-seat configurations"
      ],
      headToHead: [
        { label: "Entry Price", vauxhall: "Frontera Electric: £24,795", rival: "Renault 4 E-Tech: £23,445" },
        { label: "0 to 62mph", vauxhall: "145PS Hybrid: 9.0 seconds", rival: "Quicker than most rivals expect from a budget SUV" }
      ],
      hotspots: [
        { x: 15, y: 50, label: "EV Range Options", facts: [
          "Standard Range Electric: up to 189 miles from 44kWh battery",
          "Extended Range Electric: up to 253 miles from 54kWh battery"
        ]},
        { x: 52, y: 74, label: "Seating & Space", facts: [
          "Hybrid version available with optional 7-seat third row",
          "5-seat (Electric & Hybrid) or 7-seat (Hybrid only)"
        ]},
        { x: 83, y: 40, label: "Powertrain & Price", facts: [
          "Available as 48V Mild Hybrid (110 or 145PS) or Full Electric (113PS)",
          "Prices from £24,795 (Electric) | £25,220 (Hybrid)",
          "Standard kit: LED lights, rear sensors, 10-inch touchscreen"
        ]}
      ],
      funFact: "The original Frontera was built from 1991 to 2004 as a proper 4x4 off-roader. The new 2024 Frontera shares only its name, bringing modern EV tech and a much lower price to a whole new generation.",
      press: [
        { quote: "Twenty-twenties Frontera is categorically not 1990s Frontera. In fact, it's a pretty solid effort from Vauxhall.", src: "Top Gear, 2026" },
        { quote: "As a sensible and very affordable small SUV it ticks all the right boxes: there's loads of space, plenty of standard kit, a comfortable driving experience and low running costs.", src: "RAC Drive, 2026" }
      ]
    },
    {
      name: "Mokka", image: "mokka",
      imageSrc: "images/mokka-large.png",
      vsImageSrc: "images/mokkatransparent.png",
      heroPos: { x: 50, y: 50, fit: "cover" },
      tagline: "The Bold One",
      pitch: "The Mokka turns heads wherever it goes. That distinctive Vizor front end is unmistakable. The 2026 range now includes the 281PS Mokka GSE for serious performance fans.",
      stats: [ {v:"281", l:"PS (GSE)"}, {v:"5.9", l:"0–62 SEC (GSE)"}, {v:"250", l:"EV MILES"} ],
      keyFacts: [
        "Available as: Petrol manual, 48V Mild Hybrid (145PS), or Full Electric (156PS, or 281PS GSE)",
        "Mokka Electric: up to 250 miles WLTP from a 54kWh battery",
        "Mokka GSE: 281PS, 0 to 62mph in 5.9 seconds. The most powerful Mokka ever built",
        "100kW rapid charging: 0 to 80% in 30 minutes",
        "The Vizor front design integrates grille, headlights, and badge into one dramatic module",
        "Prices from: £26,545 (petrol manual) | approx. £31,680 (Electric)"
      ],
      headToHead: [
        { label: "Digital Cockpit", vauxhall: "Standard across the entire range", rival: "Ford, Renault, VW: optional paid extra" },
        { label: "Design Language", vauxhall: "Vizor: award-winning integrated front", rival: "Conventional grille on all rivals" }
      ],
      hotspots: [
        { x: 20, y: 44, label: "The Vizor Front", facts: [
          "Integrated LED matrix headlights, DRLs and badge in one module",
          "Award-winning design, now used across the whole Vauxhall range"
        ]},
        { x: 55, y: 68, label: "Performance", facts: [
          "Mokka GSE: 281PS, 0 to 62mph in 5.9 seconds. Most powerful Mokka ever",
          "100kW rapid charging: 0 to 80% in 30 minutes"
        ]},
        { x: 82, y: 40, label: "Powertrain & Price", facts: [
          "Available as Petrol manual, Hybrid (145PS) or Electric (156PS or 281PS GSE)",
          "Mokka Electric: up to 250 miles WLTP from 54kWh battery",
          "Prices from £26,545 (petrol manual) | £31,680 (Electric)"
        ]}
      ],
      funFact: "Mokka is the German word for mocha coffee, fitting for a car that gives you a bit of a kick. The Vizor front design, introduced on the 2021 Mokka, won multiple design awards and is now used across the whole Vauxhall range.",
      press: [
        { quote: "The small SUV class is a busy sector, but the Vauxhall Mokka has the sharp looks to help it stand out from the crowd. Revisions for 2025 have helped to make the Mokka even easier to live with.", src: "Auto Express, 2025" },
        { quote: "The regular Mokka Electric gets a 156bhp electric motor mated to a 54kWh battery for up to 250 miles of range. Then there's the range-topping Mokka GSE, the first of a whole new breed of electric performance Vauxhalls.", src: "Top Gear, 2026" }
      ]
    },
    {
      name: "Astra", image: "astra",
      imageSrc: "images/Astra-Wide.png",
      vsImageSrc: "images/astra.png",
      heroPos: { x: 50, y: 50, fit: "cover" },
      tagline: "The Iconic Family Hatch, Electrified",
      pitch: "The Astra has been a British staple since 1979. In 2026 it is available as Petrol, 48V Hybrid, PHEV, or full EV: the most powertrain options it has ever offered.",
      stats: [ {v:"281", l:"EV MILES (WLTP)"}, {v:"123", l:"MPG (PHEV)"}, {v:"52", l:"PHEV EV MILES"} ],
      keyFacts: [
        "Available as: 48V Hybrid (145PS), PHEV (196PS, up to 52 miles electric-only range), or Full Electric (156PS)",
        "Astra Electric 2026: up to 281 miles WLTP from new 55.4kWh NMC battery",
        "New for 2026: Vehicle-to-Load (V2L) on Electric, three-level regen braking via paddles",
        "Astra PHEV: official 123mpg combined, 52-mile EV range, 7-speed gearbox for 2026",
        "Dual 10-inch digital screens standard across the range",
        "Prices from: £29,995"
      ],
      headToHead: [
        { label: "Battery Efficiency", vauxhall: "281 miles from 55.4kWh", rival: "VW ID.3 Pro: 269 miles from 59kWh" },
        { label: "PHEV Range", vauxhall: "52 miles EV-only (covers most daily commutes)", rival: "Most rivals remain under 40 miles EV-only" }
      ],
      hotspots: [
        { x: 22, y: 42, label: "Electric Range", facts: [
          "Astra Electric 2026: up to 281 miles WLTP from new 55.4kWh NMC battery",
          "New: Vehicle-to-Load (V2L) and three-level regen braking paddles"
        ]},
        { x: 50, y: 76, label: "PHEV & Hybrid", facts: [
          "PHEV: 196PS, up to 52 miles electric-only range, 123mpg official",
          "48V Hybrid: 145PS for everyday efficiency"
        ]},
        { x: 79, y: 36, label: "Tech & Price", facts: [
          "Dual 10-inch digital screens standard across the range",
          "Prices from £29,995"
        ]}
      ],
      funFact: "The Astra name has spanned eight generations since 1979. The current Astra Electric shares its platform with the Peugeot e-308 and Citroen e-C4, but Vauxhall's version consistently earns the best reviews of the trio.",
      press: [
        { quote: "We like the eighth generation Astra, and the electric one is the best of the lot. It looks great, drives well. A solid all-round proposition.", src: "Top Gear" },
        { quote: "The Astra is not the longest range, the fastest charging or the most fun family EV. But it really is a smart, comfortable and weirdly charming car to live with, and it's got tonnes of equipment at an extraordinary price.", src: "Electrifying.com, 2026" }
      ]
    },
    {
      name: "Grandland", image: "grandland",
      heroPos: { x: 50, y: 68 },
      tagline: "The Big SUV with Big Ambitions",
      pitch: "The all-new Grandland launched in 2024 and it means business. Up to 323 miles on the standard electric battery, with rapid charging and AWD performance options. The most capable Vauxhall ever made.",
      stats: [ {v:"323", l:"EV MILES (WLTP)"}, {v:"26", l:"MIN 20–80%"}, {v:"550", l:"BOOT LITRES"} ],
      keyFacts: [
        "Available as: 48V Mild Hybrid (134PS) or Full Electric (210PS FWD or 320PS AWD)",
        "Grandland Electric (73kWh): up to 323 miles WLTP | 160kW rapid charging (20 to 80% in 26 minutes)",
        "Grandland Electric AWD: 320PS, 0 to 62mph in 6.1 seconds, up to 311 miles range",
        "3D Vizor front | IntelliLux Pixel Matrix HD headlights on Ultimate trim",
        "GS and Ultimate: 16-inch infotainment + wireless phone charging",
        "Boot: 550 litres (electric). One of the best in class",
        "Prices from: £31,995 (Hybrid) | £36,545 (Electric)"
      ],
      headToHead: [
        { label: "Rapid Charging", vauxhall: "160kW (20 to 80% in 26 min)", rival: "VW ID.4: 135kW" },
        { label: "AWD Performance", vauxhall: "320PS AWD at competitive pricing", rival: "Undercuts Peugeot e-3008 and BMW iX1 on value" }
      ],
      hotspots: [
        { x: 18, y: 44, label: "Range & Charging", facts: [
          "Standard Electric (73kWh): up to 323 miles WLTP",
          "160kW rapid charging: 20 to 80% in just 26 minutes"
        ]},
        { x: 52, y: 72, label: "Performance & Tech", facts: [
          "AWD version: 320PS, 0 to 62mph in 6.1 seconds",
          "IntelliLux Pixel Matrix HD headlights on Ultimate trim",
          "16-inch infotainment + wireless charging on GS and Ultimate"
        ]},
        { x: 82, y: 36, label: "Practicality & Price", facts: [
          "Boot: 550 litres (electric). One of the best in class",
          "Prices from £31,995 (Hybrid) | £36,545 (Electric)"
        ]}
      ],
      funFact: "The Grandland Electric's 73kWh battery delivers up to 323 miles WLTP — enough for London to Edinburgh on a single charge with range to spare.",
      press: [
        { quote: "The Grandland Electric is our preferred choice from behind the wheel — more comfortable, and with up to 323 miles of real-world range, a genuinely capable option in the class.", src: "Auto Express, 2026" },
        { quote: "A vast improvement on the old Grandland it replaces and a rather pleasant family SUV, all told.", src: "The Sunday Times Driving, 2024" }
      ]
    }
  ],

  /* ---- SECTION 3: VANS ---- */
  vans: [
    {
      name: "Combo-e Life", image: "combo",
      imageSrc: "images/combo_long.png",
      heroPos: { x: 50, y: 58 },
      tagline: "The Electric People Carrier",
      stats: [ {v:"174", l:"EV MILES"}, {v:"7", l:"SEATS"}, {v:"30", l:"MIN 0–80%"} ],
      keyFacts: [
        "Full EV: 136PS motor, 50kWh battery, up to 174 miles WLTP",
        "Seats up to 7 people in Medium or XL body styles",
        "0 to 80% charge in 30 minutes on 100kW rapid charger",
        "8-year battery warranty | Exempt from congestion charges | Zero VED",
        "6 months free BP Pulse subscription included"
      ],
      funFact: "The Combo-e Life shares its platform with the Citroen e-Berlingo and Peugeot e-Rifter. Vauxhall's version consistently receives the best press reception in the UK market.",
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
        "100kW rapid charging: 5 to 80% in 45 minutes",
        "Payload: up to 1,226kg",
        "Available as: Panel Van, Combi, Platform Cab, and Vivaro Life (up to 9 seats)",
        "What Car? Medium Van of the Year winner",
        "Prices from: £42,055 exc. VAT (Electric)"
      ],
      funFact: "The Vivaro name dates back to 2001. The electric version was a genuine trailblazer, one of the first electric medium vans in the UK. Today it competes with the Ford E-Transit Custom and Mercedes eSprinter, consistently winning on value.",
      press: [
        { quote: "A stylish but practical package. Safety and equipment standards are high, so is build quality. We've no quarrels with the ride or handling.", src: "What Van?, 2024" }
      ]
    },
    {
      name: "Movano Electric", image: "movano",
      tagline: "The Electric Heavy-Hauler",
      stats: [ {v:"263", l:"EV MILES"}, {v:"1,480", l:"KG PAYLOAD"}, {v:"17", l:"M³ CARGO"} ],
      keyFacts: [
        "270PS electric motor | 75kWh battery | Up to 263 miles WLTP",
        "50kW DC rapid charging: 0 to 80% in 1 hour | 22kW AC: 0 to 80% in 4 hours",
        "Available: Panel Van L3/L4, Chassis Cab in 3.5T and 4.25T GVW",
        "4.25T payload: up to 1,480kg, still driveable on a standard car licence",
        "PIVG eligible (£5,000 government grant) | From approx. £46,795 exc. VAT after grant",
        "Cargo volume: up to 17m³"
      ],
      funFact: "The 4.25T version of the Movano Electric is legally driveable on a standard Category B car licence. No HGV licence needed. That means less paperwork, more drivers, and lower operating costs for businesses.",
      press: [
        { quote: "It's well worth upgrading to the 4.25T chassis for less than £1,000 extra, as it doubles the payload and can still be driven on a standard car licence, making it cheaper than a Ford E-Transit and much cheaper than a Mercedes E-Sprinter.", src: "Carwow" }
      ]
    }
  ],

  /* ---- SECTION 4: RETIRED ---- */
  retired: [
    {
      name: "Crossland", image: "crossland",
      imageSrc: "images/crosssland2.png",
      retired: "Retired Spring 2024",
      notice: "The Crossland was discontinued in Spring 2024 and is no longer on sale new. It has been replaced in the Vauxhall line-up by the new Frontera. You may still encounter customers with existing Crosslands on the road.",
      specs: [
        "Engine: 1.2T petrol, 108PS (manual) or 128PS (auto)",
        "No EV or hybrid option was ever offered",
        "Boot: 410 litres",
        "Economy: up to 48.7 mpg",
        "Price when new: from £22,550"
      ],
      why: "The Crossland's role is now fulfilled by the new Frontera, which does everything it did but adds full EV capability and 7-seat options. A clear upgrade for customers and the environment.",
      funFact: 'The Crossland was originally called the "Crossland X" when it launched in 2017. The X was quietly dropped in 2020. Nobody seems to have noticed.'
    },
    {
      name: "Insignia", image: "insignia",
      imageSrc: "images/insignia2.png",
      retired: "Retired 2022",
      notice: "The Insignia was discontinued in 2022 and is no longer sold new. Vauxhall has not directly replaced it in the same D-segment saloon/estate class. Customers looking for a larger family car are typically directed to the Grandland.",
      specs: [
        "Engines: 1.5 Turbo D (120 to 162PS) | 2.0 Turbo D (167 to 207PS)",
        "Trims: Design and GS Line",
        "Boot: 490 litres (hatch) | 530 litres (Sports Tourer estate)",
        "No hybrid or EV version was ever offered"
      ],
      why: "The D-segment saloon/estate market shrank dramatically as buyers moved to SUVs. Rather than replace the Insignia, Vauxhall chose to invest in electrifying its SUV range. A reflection of changing customer preferences, not a quality issue.",
      funFact: "The Insignia won the 2009 European Car of the Year award, beating the Ford Fiesta and Volkswagen Golf. Not bad for a car that many people overlook."
    }
  ],

  /* ---- SECTION 5: COMPARISON ---- */
  comparison: {
    headers: ["Model", "Powertrain Options", "Top EV Range", "From Price", "Top Press Quote"],
    rows: [
      ["Corsa", "Petrol / Hybrid / Electric", "266 miles", "£20,590", '"Poise and precision" (Top Gear)'],
      ["Frontera", "Hybrid / Electric", "253 miles", "£24,795", '"Ticks all the right boxes" (RAC)'],
      ["Mokka", "Petrol / Hybrid / Electric / GSE", "250 miles", "£26,545", '"Sharp looks to stand out" (Auto Express)'],
      ["Astra", "Hybrid / PHEV / Electric", "281 miles", "£29,995", '"The best of the lot" (Top Gear)'],
      ["Grandland", "Hybrid / Electric / AWD", "323 miles", "£31,995", '"A vast improvement" (Sunday Times)'],
      ["Combo-e Life", "Electric", "174 miles", "POA", '"Full of surprises" (Carwow)'],
      ["Vivaro Electric", "Electric", "217 miles", "£42,055 ex.VAT", '"High safety standards" (What Van?)'],
      ["Movano Electric", "Electric", "263 miles", "£46,795 ex.VAT", '"Cheaper than Ford E-Transit" (Carwow)']
    ],
    note: "OTR prices effective from 1 July 2026."
  },

  /* ---- SECTION 6: QUIZ (correct = index) ---- */
  quiz: [
    { q: "Who acquired Vauxhall in 1925?",
      a: ["Ford", "Stellantis", "Bedford", "General Motors"], correct: 3 },
    { q: "What did Vauxhall produce at Luton during WWII?",
      a: ["Spitfire aircraft only", "Churchill tanks and Bedford military trucks", "Naval destroyers", "Railway engines"], correct: 1 },
    { q: "In 2020, which two fully electric Vauxhalls launched?",
      a: ["Astra Electric and Grandland Electric", "Corsa-e and Mokka-e", "Frontera Electric and Vivaro Electric", "Combo-e Life and Movano Electric"], correct: 1 },
    { q: "True or False: Astra Electric 2026 adds Vehicle-to-Load (V2L).",
      a: ["True", "False"], correct: 0 },
    { q: "How long does Grandland Electric take to charge from 20–80% on 160kW rapid charging?",
      a: ["45 minutes", "35 minutes", "30 minutes", "26 minutes"], correct: 3 },
    { q: "What replaced the discontinued Crossland in the Vauxhall range?",
      a: ["Mokka", "Frontera", "Combo-e Life", "Nothing — the segment was dropped"], correct: 1 },
    { q: "In which year did Vauxhall join the Stellantis group?",
      a: ["2014", "2017", "2020", "2022"], correct: 1 }
  ],

  outro: {
    title: "Well done!",
    body: [
      "You have completed the module.",
      "Remember: knowing your product inside-out is what turns a good salesperson into a great one.",
      "Good luck out there. The Griffin is counting on you."
    ]
  }
};
