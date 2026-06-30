(function () {
  "use strict";
  var C = window.COURSE;
  var stage = document.getElementById("stage");
  var elPrev = document.getElementById("btn-prev");
  var elNext = document.getElementById("btn-next");
  var elFinish = document.getElementById("btn-finish");
  var elReadout = document.getElementById("progress-readout");

  var esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  /** CSS background-image value — single-quoted so spaces work and HTML attribute
   *  double-quotes are not broken. */
  function cssBgUrl(src) {
    if (!src) return "none";
    return "url('" + String(src).replace(/'/g, "%27") + "')";
  }

  /** Bold label-style lead-ins (before ":") and leading specs to break up dense fact text. */
  function boldKeyInfo(raw) {
    if (raw == null || raw === "") return "";
    var s = esc(raw);
    if (s.indexOf(" | ") >= 0) {
      return s.split(" | ").map(function (part) {
        return boldKeyInfo(part.trim());
      }).join(" | ");
    }
    var colonIdx = s.indexOf(":");
    if (colonIdx > 0 && colonIdx < s.length - 1) {
      return "<strong>" + s.slice(0, colonIdx + 1) + "</strong>" + s.slice(colonIdx + 1);
    }
    var m = s.match(/^(\d[\d.,]*(?:\s*to\s*\d[\d.]*)?(?:\s*(?:PS|kWh|mph|miles|mpg|kg|m³|litres|%|★|star(?:s)?)?(?:\s+WLTP)?)?|\d+-star|Up to \d[\d.,]+[^|]*?)(?=\s|$|,)/i);
    if (m && m[1].length >= 2 && m[1].length < s.length) {
      return "<strong>" + m[1] + "</strong>" + s.slice(m[1].length);
    }
    return s;
  }

  function pressLogo(src) {
    var s = String(src || "").toLowerCase();
    if (s.indexOf("top gear") >= 0) return "images/press/TopGearLogo.svg.png";
    if (s.indexOf("rac") >= 0) return "images/press/RAC_Limited_(logo).svg.png";
    if (s.indexOf("auto express") >= 0) return "images/press/AutoExpressLogo.avif";
    if (s.indexOf("sunday times") >= 0) return "images/press/Sunday-times-logo-2.png";
    if (s.indexOf("independent") >= 0) return "images/press/Independent-logo.webp";
    if (s.indexOf("carwow") >= 0) return "images/press/carwow-seeklogo.png";
    if (s.indexOf("what van") >= 0) return "images/press/WV_Logo.png";
    if (s.indexOf("electrifying") >= 0) return "images/press/ElectrifyingBlack_new.webp";
    return "";
  }

  function pressName(src) {
    var s = String(src || "").trim();
    var i = s.indexOf(",");
    return i >= 0 ? s.slice(0, i).trim() : s;
  }

  function pressFlagHTML(p) {
    var logo = p.logo || pressLogo(p.src);
    var name = pressName(p.src);
    if (logo) {
      return '<div class="paper-flag paper-flag-logo">' +
        '<img src="' + esc(logo) + '" alt="' + esc(name) + '" class="press-logo">' +
        '<span class="press-name">' + esc(name) + "</span></div>";
    }
    return '<div class="paper-flag">' + esc(p.src) + "</div>";
  }

  function pressAttributionHTML(p) {
    var logo = p.logo || pressLogo(p.src);
    var name = pressName(p.src);
    if (logo) {
      return '<div class="s press-logo-wrap">' +
        '<img src="' + esc(logo) + '" alt="' + esc(name) + '" class="press-logo press-logo-sm">' +
        '<span class="press-name">' + esc(name) + "</span></div>";
    }
    return '<div class="s">' + esc(p.src) + "</div>";
  }

  /* ---- build flat slide list ---- */
  var slides = [];
  function add(s) { slides.push(s); }

  add({ type: "cover", section: "Welcome", ink: true });
  add({ type: "objectives", section: "Welcome", dark: true });
  add({ type: "divider", section: "History", num: "01", title: "Vauxhall History", quote: "From humble smithy to a symbol on Britain's streets." });
  add({ type: "timeline", section: "History", ink: true });
  add({ type: "divider", section: "Cars", num: "02", title: "The 2026 Range: Cars", quote: "Explore the line\u2011up. The key facts on every model." });
  C.cars.forEach(function (v) { add({ type: "vehicle", section: "Cars", data: v }); });
  add({ type: "divider", section: "Vans", num: "03", title: "The 2026 Range: Vans", quote: "Our van range is a cornerstone of British business,\nand it's going electric too." });
  C.vans.forEach(function (v) { add({ type: "vehicle", section: "Vans", data: v, van: true }); });
  add({ type: "divider", section: "Retired", num: "04", title: "Retired Models", quote: "Understanding what came before helps you explain the full Vauxhall story." });
  C.retired.forEach(function (v) { add({ type: "retired", section: "Retired", data: v }); });
  add({ type: "comparison", section: "Cheat Sheet" });
  add({ type: "quiz-intro", section: "Quiz" });
  C.quiz.forEach(function (q, i) { add({ type: "quiz", section: "Quiz", data: q, qi: i }); });
  add({ type: "results", section: "Quiz" });
  add({ type: "outro", section: "Finish" });

  var resultsIndex = slides.map(function (s) { return s.type; }).indexOf("results");
  var answers = new Array(C.quiz.length).fill(null);
  var current = 0;
  var maxReached = 0;

  /* ---- completion tracking ---- */
  var visitedTlTiles = {};        // { slideIndex: Set<tileIndex> }
  var visitedHotspots = {};       // { slideIndex: Set<dotIndex> }
  var visitedVehicleExtras = {};  // { slideIndex: { fun, press, vs } }
  var visitedVehicles = {};       // { slideIndex: true }
  var tlTileCount = C.timeline ? C.timeline.length : 0;

  var vehicleSlideIndices = [];   // filled after slides built

  /* ---- renderers ---- */
  var img = "assets/img/";

  function chrome(s, idx) {
    return (
      '<img class="chrome-logo" src="' + img + (s.dark || s.ink ? 'logo-h-white.png' : 'logo-h-blue.png') + '" alt="Vauxhall">' +
      '<div class="chrome-nav"><span class="sec">' + esc(s.section) + '</span>' +
      '<span class="bar"><span style="width:' + Math.round(((idx + 1) / slides.length) * 100) + '%"></span></span>' +
      '<span class="count">' + (idx + 1) + " / " + slides.length + "</span></div>"
    );
  }

  function heroHTML(name, id, hotspots, srcOverride, heroPos) {
    var src = srcOverride || ("images/" + id + ".jpg");
    var imgStyle = "";
    if (heroPos) {
      var px = heroPos.x != null ? heroPos.x : 50;
      var py = heroPos.y != null ? heroPos.y : 50;
      var fit = heroPos.fit || "cover";
      imgStyle = ' style="object-fit:' + fit + ";object-position:" + px + "% " + py + '%"';
      if (heroPos.zoom && heroPos.zoom !== 1) {
        imgStyle = imgStyle.slice(0, -1) + ";width:" + Math.round(heroPos.zoom * 100) + "%;height:" + Math.round(heroPos.zoom * 100) + '%"';
      }
    }
    var heroClass = heroPos && heroPos.fit === "contain" ? " hero-contain" : "";
    if (heroPos && heroPos.zoom && heroPos.zoom !== 1) heroClass += " hero-zoom";
    var spots = "";
    if (hotspots && hotspots.length) {
      spots = '<div class="hs-layer">' +
        hotspots.map(function (h, i) {
          var flip = h.y < 46 ? " hs-flip" : "";
          var tipBody = (h.facts && h.facts.length ? h.facts : [h.detail || ""])
            .map(function (f) { return "<p>" + boldKeyInfo(f) + "</p>"; }).join("");
          return '<button class="hs-dot' + flip + '" style="left:' + h.x + '%;top:' + h.y + '%" data-hs="' + i + '">' +
            '<span class="hs-num">' + (i + 1) + "</span>" +
            '<span class="hs-ring"></span>' +
            '<div class="hs-tip"><strong>' + esc(h.label) + '</strong>' + tipBody + '</div>' +
            '</button>';
        }).join("") + '</div>';
    }
    return (
      '<div class="hero' + heroClass + '" data-hero="' + esc(id) + '">' +
      '<img src="' + esc(src) + '" alt="' + esc(name) + '"' + imgStyle + ' ' +
      "onerror=\"this.style.display='none';this.nextElementSibling.style.display='flex';\">" +
      '<div class="vx-img" style="display:none"><span class="lbl">[ image ]<br>' + esc(name) + ' — drop photo here:<br>' + esc(src) + '</span></div>' +
      spots +
      "</div>"
    );
  }

  function statsHTML(stats) {
    return '<div class="stats">' + stats.map(function (s) {
      return '<div class="stat"><div class="v">' + esc(s.v) + '</div><div class="l">' + esc(s.l) + "</div></div>";
    }).join("") + "</div>";
  }

  function render(s, idx) {
    var d = s.data;
    var inner = "";
    switch (s.type) {
      case "cover":
        return '<section class="slide ink cover active">' +
          '<img class="roundel" src="' + img + 'roundel-red.png" alt="">' +
          '<h1 class="title">' + esc(C.meta.title) + "</h1>" +
          (C.meta.subtitle ? '<div class="cover-version">' + esc(C.meta.subtitle) + "</div>" : "") +
          '<div class="blurb">' + esc(C.meta.blurb) + "</div>" +
          '<div class="chips">' + C.meta.chips.map(function (c, i) {
            return '<span class="chip' + (i === 1 ? " red" : "") + '">' + esc(c) + "</span>";
          }).join("") + "</div>" + chrome(s, idx) + "</section>";

      case "objectives":
        inner = '<div class="eyebrow">Learning Objectives</div>' +
          '<h2 class="title">By the end of this module…</h2>' +
          '<div class="obj-list">' + C.objectives.map(function (o, i) {
            return '<div class="obj-item"><span class="n">0' + (i + 1) + '</span><span class="t">' + esc(o) + "</span></div>";
          }).join("") + "</div>";
        return '<section class="slide dark objectives active">' + inner + chrome(s, idx) + "</section>";

      case "divider":
        return '<section class="slide ink divider active">' +
          '<div class="eyebrow">Section ' + esc(s.num) + "</div>" +
          '<div class="bignum">' + esc(s.num) + "</div>" +
          '<h1 class="title">' + esc(s.title) + "</h1>" +
          '<div class="quote">"' + esc(s.quote).replace(/\n/g, "<br>") + '"</div>' + chrome(Object.assign({}, s, { ink: true }), idx) + "</section>";

      case "timeline":
        return '<section class="slide ink tl-fs-slide active">' +
          '<div class="tl-carousel-wrap" id="tl-carousel-wrap"></div>' +
          '<div class="tl-strip-wrap">' +
            '<div class="tl-strip" id="tl-strip">' +
            C.timeline.map(function (t, i) {
              return '<button class="tl-dot" data-tl-dot="' + i + '" title="' + esc(t.year) + '"></button>';
            }).join('') +
            '</div>' +
            '<span class="tl-strip-counter" id="tl-strip-counter"></span>' +
          '</div>' +
          chrome(s, idx) + '</section>';

      case "vehicle":
        if (s.van) {
          // Van layout: compact with key facts + press
          inner = '<div class="veh-head"><div>' +
            '<div class="eyebrow">Van · ' + esc(d.tagline) + '</div>' +
            '<h2 class="title">' + esc(d.name) + '</h2></div></div>' +
            heroHTML(d.name, d.image, null, d.imageSrc, d.heroPos) +
            statsHTML(d.stats) +
            '<div class="cols"><div class="block"><h4>Key Facts</h4><ul class="facts">' +
            d.keyFacts.map(function (f) { return "<li>" + boldKeyInfo(f) + "</li>"; }).join("") + "</ul>" +
            (d.funFact ? '<div class="funbox"><b>Fun fact:</b> ' + boldKeyInfo(d.funFact) + "</div>" : "") +
            '</div><div class="block"><h4>What the press say</h4>' +
            '<div class="press' + (d.press.length === 1 ? " one" : "") + '">' +
            d.press.map(function (p) {
              return '<div class="quote"><div class="q">"' + esc(p.quote) + '"</div>' +
                pressAttributionHTML(p) + "</div>";
            }).join("") + "</div></div></div>";
          return '<section class="slide active"><div class="scroll">' + inner + "</div>" + chrome(s, idx) + "</section>";
        }
        // Car layout: taller hero with hotspots, press newsstand, VS overlays
        var h2hRows = (d.headToHead && d.headToHead.length)
          ? '<div class="h2h"><div class="h2h-head">' +
            '<span class="h2h-head-gap" aria-hidden="true"></span>' +
            '<span>Vauxhall</span><span class="h2h-vs">vs</span><span>Rival</span></div>' +
            d.headToHead.map(function (h) {
              return '<div class="h2h-row"><div class="h2h-label">' + boldKeyInfo(h.label) + '</div>' +
                '<div class="h2h-vx">' + boldKeyInfo(h.vauxhall) + '</div>' +
                '<div class="h2h-rv">' + boldKeyInfo(h.rival) + '</div></div>';
            }).join("") + "</div>" : "";
        var pressOv = '<div class="veh-overlay press-ov" id="press-ov">' +
          '<button class="ov-close" id="ov-close-press">&#10005;</button>' +
          '<div class="ov-eyebrow"><span class="eyebrow">Press Coverage</span><h2 class="ov-h2">What the press say</h2></div>' +
          '<div class="newsstand">' +
          d.press.map(function (p) {
            return '<div class="newspaper">' + pressFlagHTML(p) +
              '<div class="paper-body">&ldquo;' + esc(p.quote) + '&rdquo;</div></div>';
          }).join("") + "</div></div>";
        var vsVxSrc = d.vsImageSrc || ("assets/vs/" + d.image + ".png");
        var vsVxErr = d.vsImageSrc
          ? 'onerror="this.parentNode.classList.add(\'vs-ph\')"'
          : 'onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src=\'images/' + esc(d.image) + '.png\';}else{this.parentNode.classList.add(\'vs-ph\')}"';
        var vsOv = d.headToHead && d.headToHead.length
          ? '<div class="veh-overlay vs-ov" id="vs-ov">' +
            '<button class="ov-close" id="ov-close-vs">&#10005;</button>' +
            '<div class="ov-eyebrow"><span class="eyebrow">Head to Head</span><h2 class="ov-h2">Vauxhall vs Rivals</h2></div>' +
            '<div class="vs-arena">' +
            '<div class="vs-side">' +
            '<div class="vs-img-wrap' +
              (d.image === "corsa" ? " vs-img-corsa" : d.image === "astra" ? " vs-img-astra" : d.image === "mokka" ? " vs-img-mokka" : "") +
              '"><img src="' + esc(vsVxSrc) + '" ' +
            vsVxErr + '></div>' +
            '<div class="vs-car-label">Vauxhall ' + esc(d.name) + '</div></div>' +
            '<div class="vs-mid">' + h2hRows + '</div>' +
            '<div class="vs-side vs-side-r">' +
            '<div class="vs-img-wrap vs-rival-wrap' +
              (d.image === "frontera" ? " vs-img-rival-frontera" : d.image === "astra" ? " vs-img-rival-astra" : "") +
              '"><img src="assets/vs/' + esc(d.image) + '-rival.png" ' +
            'onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src=\'images/' + esc(d.image) + '-rival.png\';}else{this.parentNode.classList.add(\'vs-ph\')}"></div>' +
            '<div class="vs-car-label vs-rival-label">Rival</div></div>' +
            "</div></div>" : "";
        inner = '<div class="veh-head"><div>' +
          '<div class="eyebrow">Car · ' + esc(d.tagline) + '</div>' +
          '<h2 class="title">' + esc(d.name) + '</h2></div></div>' +
          (d.pitch ? '<p class="pitch-sm">' + esc(d.pitch) + '</p>' : '') +
          heroHTML(d.name, d.image, d.hotspots, d.imageSrc, d.heroPos) +
          statsHTML(d.stats) +
          '<div class="veh-actions">' +
          '<div class="veh-btns">' +
          (d.funFact ? '<button class="veh-btn btn-fun" id="btn-fun">&#9733; Fun Fact</button>' : '') +
          '<button class="veh-btn btn-press" id="btn-press">&#128240; Press Quotes</button>' +
          (d.headToHead && d.headToHead.length ? '<button class="veh-btn btn-vs" id="btn-vs">&#9889; vs Rivals</button>' : '') +
          '</div></div>' +
          (d.funFact
            ? '<div class="veh-overlay fun-ov" id="fun-ov">' +
              '<div class="fun-fact-panel">' +
              '<div class="fun-fact-tag"><span class="fun-star" aria-hidden="true">★</span> Fun Fact</div>' +
              '<div class="fun-fact-bar">' +
              '<div class="fun-fact-title">Did you know?</div>' +
              '<button type="button" class="fun-fact-close" id="ov-close-fun" aria-label="Close">×</button>' +
              '</div>' +
              '<div class="fun-fact-body"><p>' + boldKeyInfo(d.funFact) + '</p></div>' +
              '</div></div>'
            : '') +
          pressOv + vsOv;
        return '<section class="slide veh-car-slide active">' + inner + chrome(s, idx) + '</section>';

      case "retired":
        var retSrc = d.imageSrc || ("images/" + d.image + ".jpg");
        inner = '<div class="veh-head"><div>' +
          '<span class="retired-pill">' + esc(d.retired) + "</span>" +
          '<h2 class="title" style="margin-top:10px">' + esc(d.name) + "</h2></div></div>" +
          '<div class="ret-hero' + (d.imageSrc ? " ret-hero-stretch" : "") + '"><img src="' + esc(retSrc) + '" data-slot="hero" ' +
            'alt="' + esc(d.name) + '" ' +
            'onerror="this.parentElement.style.display=\'none\'"></div>' +
          '<div class="notice"><span class="warn">Important</span><span>' + boldKeyInfo(d.notice) + "</span></div>" +
          '<div class="cols"><div class="block"><h4>Final Specs (for reference)</h4><ul class="facts">' +
          d.specs.map(function (f) { return "<li>" + boldKeyInfo(f) + "</li>"; }).join("") + "</ul></div>" +
          '<div class="block"><h4>Why was it retired?</h4><p style="font-size:13px">' + boldKeyInfo(d.why) + "</p>" +
          '<div class="funbox"><b>Fun fact:</b> ' + boldKeyInfo(d.funFact) + "</div></div></div>";
        return '<section class="slide ret-slide active"><div class="scroll">' + inner + "</div>" + chrome(s, idx) + "</section>";

      case "comparison":
        inner = '<div class="eyebrow">Cheat Sheet</div><h2 class="title">The range at a glance</h2>' +
          '<div class="scroll" style="margin-top:14px"><table class="cmp"><thead><tr>' +
          C.comparison.headers.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
          C.comparison.rows.map(function (r) {
            return "<tr>" + r.map(function (c) { return "<td>" + boldKeyInfo(c) + "</td>"; }).join("") + "</tr>";
          }).join("") + "</tbody></table><div class=\"cmp-note\">" + boldKeyInfo(C.comparison.note) + "</div></div>";
        return '<section class="slide active">' + inner + chrome(s, idx) + "</section>";

      case "quiz-intro":
        return '<section class="slide ink divider active">' +
          '<div class="eyebrow">Section 06</div><div class="bignum">?</div>' +
          '<h1 class="title">Quiz Time</h1>' +
          '<div class="quote">' + C.quiz.length + " questions. Get " + (C.meta.passMin || Math.ceil(C.meta.passMark * C.quiz.length)) +
          " or more correct to pass and complete the module. Good luck.</div>" + chrome(s, idx) + "</section>";

      case "quiz":
        inner = '<div class="quiz-head"><span class="quiz-qnum">' + (s.qi + 1) + "</span>" +
          '<span class="eyebrow" style="align-self:flex-end;padding-bottom:8px">Question ' + (s.qi + 1) + " of " + C.quiz.length + "</span></div>" +
          '<div class="quiz-q">' + esc(d.q) + "</div>" +
          '<div class="options" data-qi="' + s.qi + '">' +
          d.a.map(function (opt, oi) {
            return '<button class="opt" data-oi="' + oi + '"><span class="mark">' +
              String.fromCharCode(65 + oi) + "</span><span>" + esc(opt) + "</span></button>";
          }).join("") + "</div>" +
          '<div class="quiz-fb" data-fb="' + s.qi + '"></div>';
        return '<section class="slide active">' + inner + chrome(s, idx) + "</section>";

      case "results":
        return '<section class="slide ink results active" data-results="1">' + chrome(s, idx) + "</section>";

      case "outro":
        inner = '<img class="roundel" src="' + img + 'roundel-white.png" alt="">' +
          '<div class="eyebrow">Module Complete</div>' +
          '<h1 class="title" style="font-size:52px">' + esc(C.outro.title) + "</h1>" +
          C.outro.body.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
          '<div id="completion-status" class="status-pill">Status: in progress</div>';
        return '<section class="slide dark outro active">' + inner + chrome(s, idx) + "</section>";
    }
    return '<section class="slide active"></section>';
  }

  /* ---- results computation ---- */
  function score() {
    var correct = 0;
    answers.forEach(function (a, i) { if (a === C.quiz[i].correct) correct++; });
    return correct;
  }
  function renderResults(sectionEl, idx) {
    var correct = score();
    var total = C.quiz.length;
    var passMin = C.meta.passMin || Math.ceil(C.meta.passMark * total);
    var pct = Math.round((correct / total) * 100);
    var passed = correct >= passMin;
    sectionEl.innerHTML =
      '<div class="eyebrow">Results</div>' +
      '<div class="ring ' + (passed ? "pass" : "") + '"><div class="pct">' + pct + '%</div><div class="pts">' + correct + " / " + total + " POINTS</div></div>" +
      '<div class="verdict">' + (passed ? "Congratulations, you passed!" : "Not quite — give it another go.") + "</div>" +
      '<div class="vsub">' + (passed
        ? "You've shown a strong grasp of the Vauxhall range. Continue to finish and record your completion."
        : "You need " + passMin + " out of " + total + " correct to pass. Review the course content and retake the quiz.") + "</div>" +
      '<div style="margin-top:22px;display:flex;gap:12px;flex-wrap:wrap">' +
      (passed
        ? '<button class="btn btn-success" id="results-continue">Continue →</button>'
        : '<button class="btn btn-outline" id="results-retry">↻ Retake quiz</button>' +
          '<button class="btn btn-primary" id="results-review">Review course →</button>') +
      "</div>" + chrome({ section: "Quiz", ink: true }, idx);

    if (passed) {
      window.VXSCORM.setScore(correct, total, Math.round(C.meta.passMark * 100));
      window.VXSCORM.setStatus("passed");
      var cont = sectionEl.querySelector("#results-continue");
      cont.addEventListener("click", function () { go(current + 1); });
    } else {
      window.VXSCORM.setScore(correct, total, Math.round(C.meta.passMark * 100));
      window.VXSCORM.setStatus("failed");
      var rt = sectionEl.querySelector("#results-retry");
      rt.addEventListener("click", function () {
        answers = new Array(C.quiz.length).fill(null);
        var firstQ = slides.map(function (x) { return x.type; }).indexOf("quiz");
        go(firstQ);
      });
      var rev = sectionEl.querySelector("#results-review");
      rev.addEventListener("click", function () {
        var historyIdx = slides.findIndex(function (x) { return x.type === "timeline"; });
        go(historyIdx >= 0 ? historyIdx : 0);
      });
    }
  }

  /* ---- Author-mode preview API ---- *
   * Expose render() + slides so author.js can call VX_RENDER.render(slide, idx)
   * and get the exact same HTML the live course would produce.
   * When VX_AUTHOR_MODE is true (set in author.html), we stop here — no DOM wiring. */
  window.VX_RENDER = {
    slides: slides,
    render: render,
    getCurrentIndex: function () { return current; },
    go: function (idx) { go(idx); },

    /* Render a single timeline entry as a standalone preview (no carousel chrome) */
    renderTimelineEntry: function (year) {
      var t = (C.timeline || []).find(function (e) { return String(e.year) === String(year); });
      if (!t) return '<div class="tl-text-entry"><p style="color:#fff;padding:20px">Entry not found: ' + year + '</p></div>';
      var inner = t.layout === "immersive"    ? buildImmersiveContent(t)
                : t.layout === "room-explore" ? buildRoomExploreContent(t)
                : buildTextEntry(t);
      return '<section class="slide tl-fs-slide active" style="overflow:hidden">' + inner + '</section>';
    },

    /* Find the engine slide matching a scene-id string */
    slideForId: function (sceneId) {
      if (!sceneId) return null;
      var parts = sceneId.split("-");
      var kind  = parts[0];
      var key   = parts.slice(1).join("-");
      return slides.find(function (s) {
        if (kind === "vehicle")    return s.type === "vehicle" && s.data && s.data.image === key;
        if (kind === "retired")    return s.type === "retired" && s.data && s.data.image === key;
        if (kind === "cover")      return s.type === "cover";
        if (kind === "objectives") return s.type === "objectives";
        if (kind === "comparison") return s.type === "comparison";
        if (kind === "results")    return s.type === "results";
        if (kind === "outro")      return s.type === "outro";
        if (kind === "quizintro")  return s.type === "quiz-intro";
        if (kind === "quiz" && key !== "") {
          var qi = parseInt(key, 10);
          return s.type === "quiz" && s.qi === qi;
        }
        if (kind === "divider") {
          var secMap = { history: "History", cars: "Cars", vans: "Vans", retired: "Retired" };
          return s.type === "divider" && s.section === (secMap[key] || key);
        }
        return false;
      }) || null;
    }
  };
  if (window.VX_AUTHOR_MODE) return; /* stop — author tool only needs render API */

  /* ---- navigation ---- */
  /* Map any slide to its author-scene ID (must match defaultScenes() in author.js) */
  function sceneIdForSlide(s) {
    if (!s) return null;
    if (s.type === "vehicle")   return "vehicle-" + (s.data && s.data.image);
    if (s.type === "retired")   return "retired-"  + (s.data && s.data.image);
    if (s.type === "cover")     return "cover";
    if (s.type === "objectives") return "objectives";
    if (s.type === "comparison") return "comparison";
    if (s.type === "results")   return "results";
    if (s.type === "outro")     return "outro";
    if (s.type === "quiz-intro") return "quizintro";
    if (s.type === "quiz")      return "quiz-" + s.qi;
    if (s.type === "divider") {
      var dm = { History: "divider-history", Cars: "divider-cars", Vans: "divider-vans", Retired: "divider-retired" };
      return dm[s.section] || ("divider-" + (s.section || "").toLowerCase());
    }
    return s.type;
  }

  function go(idx) {
    idx = Math.max(0, Math.min(idx, slides.length - 1));
    current = idx;
    maxReached = Math.max(maxReached, idx);
    var s = slides[idx];
    stage.innerHTML = render(s, idx);
    var sectionEl = stage.firstChild;

    if (s.type === "quiz") wireQuiz(sectionEl, s);
    if (s.type === "results") renderResults(sectionEl, idx);
    if (s.type === "timeline") wireTimeline(sectionEl);
    if (s.type === "vehicle") wireVehicle(sectionEl); // wireVehicle calls applyVehicleAuthorOverrides internally
    /* Apply author text/overlay overrides for every non-vehicle slide type */
    if (s.type !== "vehicle") {
      applyVehicleAuthorOverrides(sectionEl, sceneIdForSlide(s));
    }
    wireSlideReveal(sectionEl);

    // mark vehicle as visited & refresh menu
    if (s.type === "vehicle") {
      visitedVehicles[idx] = true;
    }
    updateProgressMenu(idx);

    // nav button state
    elPrev.disabled = idx === 0;
    var blockNext = false;
    if (s.type === "quiz" && answers[s.qi] === null) blockNext = true;
    if (s.type === "results") blockNext = true; // use in-slide buttons
    elNext.classList.toggle("hidden", idx === slides.length - 1);
    elFinish.classList.toggle("hidden", idx !== slides.length - 1);
    elNext.disabled = blockNext;

    elReadout.textContent = (idx + 1) + " / " + slides.length;
    window.VXSCORM.setLocation(idx);
    if (s.type === "outro") markOutro(sectionEl);
    window.VXSCORM.commit();
    if (window.VX_REVIEW_PANEL && typeof window.VX_REVIEW_PANEL.onNavigate === "function") {
      window.VX_REVIEW_PANEL.onNavigate(idx);
    }
  }

  function wireQuiz(sectionEl, s) {
    var opts = sectionEl.querySelectorAll(".opt");
    var fb = sectionEl.querySelector('[data-fb="' + s.qi + '"]');
    var chosen = answers[s.qi];
    function paint() {
      opts.forEach(function (o) {
        var oi = parseInt(o.getAttribute("data-oi"), 10);
        o.classList.remove("sel", "correct", "wrong", "locked");
        if (chosen !== null) {
          o.classList.add("locked");
          if (oi === s.data.correct) o.classList.add("correct");
          else if (oi === chosen) o.classList.add("wrong");
        }
      });
      if (chosen !== null) {
        var ok = chosen === s.data.correct;
        fb.className = "quiz-fb " + (ok ? "ok" : "no");
        fb.textContent = ok ? "Correct!" : "Not quite — the highlighted answer is correct.";
        elNext.disabled = false;
      }
    }
    opts.forEach(function (o) {
      o.addEventListener("click", function () {
        if (answers[s.qi] !== null) return;
        chosen = parseInt(o.getAttribute("data-oi"), 10);
        answers[s.qi] = chosen;
        paint();
      });
    });
    paint();
  }

  function markOutro(sectionEl) {
    window.VXSCORM.setStatus("completed");
    window.VXSCORM.commit();
    var pill = sectionEl.querySelector("#completion-status");
    if (pill) { pill.className = "status-pill done"; pill.textContent = "Status: Completed ✓"; }
  }

  /* ---- timeline entry builders (top-level so VX_RENDER can expose them) ---- */

  /** Timeline bullets may include safe inline tags (em, strong, i). */
  function formatTimelineBullet(raw) {
    return boldKeyInfo(raw)
      .replace(/&lt;(\/?)(em|strong|i|br)&gt;/gi, "<$1$2>");
  }

  function buildBritain1980sSceneHTML(overPhoto) {
    var shops = "";
    var shopColors = ["#e040a0", "#2080d0", "#e8c020", "#30b0a0", "#d05030"];
    for (var i = 0; i < 6; i++) {
      shops +=
        '<div class="tl-brit80-shop" style="--shop-color:' + shopColors[i % shopColors.length] + '">' +
          '<div class="tl-brit80-shop-roof"></div>' +
          '<div class="tl-brit80-shop-front">' +
            '<div class="tl-brit80-shop-win"></div>' +
            '<div class="tl-brit80-shop-win"></div>' +
          '</div>' +
          '<div class="tl-brit80-aerial"></div>' +
        '</div>';
    }
    return (
      '<div class="tl-brit80-scene' + (overPhoto ? ' tl-brit80-over-photo' : '') + '" aria-hidden="true">' +
        '<div class="tl-brit80-sky"></div>' +
        '<div class="tl-brit80-sunset"></div>' +
        '<div class="tl-brit80-blocks">' +
          '<div class="tl-brit80-tower tl-brit80-tower-a"></div>' +
          '<div class="tl-brit80-tower tl-brit80-tower-b"></div>' +
          '<div class="tl-brit80-tower tl-brit80-tower-c"></div>' +
        '</div>' +
        '<div class="tl-brit80-shops">' + shops + '</div>' +
        '<div class="tl-brit80-pavement"></div>' +
        '<div class="tl-brit80-neon">SALE</div>' +
        '<div class="tl-brit80-memphis tl-brit80-memphis-a"></div>' +
        '<div class="tl-brit80-memphis tl-brit80-memphis-b"></div>' +
        '<div class="tl-brit80-memphis tl-brit80-memphis-c"></div>' +
        '<div class="tl-brit80-chimney"></div>' +
        '<div class="tl-brit80-vignette"></div>' +
      '</div>'
    );
  }

  function buildElectric2020SceneHTML() {
    var particles = "";
    for (var p = 0; p < 10; p++) {
      particles +=
        '<div class="tl-ev20-particle" style="left:' + (8 + p * 9) + '%;bottom:' + (18 + (p % 4) * 6) +
        '%;animation-delay:' + (p * 0.45) + 's;animation-duration:' + (3.2 + (p % 3) * 0.8) + 's"></div>';
    }
    return (
      '<div class="tl-ev20-scene" aria-hidden="true">' +
        '<div class="tl-ev20-bg"></div>' +
        '<div class="tl-ev20-aurora"></div>' +
        '<div class="tl-ev20-aurora tl-ev20-aurora-b"></div>' +
        '<div class="tl-ev20-hex"></div>' +
        '<div class="tl-ev20-grid-back"></div>' +
        '<div class="tl-ev20-grid-floor"></div>' +
        '<svg class="tl-ev20-circuit" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice">' +
          '<path class="tl-ev20-path tl-ev20-path-a" d="M 40 400 L 220 400 L 220 120 L 480 120 L 480 260 L 640 260" />' +
          '<path class="tl-ev20-path tl-ev20-path-b" d="M 920 380 L 740 380 L 740 160 L 520 160 L 520 300 L 360 300" />' +
          '<path class="tl-ev20-path tl-ev20-path-c" d="M 120 480 L 420 480 L 420 340 L 680 340" />' +
          '<path class="tl-ev20-path tl-ev20-path-d" d="M 760 480 L 760 380 L 860 380 L 860 220" />' +
          '<circle class="tl-ev20-node" cx="220" cy="120" r="4" />' +
          '<circle class="tl-ev20-node" cx="480" cy="260" r="4" />' +
          '<circle class="tl-ev20-node" cx="740" cy="160" r="4" />' +
          '<circle class="tl-ev20-node" cx="420" cy="340" r="4" />' +
          '<circle class="tl-ev20-node" cx="860" cy="220" r="3" />' +
        '</svg>' +
        '<div class="tl-ev20-orbs">' +
          '<div class="tl-ev20-orb tl-ev20-orb-a"></div>' +
          '<div class="tl-ev20-orb tl-ev20-orb-b"></div>' +
          '<div class="tl-ev20-orb tl-ev20-orb-c"></div>' +
        '</div>' +
        '<div class="tl-ev20-beam"></div>' +
        particles +
        '<div class="tl-ev20-charger">' +
          '<div class="tl-ev20-ring tl-ev20-ring-1"></div>' +
          '<div class="tl-ev20-ring tl-ev20-ring-2"></div>' +
          '<div class="tl-ev20-ring tl-ev20-ring-3"></div>' +
          '<div class="tl-ev20-charger-glow"></div>' +
          '<div class="tl-ev20-charger-post"></div>' +
          '<div class="tl-ev20-charger-head"></div>' +
          '<div class="tl-ev20-cable"></div>' +
        '</div>' +
        '<div class="tl-ev20-bolt"></div>' +
        '<div class="tl-ev20-bolt tl-ev20-bolt-2"></div>' +
        '<div class="tl-ev20-spark tl-ev20-spark-1"></div>' +
        '<div class="tl-ev20-spark tl-ev20-spark-2"></div>' +
        '<div class="tl-ev20-spark tl-ev20-spark-3"></div>' +
        '<div class="tl-ev20-spark tl-ev20-spark-4"></div>' +
        '<div class="tl-ev20-spark tl-ev20-spark-5"></div>' +
        '<div class="tl-ev20-spark tl-ev20-spark-6"></div>' +
        '<div class="tl-ev20-scan"></div>' +
        '<div class="tl-ev20-scan tl-ev20-scan-fast"></div>' +
        '<div class="tl-ev20-vignette"></div>' +
      '</div>'
    );
  }

  function buildBritain2000sSceneHTML() {
    var houses = "";
    for (var i = 0; i < 7; i++) {
      houses +=
        '<div class="tl-brit00-semi">' +
          '<div class="tl-brit00-roof"></div>' +
          '<div class="tl-brit00-brick">' +
            '<div class="tl-brit00-win"></div><div class="tl-brit00-win"></div>' +
            '<div class="tl-brit00-door"></div>' +
          '</div>' +
          '<div class="tl-brit00-dish"></div>' +
        '</div>';
    }
    return (
      '<div class="tl-brit00-scene" aria-hidden="true">' +
        '<div class="tl-brit00-sky">' +
          '<div class="tl-brit00-cloud tl-brit00-cloud-a"></div>' +
          '<div class="tl-brit00-cloud tl-brit00-cloud-b"></div>' +
          '<div class="tl-brit00-cloud tl-brit00-cloud-c"></div>' +
        '</div>' +
        '<div class="tl-brit00-houses">' + houses + '</div>' +
        '<div class="tl-brit00-hedge"></div>' +
        '<div class="tl-brit00-pavement"></div>' +
        '<div class="tl-brit00-road"><div class="tl-brit00-road-dash"></div></div>' +
        '<div class="tl-brit00-phonebox"></div>' +
        '<div class="tl-brit00-lamp"></div>' +
        '<div class="tl-brit00-vignette"></div>' +
      '</div>'
    );
  }

  function buildRiverSceneHTML() {
    return (
      '<div class="tl-river-scene" aria-hidden="true">' +
        '<div class="tl-river-sky"></div>' +
        '<div class="tl-river-mist"></div>' +
        '<div class="tl-river-water">' +
          '<div class="tl-river-wave tl-river-wave-1"></div>' +
          '<div class="tl-river-wave tl-river-wave-2"></div>' +
          '<div class="tl-river-shimmer"></div>' +
        '</div>' +
        '<div class="tl-river-boat">' +
          '<div class="tl-boat-smoke tl-boat-smoke-1"></div>' +
          '<div class="tl-boat-smoke tl-boat-smoke-2"></div>' +
          '<div class="tl-boat-stack"></div>' +
          '<div class="tl-boat-cabin"></div>' +
          '<div class="tl-boat-hull"></div>' +
          '<div class="tl-boat-wheel tl-boat-wheel-a"></div>' +
          '<div class="tl-boat-wheel tl-boat-wheel-b"></div>' +
        '</div>' +
        '<div class="tl-river-bank"></div>' +
      '</div>'
    );
  }

  function buildMapRouteHTML() {
    return (
      '<div class="tl-map-route-overlay" aria-hidden="true">' +
        '<svg class="tl-map-route-svg" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice">' +
          '<g class="tl-map-route-drift">' +
            '<path class="tl-map-route-line tl-map-route-shadow" d="M 637 438 C 617 390, 599 348, 581 312 C 563 276, 541 242, 521 210 C 501 178, 483 154, 471 136 C 459 118, 453 106, 467 90" />' +
            '<path class="tl-map-route-line tl-map-route-main"   d="M 629 428 C 609 382, 591 340, 573 304 C 555 268, 533 234, 513 202 C 493 170, 475 146, 463 128 C 451 110, 447 98, 459 82" />' +
            '<path class="tl-map-route-line tl-map-route-alt"    d="M 621 418 C 601 374, 583 334, 565 298 C 547 262, 525 228, 505 196 C 485 164, 467 140, 455 122" />' +
          '</g>' +
          '<circle class="tl-map-route-dot tl-map-route-dot-start" cx="629" cy="428" r="5" />' +
          '<circle class="tl-map-route-dot tl-map-route-dot-end"   cx="459" cy="82"  r="5" />' +
        '</svg>' +
      '</div>'
    );
  }

  function buildStellantisSceneHTML(t) {
    var positions = [
      { left: 6,  top: 10, size: 11, anim: "a", dur: 19, delay: 0   },
      { left: 78, top: 8,  size: 10, anim: "b", dur: 22, delay: 1.2 },
      { left: 4,  top: 58, size: 9,  anim: "c", dur: 24, delay: 2.4 },
      { left: 82, top: 52, size: 12, anim: "d", dur: 20, delay: 0.8 },
      { left: 22, top: 4,  size: 8,  anim: "e", dur: 26, delay: 3.1 },
      { left: 68, top: 68, size: 10, anim: "f", dur: 21, delay: 1.8 },
      { left: 14, top: 78, size: 9,  anim: "g", dur: 23, delay: 4.2 },
      { left: 88, top: 28, size: 8,  anim: "h", dur: 25, delay: 2.0 }
    ];
    var logos = t.floatingLogos || [];
    return (
      '<div class="tl-stell-bg"></div>' +
      '<img class="tl-stell-centre" src="' + esc(t.stellantisLogo || "images/logos/stell-logo-white.png") + '" alt="Stellantis">' +
      logos.map(function (src, i) {
        var p = positions[i % positions.length];
        return '<img class="tl-stell-float tl-stell-drift-' + p.anim + '" ' +
          'style="left:' + p.left + '%;top:' + p.top + '%;height:' + p.size + '%;' +
          'animation-duration:' + p.dur + 's;animation-delay:' + p.delay + 's" ' +
          'src="' + esc(src) + '" alt="">';
      }).join("")
    );
  }

  function buildPhotoBgHTML(t) {
    if (!t.bg) return "";
    return (
      '<div class="tl-im-bg' +
      (t.mapRoute ? ' tl-im-bg-map' : '') +
      (t.bgContrast ? ' tl-im-bg-contrast' : '') +
      (t.bgSoft ? ' tl-im-bg-soft' : '') +
      (t.bgPan ? ' tl-im-bg-pan' : '') +
      '" style="background-image:' + cssBgUrl(t.bg) +
      (t.bgColor ? ';background-color:' + t.bgColor : '') + '"></div>' +
      (t.mapRoute ? buildMapRouteHTML() : "")
    );
  }

  function buildImmersiveContent(t) {
    var bullets = t.bullets
      ? t.bullets.map(formatTimelineBullet).concat(t.fact ? [formatTimelineBullet(t.fact)] : [])
      : [formatTimelineBullet(t.text)].concat(t.fact ? ['<strong>Fun fact:</strong> ' + formatTimelineBullet(t.fact)] : []);
    var bgHtml = buildPhotoBgHTML(t);
    if (t.stellantisScene) {
      bgHtml += buildStellantisSceneHTML(t);
    } else if (t.britain2000sScene) {
      bgHtml += buildBritain2000sSceneHTML();
    } else if (t.britain1980sScene) {
      bgHtml += buildBritain1980sSceneHTML(!!t.bg);
    } else if (t.electric2020Scene) {
      bgHtml += buildElectric2020SceneHTML();
    } else if (t.riverScene) {
      bgHtml += buildRiverSceneHTML();
    } else if (!bgHtml) {
      bgHtml =
        '<div class="tl-im-bg' +
        (t.mapRoute ? ' tl-im-bg-map' : '') +
        (t.bgContrast ? ' tl-im-bg-contrast' : '') +
        (t.bgSoft ? ' tl-im-bg-soft' : '') +
        (t.bgPan ? ' tl-im-bg-pan' : '') +
        '" style="background-image:' + cssBgUrl(t.bg) +
        (t.bgColor ? ';background-color:' + t.bgColor : '') + '"></div>' +
        (t.mapRoute ? buildMapRouteHTML() : '');
    }
    return (
      bgHtml +
      (t.assets || []).map(function (a) {
        var img = '<img class="tl-im-asset" src="' + esc(a.src) + '" alt="' + esc(a.label || '') + '">';
        if (a.label) {
          return '<div class="tl-im-car-stack ' + esc(a.cls) + '">' + img +
            '<span class="tl-im-car-tag">' + esc(a.label) + '</span></div>';
        }
        return '<img class="tl-im-asset ' + esc(a.cls) + '" src="' + esc(a.src) + '" alt="">';
      }).join('') +
      '<div class="tl-im-label">' +
        '<div class="tl-im-label-year">' + esc(t.year) + '</div>' +
        (t.title ? '<div class="tl-im-label-title' + (t.titleRed ? ' tl-im-title-red' : '') + '">' + formatTimelineBullet(t.title) + '</div>' : '') +
      '</div>' +
      '<div class="tl-im-panel">' +
        '<ul class="tl-im-bullets">' +
        bullets.map(function (b) { return '<li>' + b + '</li>'; }).join('') +
        '</ul>' +
      '</div>'
    );
  }

  function buildRoomExploreContent(t) {
    var hs = t.windowHotspot || { x: 57, y: 12, w: 26, h: 48 };
    var carLabels = (t.drivewayCars || []).map(function (c) {
      return '<span class="tl-driveway-car-label tl-re-car-label" style="left:' + c.x + '%;top:' + c.y + '%">' + esc(c.label) + '</span>';
    }).join("");
    return (
      '<div class="tl-room-scene">' +
        '<div class="tl-room-bg tl-re-bg" style="background-image:' + cssBgUrl(t.bg) + '"></div>' +
        '<div class="tl-window-hotspot tl-re-win" ' +
          'style="left:' + hs.x + '%;top:' + hs.y + '%;width:' + hs.w + '%;height:' + hs.h + '%">' +
          '<span class="tl-window-label">&#128293; Look outside</span>' +
        '</div>' +
        '<button class="tl-room-back-btn tl-re-back">&#8592; Back inside</button>' +
        carLabels +
        '<div class="tl-im-label">' +
          '<div class="tl-im-label-year">' + esc(t.year) + '</div>' +
          (t.title ? '<div class="tl-im-label-title">' + formatTimelineBullet(t.title) + '</div>' : '') +
        '</div>' +
        '<div class="tl-im-panel tl-re-panel">' +
          '<ul class="tl-im-bullets tl-re-bullets">' +
          (t.bullets || [t.text]).map(formatTimelineBullet).map(function (b) { return '<li>' + b + '</li>'; }).join('') +
          '</ul>' +
        '</div>' +
      '</div>'
    );
  }

  function buildTextEntry(t) {
    return (
      '<div class="tl-text-entry">' +
        '<div class="tl-text-year-bg">' + esc(t.year) + '</div>' +
        '<div class="tl-text-content">' +
          (t.eyebrow ? '<div class="tl-text-eyebrow">' + esc(t.eyebrow) + '</div>' : '') +
          (t.title
            ? '<h2 class="tl-text-h">' + formatTimelineBullet(t.title) + '</h2>'
            : '<div class="tl-text-yr">' + esc(t.year) + '</div>') +
          '<p class="tl-text-body">' + formatTimelineBullet(t.text) + '</p>' +
          (t.fact ? '<div class="tl-text-fact">' + formatTimelineBullet(t.fact) + '</div>' : '') +
        '</div>' +
      '</div>'
    );
  }

  /* ---- timeline wiring — fullscreen carousel ---- */
  function wireTimeline(el) {
    var carouselWrap = el.querySelector("#tl-carousel-wrap");
    var dotEls       = Array.prototype.slice.call(el.querySelectorAll(".tl-dot"));
    var counterEl    = el.querySelector("#tl-strip-counter");
    var activeTl     = -1;
    var tlSIdx       = current;

    /* ---- progress dots ---- */
    function updateDots() {
      dotEls.forEach(function (d, i) {
        d.classList.toggle("tl-dot-visited", !!(visitedTlTiles[tlSIdx] && visitedTlTiles[tlSIdx][i]));
        d.classList.toggle("tl-dot-current", i === activeTl);
      });
      if (counterEl) counterEl.textContent = (activeTl + 1) + " / " + C.timeline.length;
    }

    /* ---- show an entry ---- */
    function showEntry(i, dir) {
      dir = (dir === undefined ? 1 : dir);
      var t = C.timeline[i];
      activeTl = i;

      if (!visitedTlTiles[tlSIdx]) visitedTlTiles[tlSIdx] = {};
      visitedTlTiles[tlSIdx][i] = true;

      /* animate out and remove ALL previous entries (fast nav was leaving stacks) */
      Array.prototype.slice.call(carouselWrap.querySelectorAll(".tl-carousel-entry")).forEach(function (o) {
        o.classList.add(dir >= 0 ? "tl-exit-left" : "tl-exit-right");
        (function (node) {
          setTimeout(function () {
            if (node.parentNode) node.parentNode.removeChild(node);
          }, 420);
        })(o);
      });

      /* build new entry */
      var entryEl = document.createElement("div");
      entryEl.className = "tl-carousel-entry " + (dir >= 0 ? "tl-entry-from-right" : "tl-entry-from-left");

      if (t.layout === "immersive") {
        entryEl.classList.add("tl-entry-im");
        if (t.bgContrast) entryEl.classList.add("tl-entry-contrast");
        if (t.carLineup) {
          entryEl.classList.add("tl-entry-car-lineup");
          if (t.carLineup === "dual") entryEl.classList.add("tl-entry-car-dual");
        }
        if (t.britain2000sScene) entryEl.classList.add("tl-entry-britain-2000s");
        if (t.britain1980sScene) entryEl.classList.add("tl-entry-britain-1980s");
        if (t.electric2020Scene) entryEl.classList.add("tl-entry-ev-2020");
        if (t.panelTop) entryEl.classList.add("tl-entry-panel-top");
        entryEl.innerHTML = buildImmersiveContent(t);
      } else if (t.layout === "room-explore") {
        entryEl.classList.add("tl-entry-im");
        entryEl.innerHTML = buildRoomExploreContent(t);

        /* wire room-explore scene swap */
        var roomBg    = entryEl.querySelector(".tl-re-bg");
        var windowEl  = entryEl.querySelector(".tl-re-win");
        var backBtn   = entryEl.querySelector(".tl-re-back");
        var panelEl   = entryEl.querySelector(".tl-re-panel");
        var bulletsEl = entryEl.querySelector(".tl-re-bullets");
        var carLabels = entryEl.querySelectorAll(".tl-re-car-label");
        var indoorB   = (t.bullets || [t.text]).map(formatTimelineBullet);

        function switchScene(goOut) {
          var nextSrc = goOut ? t.driveway : t.bg;
          var next = document.createElement("div");
          next.className = "tl-room-bg tl-re-bg crossfade";
          next.style.backgroundImage = cssBgUrl(nextSrc);
          roomBg.parentNode.insertBefore(next, roomBg);
          setTimeout(function () { if (roomBg.parentNode) roomBg.parentNode.removeChild(roomBg); roomBg = next; }, 560);
          windowEl.style.display = goOut ? "none" : "";
          backBtn.style.display  = goOut ? "block" : "none";
          if (panelEl) panelEl.style.display = goOut ? "none" : "";
          carLabels.forEach(function (lbl) { lbl.style.display = goOut ? "block" : "none"; });
          if (!goOut && bulletsEl) {
            bulletsEl.innerHTML = indoorB.map(function (b) { return "<li>" + b + "</li>"; }).join("");
          }
        }
        windowEl.addEventListener("click", function () { switchScene(true); });
        backBtn.addEventListener("click",   function () { switchScene(false); });
      } else {
        entryEl.innerHTML = buildTextEntry(t);
      }

      carouselWrap.appendChild(entryEl);
      el.classList.toggle("tl-scene-contrast", !!t.bgContrast);
      updateDots();
    }

    /* dot click = jump to any entry */
    dotEls.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showEntry(i, i > activeTl ? 1 : -1);
      });
    });

    /* advance / retreat — called by main course nav buttons */
    el._tlAdvance = function () {
      if (activeTl < C.timeline.length - 1) { showEntry(activeTl + 1, 1); return true; }
      return false;
    };
    el._tlRetreat = function () {
      if (activeTl > 0) { showEntry(activeTl - 1, -1); return true; }
      return false;
    };

    showEntry(0, 1);
  }

  function parseStatForCountup(raw) {
    var s = String(raw == null ? "" : raw).trim();
    var m = s.match(/^([^0-9]*)([0-9][0-9.,]*)(.*)$/);
    if (!m) return null;
    var numStr = m[2];
    var num = parseFloat(numStr.replace(/,/g, ""));
    if (isNaN(num)) return null;
    var dot = numStr.indexOf(".");
    return {
      prefix: m[1],
      suffix: m[3],
      num: num,
      hasComma: numStr.indexOf(",") >= 0,
      decimals: dot >= 0 ? numStr.length - dot - 1 : 0,
      raw: s
    };
  }

  function formatStatCount(parts, value) {
    var n;
    if (parts.decimals > 0) n = value.toFixed(parts.decimals);
    else if (parts.hasComma) n = Math.round(value).toLocaleString("en-GB");
    else n = String(Math.round(value));
    return parts.prefix + n + parts.suffix;
  }

  function applyRevealNodes(nodes, startIndex) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    nodes = Array.prototype.slice.call(nodes).filter(Boolean);
    if (!nodes.length) return;
    startIndex = startIndex || 0;
    var mods = nodes.map(function (node) {
      return ["reveal-scale", "reveal-fade", "reveal-chrome"].filter(function (c) {
        return node.classList.contains(c);
      });
    });
    nodes.forEach(function (node) {
      if (!node) return;
      node.classList.remove("reveal-item", "reveal-scale", "reveal-fade", "reveal-chrome");
      node.style.removeProperty("--reveal-i");
    });
    requestAnimationFrame(function () {
      nodes.forEach(function (node, i) {
        if (!node) return;
        node.classList.add("reveal-item");
        mods[i].forEach(function (c) { node.classList.add(c); });
        node.style.setProperty("--reveal-i", startIndex + i);
      });
    });
  }

  function wireSlideReveal(sectionEl) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function skip(node) {
      return node.closest(".veh-overlay, .tl-carousel-wrap, .hs-tip");
    }

    function add(items, sel, opts) {
      opts = opts || {};
      sectionEl.querySelectorAll(sel).forEach(function (node) {
        if (skip(node) || items.indexOf(node) >= 0) return;
        if (opts.extra) opts.extra(node);
        items.push(node);
      });
    }

    var items = [];
    add(items, ".roundel", { extra: function (n) { n.classList.add("reveal-scale"); } });
    add(items, ".eyebrow");
    add(items, ".bignum");
    add(items, "h1.title, h2.title, h3.sub");
    add(items, ".blurb, .pitch-sm, .lede");
    add(items, ".divider .quote");
    add(items, ".chips .chip");
    add(items, ".hero");
    add(items, ".stats .stat");
    add(items, ".veh-actions");
    add(items, ".notice");
    add(items, ".block h4");
    add(items, ".facts li");
    add(items, ".press .quote");
    add(items, ".funbox");
    add(items, ".obj-item");
    add(items, ".quiz-head");
    add(items, ".quiz-q");
    add(items, ".opt");
    add(items, "table.cmp thead tr");
    add(items, "table.cmp tbody tr");
    add(items, ".cmp-note");
    add(items, ".results .ring");
    add(items, ".results .verdict");
    add(items, ".results .vsub");
    add(items, ".results button, .results .btn");
    add(items, ".outro p");
    add(items, "#completion-status");
    add(items, ".tl-header .eyebrow, .tl-header h2.title");
    add(items, ".tl-tile");
    add(items, ".hs-dot");

    if (!items.length) {
      var root = sectionEl.querySelector(".scroll") || sectionEl;
      Array.prototype.forEach.call(root.children, function (child) {
        if (child.matches(".chrome-logo, .chrome-nav, .veh-overlay, .tl-detail, .tl-detail-im")) return;
        items.push(child);
      });
    }

    var logo = sectionEl.querySelector(".chrome-logo");
    if (logo) {
      logo.classList.add("reveal-chrome", "reveal-fade");
      items.push(logo);
    }
    var nav = sectionEl.querySelector(".chrome-nav");
    if (nav) {
      nav.classList.add("reveal-chrome", "reveal-fade");
      items.push(nav);
    }

    applyRevealNodes(items);
  }

  /* ---- vehicle wiring (hotspots + overlays) ---- */
  /* ---- Read authored positions / overrides from localStorage ---- */
  function readAuthorScene(scId) {
    try {
      var raw = localStorage.getItem("vauxhall-scene-author-v2");
      if (!raw) return null;
      var data = JSON.parse(raw);
      return (data.scenes && data.scenes[scId]) || null;
    } catch (e) { return null; }
  }

  function applyAuthorPos(img, posObj) {
    if (!img || !posObj) return;
    var px = posObj.imgPosX != null ? posObj.imgPosX : 50;
    var py = posObj.imgPosY != null ? posObj.imgPosY : 50;
    var zm = posObj.imgZoom != null ? posObj.imgZoom : 1;
    img.style.objectFit = "cover";
    img.style.objectPosition = px + "% " + py + "%";
    if (zm !== 1) {
      img.style.width  = Math.round(zm * 100) + "%";
      img.style.height = Math.round(zm * 100) + "%";
      if (img.parentElement) img.parentElement.style.overflow = "hidden";
    }
  }

  /* Apply all author overrides to a rendered vehicle slide:
     - hero image pan/zoom
     - hotspot x/y repositioning
     - native text slot overrides
     - custom overlay elements (images, text, buttons) */
  function applyVehicleAuthorOverrides(slideEl, scId) {
    var sc = readAuthorScene(scId);
    if (!sc) return;

    // 1. Hero image position
    var heroImg = slideEl.querySelector(".hero img");
    if (heroImg && sc.pos && sc.pos.hero) applyAuthorPos(heroImg, sc.pos.hero);

    // 2. Native text slot overrides (title, eyebrow, pitch, stat values, button labels)
    if (sc.over) {
      Object.keys(sc.over).forEach(function (slot) {
        var node = slideEl.querySelector('[data-slot="' + slot + '"]');
        if (node && sc.over[slot] != null) node.textContent = sc.over[slot];
      });
    }

    // 3. Hotspot position overrides (author moves them on canvas)
    var liveDots = Array.prototype.slice.call(slideEl.querySelectorAll(".hs-dot"));
    var authorHotspots = (sc.elements || []).filter(function (e) { return e.type === "hotspot"; });
    liveDots.forEach(function (dot, idx) {
      var ae = authorHotspots[idx];
      if (!ae) return;
      if (ae.x != null) dot.style.left = ae.x + "%";
      if (ae.y != null) dot.style.top  = ae.y + "%";
      dot.classList.toggle("hs-flip", (ae.y != null ? ae.y : parseFloat(dot.style.top)) < 46);
    });

    // 4. Custom overlay elements added in author (text labels, extra images, buttons)
    var hsLayer  = slideEl.querySelector("#hero-layer") || slideEl.querySelector(".hs-layer");
    var ovLayer  = slideEl.querySelector("#overlay-layer") || slideEl.querySelector(".author-overlay");
    var overlayTarget = ovLayer || hsLayer || slideEl;
    var customEls = (sc.elements || []).filter(function (e) { return e.type !== "hotspot"; });
    customEls.forEach(function (e) {
      var node = document.createElement(e.type === "button" ? "button" : "div");
      node.className = "engine-overlay-el engine-el-" + e.type;
      node.style.cssText = [
        "position:absolute",
        "left:" + e.x + "%", "top:" + e.y + "%",
        "z-index:" + (e.z || 20),
        e.type === "image" ? "width:" + e.w + "%;height:" + e.h + "%" : "",
        e.color ? "color:" + e.color : "",
        e.bg && e.type !== "image" ? "background:" + e.bg : "",
        e.fontSize ? "font-size:" + e.fontSize + "px" : "",
        e.bold ? "font-weight:700" : "",
        e.italic ? "font-style:italic" : "",
        e.align ? "text-align:" + e.align : "",
        e.radius ? "border-radius:" + e.radius + "px" : "",
        e.shadow ? "box-shadow:0 4px 18px rgba(0,0,0,.35)" : ""
      ].filter(Boolean).join(";");
      if (e.type === "image" && e.src) {
        var img = document.createElement("img");
        img.src = e.src; img.alt = ""; img.draggable = false;
        img.style.cssText = "width:100%;height:100%;object-fit:" + (e.fit || "cover") +
          ";object-position:" + (e.posX || 50) + "% " + (e.posY || 50) + "%" +
          (e.radius ? ";border-radius:" + e.radius + "px" : "");
        node.appendChild(img);
      } else {
        node.textContent = e.text || "";
      }
      overlayTarget.appendChild(node);
    });
  }

  function ensureVehExtras(idx) {
    if (!visitedVehicleExtras[idx]) visitedVehicleExtras[idx] = {};
    return visitedVehicleExtras[idx];
  }

  function vehExtraSteps(el) {
    var steps = [];
    if (el.querySelector("#btn-fun")) {
      steps.push({
        key: "fun", btnSel: "#btn-fun", ovSel: "#fun-ov",
        revealSel: ".fun-fact-tag, .fun-fact-bar, .fun-fact-body"
      });
    }
    if (el.querySelector("#btn-press")) {
      steps.push({
        key: "press", btnSel: "#btn-press", ovSel: "#press-ov",
        revealSel: ".ov-eyebrow, .ov-h2, .newspaper"
      });
    }
    if (el.querySelector("#btn-vs")) {
      steps.push({
        key: "vs", btnSel: "#btn-vs", ovSel: "#vs-ov",
        revealSel: ".ov-eyebrow, .ov-h2, .vs-side, .h2h-row"
      });
    }
    return steps;
  }

  function markVehExtraVisited(el, key) {
    ensureVehExtras(current)[key] = true;
    var step = vehExtraSteps(el).filter(function (st) { return st.key === key; })[0];
    if (step) {
      var btn = el.querySelector(step.btnSel);
      if (btn) btn.classList.add("veh-btn-visited");
    }
  }

  function openVehExtra(el, step, dots) {
    markVehExtraVisited(el, step.key);
    if (dots) dots.forEach(function (d) { d.classList.remove("open"); });
    el.querySelectorAll(".veh-overlay.open").forEach(function (ov) { ov.classList.remove("open"); });
    var ov = el.querySelector(step.ovSel);
    if (!ov) return;
    ov.classList.add("open");
    applyRevealNodes(ov.querySelectorAll(step.revealSel));
  }

  function vehExtrasStatus(sl) {
    if (!sl) return { total: 0, visited: 0, remaining: 0 };
    var steps = vehExtraSteps(sl);
    var ex = visitedVehicleExtras[current] || {};
    var visited = steps.filter(function (st) { return ex[st.key]; }).length;
    return { total: steps.length, visited: visited, remaining: steps.length - visited };
  }

  function wireVehicle(el) {
    var s = slides[current];
    if (s && s.data) applyVehicleAuthorOverrides(el, "vehicle-" + s.data.image);

    // stat countup animation
    var statVals = el.querySelectorAll(".stat .v");
    statVals.forEach(function (vEl) {
      var parts = parseStatForCountup(vEl.textContent);
      if (!parts || parts.num === 0) return;
      var duration = 900;
      var start = null;
      vEl.textContent = formatStatCount(parts, 0);
      function frame(ts) {
        if (!start) start = ts;
        var prog = Math.min((ts - start) / duration, 1);
        var ease = 1 - Math.pow(1 - prog, 3);
        vEl.textContent = formatStatCount(parts, parts.num * ease);
        if (prog < 1) requestAnimationFrame(frame);
        else { vEl.textContent = parts.raw; vEl.style.animation = "stat-countup-pulse .25s ease"; }
      }
      requestAnimationFrame(frame);
    });

    // hotspot dots
    var dots = Array.prototype.slice.call(el.querySelectorAll(".hs-dot"));
    var dotCount = dots.length;
    if (!visitedHotspots[current]) visitedHotspots[current] = {};
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function (e) {
        e.stopPropagation();
        visitedHotspots[current][idx] = true;
        dot.classList.add("hs-visited");
        var open = dot.classList.contains("open");
        dots.forEach(function (d) { d.classList.remove("open"); });
        if (!open) dot.classList.add("open");
      });
    });
    el.addEventListener("click", function () {
      dots.forEach(function (d) { d.classList.remove("open"); });
    });

    /* force sequential: Next opens hotspots, then Fun Fact → Press → vs Rivals */
    if (!s.van) {
      var extraSteps = vehExtraSteps(el);
      el._vehAdvance = function () {
        for (var i = 0; i < dots.length; i++) {
          if (!visitedHotspots[current][i]) {
            el.querySelectorAll(".veh-overlay.open").forEach(function (ov) { ov.classList.remove("open"); });
            dots.forEach(function (d) { d.classList.remove("open"); });
            visitedHotspots[current][i] = true;
            dots[i].classList.add("open", "hs-visited");
            return true;
          }
        }
        var ex = ensureVehExtras(current);
        for (var j = 0; j < extraSteps.length; j++) {
          if (!ex[extraSteps[j].key]) {
            openVehExtra(el, extraSteps[j], dots);
            return true;
          }
        }
        return false;
      };
    }
    // fun fact overlay
    var btnFun = el.querySelector("#btn-fun");
    var funOv  = el.querySelector("#fun-ov");
    if (btnFun && funOv) {
      btnFun.addEventListener("click", function (e) {
        e.stopPropagation();
        markVehExtraVisited(el, "fun");
        el.querySelectorAll(".veh-overlay.open").forEach(function (ov) { ov.classList.remove("open"); });
        funOv.classList.add("open");
        applyRevealNodes(funOv.querySelectorAll(".fun-fact-tag, .fun-fact-bar, .fun-fact-body"));
      });
      el.querySelector("#ov-close-fun").addEventListener("click", function (e) { e.stopPropagation(); funOv.classList.remove("open"); });
    }
    // press overlay
    var btnPress = el.querySelector("#btn-press");
    var pressOv  = el.querySelector("#press-ov");
    if (btnPress && pressOv) {
      btnPress.addEventListener("click", function (e) {
        e.stopPropagation();
        markVehExtraVisited(el, "press");
        el.querySelectorAll(".veh-overlay.open").forEach(function (ov) { ov.classList.remove("open"); });
        pressOv.classList.add("open");
        applyRevealNodes(pressOv.querySelectorAll(".ov-eyebrow, .ov-h2, .newspaper"));
      });
      el.querySelector("#ov-close-press").addEventListener("click", function (e) { e.stopPropagation(); pressOv.classList.remove("open"); });
    }
    // vs overlay
    var btnVs = el.querySelector("#btn-vs");
    var vsOv  = el.querySelector("#vs-ov");
    if (btnVs && vsOv) {
      btnVs.addEventListener("click", function (e) {
        e.stopPropagation();
        markVehExtraVisited(el, "vs");
        el.querySelectorAll(".veh-overlay.open").forEach(function (ov) { ov.classList.remove("open"); });
        vsOv.classList.add("open");
        applyRevealNodes(vsOv.querySelectorAll(".ov-eyebrow, .ov-h2, .vs-side, .h2h-row"));
      });
      el.querySelector("#ov-close-vs").addEventListener("click", function (e) { e.stopPropagation(); vsOv.classList.remove("open"); });
    }

    if (!s.van) {
      var exDone = ensureVehExtras(current);
      vehExtraSteps(el).forEach(function (step) {
        if (exDone[step.key]) {
          var b = el.querySelector(step.btnSel);
          if (b) b.classList.add("veh-btn-visited");
        }
      });
    }
  }

  /* ---- responsive scaling ---- */
  function scaleStage() {
    var wrap = document.getElementById("stage-wrap");
    var k = Math.min(wrap.clientWidth / 960, wrap.clientHeight / 540);
    stage.style.transform = "scale(" + k + ")";
  }
  window.addEventListener("resize", scaleStage);

  /* ---- progress guard ---- */
  function showToast(msg, ms) {
    var t = document.getElementById('progress-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'progress-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, ms || 3500);
  }

  function checkProgressBlocked() {
    var s = slides[current];
    if (s.type === 'timeline') {
      var visited = visitedTlTiles[current] ? Object.keys(visitedTlTiles[current]).length : 0;
      if (visited < tlTileCount) {
        var remaining = tlTileCount - visited;
        showToast('Explore ' + remaining + ' more timeline ' + (remaining === 1 ? 'entry' : 'entries') + ' before continuing — or tap Next again to skip.');
        if (!s._warnedOnce) { s._warnedOnce = true; return true; }
      }
    }
    if (s.type === 'vehicle' && !s.van) {
      var sl = stage.firstChild;
      var dotCount = sl ? sl.querySelectorAll('.hs-dot').length : 0;
      var hsVisited = visitedHotspots[current] ? Object.keys(visitedHotspots[current]).length : 0;
      if (dotCount > 0 && hsVisited < dotCount) {
        var hsRemaining = dotCount - hsVisited;
        showToast('Tap ' + hsRemaining + ' more hotspot' + (hsRemaining === 1 ? '' : 's') + ' to explore this slide — or tap Next again to skip.');
        if (!s._warnedOnce) { s._warnedOnce = true; return true; }
      } else {
        var exStat = vehExtrasStatus(sl);
        if (exStat.remaining > 0) {
          showToast('Open ' + exStat.remaining + ' more section' + (exStat.remaining === 1 ? '' : 's') +
            ' (Fun Fact, Press Quotes, vs Rivals) — or tap Next again to skip.');
          if (!s._extrasWarnedOnce) { s._extrasWarnedOnce = true; return true; }
        }
      }
    }
    return false;
  }

  /* ---- course progress menu ---- */
  (function () {
    var historyIdx = slides.findIndex(function (s) { return s.type === "timeline"; });
    var quizIntroIdx = slides.findIndex(function (s) { return s.type === "quiz-intro"; });
    var carSlides = slides.filter(function (s) { return s.type === "vehicle" && !s.van; });
    var vanSlides = slides.filter(function (s) { return s.type === "vehicle" && s.van; });
    vehicleSlideIndices = slides.reduce(function (acc, s, i) {
      if (s.type === "vehicle") acc.push(i); return acc;
    }, []);

    function itemHTML(label, idx, extraClass) {
      return '<div class="cp-item' + (extraClass ? " " + extraClass : "") + '" data-si="' + idx + '" tabindex="0" role="button" aria-label="Go to ' + esc(label) + '">' +
        '<span class="cp-check"></span>' +
        '<span class="cp-name">' + esc(label) + '</span>' +
      '</div>';
    }

    function vehicleItemHTML(s, idx) {
      return itemHTML(s.data.name, idx);
    }

    var panel = document.createElement("div");
    panel.id = "veh-progress-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Course menu");
    panel.innerHTML =
      '<div class="cp-header">' +
        '<div class="cp-title">Course Menu</div>' +
        '<div class="cp-sub">Jump to any section · visit all models to unlock the quiz</div>' +
      '</div>' +
      (historyIdx >= 0 ? '<div class="cp-section-head">History</div>' +
        itemHTML("Vauxhall History", historyIdx, "cp-history-item") : '') +
      (carSlides.length ? '<div class="cp-section-head">Cars</div>' +
        carSlides.map(function (s) { return vehicleItemHTML(s, slides.indexOf(s)); }).join('') : '') +
      (vanSlides.length ? '<div class="cp-section-head">Vans</div>' +
        vanSlides.map(function (s) { return vehicleItemHTML(s, slides.indexOf(s)); }).join('') : '') +
      (quizIntroIdx >= 0 ? '<div class="cp-section-head">Quiz</div>' +
        '<div class="cp-item cp-item-locked" id="cp-quiz-nav" tabindex="-1" role="button" aria-disabled="true">' +
          '<span class="cp-check"></span>' +
          '<span class="cp-name">Quiz</span>' +
          '<span class="cp-lock" aria-hidden="true">&#128274;</span>' +
        '</div>' : '') +
      '<div class="cp-footer">' +
        '<div class="cp-progress-bar"><div class="cp-progress-fill" id="cp-fill"></div></div>' +
        '<div class="cp-quiz-row" id="cp-quiz-row">' +
          '<span class="cp-quiz-icon">&#128274;</span>' +
          '<div class="cp-quiz-info"><strong>Quiz locked</strong><span>Visit all models to unlock</span></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(panel);

    panel.querySelectorAll(".cp-item[data-si]").forEach(function (item) {
      item.addEventListener("click", function () {
        panel.classList.remove("open");
        go(parseInt(item.getAttribute("data-si"), 10));
      });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); item.click(); }
      });
    });

    var btn = document.getElementById("veh-progress-btn");
    if (btn) {
      btn.addEventListener("click", function () { panel.classList.toggle("open"); });
    }
    document.addEventListener("click", function (e) {
      if (!panel.contains(e.target) && btn && !btn.contains(e.target)) {
        panel.classList.remove("open");
      }
    });
  })();

  function updateProgressMenu(activeIdx) {
    var panel = document.getElementById("veh-progress-panel");
    if (!panel) return;
    var total = vehicleSlideIndices.length;
    var visited = Object.keys(visitedVehicles).length;
    var historyIdx = slides.findIndex(function (s) { return s.type === "timeline"; });
    var quizIntroIdx = slides.findIndex(function (s) { return s.type === "quiz-intro"; });
    var historyVisited = historyIdx >= 0 && maxReached >= historyIdx;

    panel.querySelectorAll(".cp-item[data-si]").forEach(function (item) {
      var si = parseInt(item.getAttribute("data-si"), 10);
      var isVehicle = vehicleSlideIndices.indexOf(si) >= 0;
      var isHistory = si === historyIdx;
      item.classList.toggle("visited", isVehicle ? !!visitedVehicles[si] : isHistory && historyVisited);
      item.classList.toggle("active-now", si === activeIdx);
    });

    var fill = document.getElementById("cp-fill");
    if (fill) {
      fill.style.width = Math.round((visited / total) * 100) + "%";
      fill.classList.toggle("done", visited === total);
    }

    var qNav = document.getElementById("cp-quiz-nav");
    if (qNav && quizIntroIdx >= 0) {
      var allDone = visited === total;
      qNav.classList.toggle("cp-item-locked", !allDone);
      qNav.classList.toggle("visited", allDone);
      qNav.classList.toggle("active-now", activeIdx === quizIntroIdx || (slides[activeIdx] && (slides[activeIdx].type === "quiz" || slides[activeIdx].type === "results")));
      if (allDone) {
        qNav.setAttribute("data-si", String(quizIntroIdx));
        qNav.setAttribute("tabindex", "0");
        qNav.setAttribute("aria-disabled", "false");
        qNav.onclick = function () {
          panel.classList.remove("open");
          go(quizIntroIdx);
        };
        qNav.onkeydown = function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); qNav.click(); }
        };
      } else {
        qNav.removeAttribute("data-si");
        qNav.setAttribute("tabindex", "-1");
        qNav.setAttribute("aria-disabled", "true");
        qNav.onclick = null;
        qNav.onkeydown = null;
      }
    }

    var qRow = document.getElementById("cp-quiz-row");
    if (qRow) {
      var allDone = visited === total;
      qRow.classList.toggle("unlocked", allDone);
      qRow.innerHTML = allDone
        ? '<span class="cp-quiz-icon">&#9989;</span><div class="cp-quiz-info"><strong>Quiz unlocked</strong><span>Tap Quiz above to start</span></div>'
        : '<span class="cp-quiz-icon">&#128274;</span><div class="cp-quiz-info"><strong>Quiz locked</strong><span>' + visited + ' / ' + total + ' models visited</span></div>';
    }

    var btn = document.getElementById("veh-progress-btn");
    if (btn) {
      var countEl = btn.querySelector(".cp-count");
      if (countEl) {
        countEl.textContent = visited + "/" + total;
        countEl.classList.toggle("done", visited === total);
      }
    }
  }

  /* ---- wire footer ---- */
  elPrev.addEventListener("click", function () {
    var sec = stage.firstChild;
    if (sec && typeof sec._tlRetreat === "function" && sec._tlRetreat()) return;
    go(current - 1);
  });
  elNext.addEventListener("click", function () {
    var sec = stage.firstChild;
    if (sec && typeof sec._tlAdvance  === "function" && sec._tlAdvance())  return;
    if (sec && typeof sec._vehAdvance === "function" && sec._vehAdvance()) return;
    if (checkProgressBlocked()) return;
    go(current + 1);
  });
  elFinish.addEventListener("click", function () {
    window.VXSCORM.setStatus("completed");
    window.VXSCORM.commit();
    var pill = document.getElementById("completion-status");
    if (pill) { pill.className = "status-pill done"; pill.textContent = "Status: Completed ✓"; }
    elFinish.textContent = "Completed ✓";
    elFinish.disabled = true;
  });
  document.addEventListener("keydown", function (e) {
    var sec = stage.firstChild;
    if (e.key === "ArrowRight" && !elNext.disabled && !elNext.classList.contains("hidden")) {
      if (sec && typeof sec._tlAdvance === "function" && sec._tlAdvance()) return;
      if (sec && typeof sec._vehAdvance === "function" && sec._vehAdvance()) return;
      if (checkProgressBlocked()) return;
      go(current + 1);
    }
    if (e.key === "ArrowLeft" && !elPrev.disabled) {
      if (sec && typeof sec._tlRetreat === "function" && sec._tlRetreat()) return;
      go(current - 1);
    }
  });

  /* ---- start gate — apply author text overrides ---- */
  (function () {
    var gate = document.getElementById("start-gate");
    if (!gate) return;
    var sc = readAuthorScene("startgate");
    if (sc && sc.over) {
      Object.keys(sc.over).forEach(function (slot) {
        var el = gate.querySelector('[data-slot="' + slot + '"]');
        if (el && sc.over[slot] != null) el.textContent = sc.over[slot];
      });
    }
  })();

  document.getElementById("btn-start").addEventListener("click", function () {
    document.getElementById("start-gate").classList.add("hidden");
    window.VXSCORM.init();
    var resume = window.VXSCORM.getLocation();
    scaleStage();
    go(resume > 0 && resume < slides.length ? resume : 0);
  });

  window.addEventListener("beforeunload", function () { window.VXSCORM.finish(); });

  // initial scale for gate
  scaleStage();
})();
