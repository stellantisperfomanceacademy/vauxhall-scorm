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

  /* ---- build flat slide list ---- */
  var slides = [];
  function add(s) { slides.push(s); }

  add({ type: "cover", section: "Welcome" });
  add({ type: "objectives", section: "Welcome" });
  add({ type: "divider", section: "History", num: "01", title: "Vauxhall History", quote: "From a smithy to Britain's favourite brand. Quite a journey." });
  add({ type: "timeline", section: "History" });
  add({ type: "divider", section: "Cars", num: "02", title: "The 2026 Range: Cars", quote: "Let's meet the cars. Everything you need to know about each model, in plain English." });
  C.cars.forEach(function (v) { add({ type: "vehicle", section: "Cars", data: v }); });
  add({ type: "divider", section: "Vans", num: "03", title: "The 2026 Range: Vans", quote: "Our van range is a cornerstone of British business, and it's going electric too." });
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

  function heroHTML(name, id, hotspots) {
    var spots = "";
    if (hotspots && hotspots.length) {
      spots = '<div class="hs-layer">' +
        hotspots.map(function (h, i) {
          var flip = h.y < 46 ? " hs-flip" : "";
          var tipBody = h.facts && h.facts.length
            ? '<ul class="hs-facts">' + h.facts.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>"
            : "<p>" + esc(h.detail || "") + "</p>";
          return '<button class="hs-dot' + flip + '" style="left:' + h.x + '%;top:' + h.y + '%" data-hs="' + i + '">' +
            '<span class="hs-num">' + (i + 1) + "</span>" +
            '<span class="hs-ring"></span>' +
            '<div class="hs-tip"><strong>' + esc(h.label) + '</strong>' + tipBody + '</div>' +
            '</button>';
        }).join("") + '</div>';
    }
    return (
      '<div class="hero">' +
      '<img src="images/' + id + '.jpg" alt="' + esc(name) + '" ' +
      "onerror=\"this.style.display='none';this.nextElementSibling.style.display='flex';\">" +
      '<div class="vx-img" style="display:none"><span class="lbl">[ image ]<br>' + esc(name) + ' — drop photo here:<br>images/' + id + '.jpg</span></div>' +
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
          '<div class="eyebrow">eLearning · Retailer Module</div>' +
          '<h1 class="title">' + esc(C.meta.title) + "</h1>" +
          '<div class="blurb"><strong>' + esc(C.meta.subtitle) + "</strong><br>" + esc(C.meta.blurb) + "</div>" +
          '<div class="chips">' + C.meta.chips.map(function (c, i) {
            return '<span class="chip' + (i === 1 ? " red" : "") + '">' + esc(c) + "</span>";
          }).join("") + "</div>" + chrome(s, idx) + "</section>";

      case "objectives":
        inner = '<div class="eyebrow">Learning Objectives</div>' +
          '<h2 class="title">By the end of this module…</h2>' +
          '<div class="obj-list">' + C.objectives.map(function (o, i) {
            return '<div class="obj-item"><span class="n">0' + (i + 1) + '</span><span class="t">' + esc(o) + "</span></div>";
          }).join("") + "</div>";
        return '<section class="slide dark active">' + inner + chrome(s, idx) + "</section>";

      case "divider":
        return '<section class="slide ink divider active">' +
          '<div class="eyebrow">Section ' + esc(s.num) + "</div>" +
          '<div class="bignum">' + esc(s.num) + "</div>" +
          '<h1 class="title">' + esc(s.title) + "</h1>" +
          '<div class="quote">"' + esc(s.quote) + '"</div>' + chrome(s, idx) + "</section>";

      case "timeline":
        inner = '<div class="tl-header"><div class="eyebrow">The Timeline</div>' +
          '<h2 class="title">Click a year to explore</h2></div>' +
          '<div class="tl-grid">' +
          C.timeline.map(function (t, i) {
            return '<button class="tl-tile" data-tl="' + i + '" ' +
              'style="background-image:url(assets/timeline/' + esc(t.year) + '.jpg)">' +
              '<div class="tl-tile-yr">' + esc(t.year) + '</div>' +
              (t.title ? '<div class="tl-tile-tag">' + esc(t.title) + '</div>' : '') +
              '</button>';
          }).join("") + '</div>' +
          '<div class="tl-detail" id="tl-detail">' +
          '<div class="tl-det-bg" id="tl-det-bg"></div>' +
          '<button class="tl-det-close" id="tl-det-close">&#10005; Close</button>' +
          '<div class="tl-det-body">' +
          '<div class="tl-det-eyebrow" id="tl-det-eyebrow"></div>' +
          '<div class="tl-det-year" id="tl-det-year"></div>' +
          '<div class="tl-det-text" id="tl-det-text"></div>' +
          '<div class="tl-det-fact" id="tl-det-fact"></div>' +
          '<div class="tl-det-nav">' +
          '<button class="tl-det-btn" id="tl-det-prev">&#8592; Prev</button>' +
          '<button class="tl-det-btn" id="tl-det-next">Next &#8594;</button>' +
          '</div></div></div>' +
          '<div class="tl-detail-im" id="tl-detail-im"></div>';
        return '<section class="slide tl-new-slide active">' + inner + chrome(s, idx) + '</section>';

      case "vehicle":
        if (s.van) {
          // Van layout: compact with key facts + press
          inner = '<div class="veh-head"><div>' +
            '<div class="eyebrow">Van · ' + esc(d.tagline) + '</div>' +
            '<h2 class="title">' + esc(d.name) + '</h2></div></div>' +
            heroHTML(d.name, d.image, null) +
            statsHTML(d.stats) +
            '<div class="cols"><div class="block"><h4>Key Facts</h4><ul class="facts">' +
            d.keyFacts.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
            (d.funFact ? '<div class="funbox"><b>Fun fact:</b> ' + esc(d.funFact) + "</div>" : "") +
            '</div><div class="block"><h4>What the press say</h4>' +
            '<div class="press' + (d.press.length === 1 ? " one" : "") + '">' +
            d.press.map(function (p) {
              return '<div class="quote"><div class="q">"' + esc(p.quote) + '"</div><div class="s">' + esc(p.src) + "</div></div>";
            }).join("") + "</div></div></div>";
          return '<section class="slide active"><div class="scroll">' + inner + "</div>" + chrome(s, idx) + "</section>";
        }
        // Car layout: taller hero with hotspots, press newsstand, VS overlays
        var h2hRows = (d.headToHead && d.headToHead.length)
          ? '<div class="h2h"><div class="h2h-head"><span>Vauxhall</span><span class="h2h-vs">vs</span><span>Rival</span></div>' +
            d.headToHead.map(function (h) {
              return '<div class="h2h-row"><div class="h2h-label">' + esc(h.label) + '</div>' +
                '<div class="h2h-vx">' + esc(h.vauxhall) + '</div>' +
                '<div class="h2h-rv">' + esc(h.rival) + '</div></div>';
            }).join("") + "</div>" : "";
        var pressOv = '<div class="veh-overlay press-ov" id="press-ov">' +
          '<button class="ov-close" id="ov-close-press">&#10005;</button>' +
          '<div class="ov-eyebrow"><span class="eyebrow">Press Coverage</span><h2 class="ov-h2">What the press say</h2></div>' +
          '<div class="newsstand">' +
          d.press.map(function (p) {
            return '<div class="newspaper"><div class="paper-flag">' + esc(p.src) + '</div>' +
              '<div class="paper-body">&ldquo;' + esc(p.quote) + '&rdquo;</div></div>';
          }).join("") + "</div></div>";
        var vsOv = d.headToHead && d.headToHead.length
          ? '<div class="veh-overlay vs-ov" id="vs-ov">' +
            '<button class="ov-close" id="ov-close-vs">&#10005;</button>' +
            '<div class="ov-eyebrow"><span class="eyebrow">Head to Head</span><h2 class="ov-h2">Vauxhall vs Rivals</h2></div>' +
            '<div class="vs-arena">' +
            '<div class="vs-side">' +
            '<div class="vs-img-wrap"><img src="assets/vs/' + esc(d.image) + '.png" ' +
            'onerror="this.parentNode.classList.add(\'vs-ph\')"></div>' +
            '<div class="vs-car-label">Vauxhall ' + esc(d.name) + '</div></div>' +
            '<div class="vs-mid">' + h2hRows + '</div>' +
            '<div class="vs-side vs-side-r">' +
            '<div class="vs-img-wrap vs-rival-wrap"><img src="assets/vs/' + esc(d.image) + '-rival.png" ' +
            'onerror="this.parentNode.classList.add(\'vs-ph\')"></div>' +
            '<div class="vs-car-label vs-rival-label">Rival</div></div>' +
            "</div></div>" : "";
        inner = '<div class="veh-head"><div>' +
          '<div class="eyebrow">Car · ' + esc(d.tagline) + '</div>' +
          '<h2 class="title">' + esc(d.name) + '</h2></div></div>' +
          (d.pitch ? '<p class="pitch-sm">' + esc(d.pitch) + '</p>' : '') +
          heroHTML(d.name, d.image, d.hotspots) +
          statsHTML(d.stats) +
          '<div class="veh-actions">' +
          '<div class="veh-btns">' +
          (d.funFact ? '<button class="veh-btn btn-fun" id="btn-fun">&#9733; Fun Fact</button>' : '') +
          '<button class="veh-btn btn-press" id="btn-press">&#128240; Press Quotes</button>' +
          (d.headToHead && d.headToHead.length ? '<button class="veh-btn btn-vs" id="btn-vs">&#9889; vs Rivals</button>' : '') +
          '</div></div>' +
          (d.funFact
            ? '<div class="veh-overlay fun-ov card-popup" id="fun-ov">' +
              '<button class="ov-close" id="ov-close-fun">&#10005;</button>' +
              '<div class="card-popup-head"><span class="eyebrow">Did you know?</span></div>' +
              '<div class="card-popup-body"><p>' + esc(d.funFact) + '</p></div></div>'
            : '') +
          pressOv + vsOv;
        return '<section class="slide veh-car-slide active">' + inner + chrome(s, idx) + '</section>';

      case "retired":
        inner = '<div class="veh-head"><div>' +
          '<span class="retired-pill">' + esc(d.retired) + "</span>" +
          '<h2 class="title" style="margin-top:10px">' + esc(d.name) + "</h2></div></div>" +
          '<div class="notice"><span class="warn">Important</span><span>' + esc(d.notice) + "</span></div>" +
          '<div class="cols"><div class="block"><h4>Final Specs (for reference)</h4><ul class="facts">' +
          d.specs.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></div>" +
          '<div class="block"><h4>Why was it retired?</h4><p style="font-size:13px">' + esc(d.why) + "</p>" +
          '<div class="funbox"><b>Fun fact:</b> ' + esc(d.funFact) + "</div></div></div>";
        return '<section class="slide active"><div class="scroll">' + inner + "</div>" + chrome(s, idx) + "</section>";

      case "comparison":
        inner = '<div class="eyebrow">Cheat Sheet</div><h2 class="title">The range at a glance</h2>' +
          '<div class="scroll" style="margin-top:14px"><table class="cmp"><thead><tr>' +
          C.comparison.headers.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
          C.comparison.rows.map(function (r) {
            return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>";
          }).join("") + "</tbody></table><div class=\"cmp-note\">" + esc(C.comparison.note) + "</div></div>";
        return '<section class="slide active">' + inner + chrome(s, idx) + "</section>";

      case "quiz-intro":
        return '<section class="slide ink divider active">' +
          '<div class="eyebrow">Section 06</div><div class="bignum">?</div>' +
          '<h1 class="title">Quiz Time</h1>' +
          '<div class="quote">' + C.quiz.length + " questions. Score " + Math.round(C.meta.passMark * 100) +
          "% or more to pass and complete the module. Good luck.</div>" + chrome(s, idx) + "</section>";

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
    var pct = Math.round((correct / total) * 100);
    var passed = correct / total >= C.meta.passMark;
    sectionEl.innerHTML =
      '<div class="eyebrow">Results</div>' +
      '<div class="ring ' + (passed ? "pass" : "") + '"><div class="pct">' + pct + '%</div><div class="pts">' + correct + " / " + total + " POINTS</div></div>" +
      '<div class="verdict">' + (passed ? "Congratulations, you passed!" : "Not quite — give it another go.") + "</div>" +
      '<div class="vsub">' + (passed
        ? "You've shown a strong grasp of the Vauxhall range. Continue to finish and record your completion."
        : "You need " + Math.ceil(C.meta.passMark * total) + " correct to pass. Review the modules and retake the quiz.") + "</div>" +
      '<div style="margin-top:22px;display:flex;gap:12px">' +
      (passed
        ? '<button class="btn btn-success" id="results-continue">Continue →</button>'
        : '<button class="btn btn-outline" id="results-retry">↻ Retake quiz</button>') +
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
    }
  }

  /* ---- navigation ---- */
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
    if (s.type === "vehicle") wireVehicle(sectionEl);

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

  /* ---- timeline wiring (grid + fullscreen detail) ---- */
  function wireTimeline(el) {
    var detail   = el.querySelector("#tl-detail");
    var imDetail = el.querySelector("#tl-detail-im");
    var bg       = el.querySelector("#tl-det-bg");
    var eyebrowEl = el.querySelector("#tl-det-eyebrow");
    var yearEl   = el.querySelector("#tl-det-year");
    var textEl   = el.querySelector("#tl-det-text");
    var factEl   = el.querySelector("#tl-det-fact");
    var closeB   = el.querySelector("#tl-det-close");
    var prevB    = el.querySelector("#tl-det-prev");
    var nextB    = el.querySelector("#tl-det-next");
    var activeTl = 0;

    function buildImmersive(t, i) {
      var bullets = (t.bullets || [t.text]).concat(
        t.fact ? ['<strong>Fun fact:</strong> ' + esc(t.fact)] : []
      );
      return (
        '<div class="tl-im-bg" style="background-image:url(' + esc(t.bg) + ')"></div>' +
        (t.assets || []).map(function (a) {
          return '<img class="tl-im-asset ' + esc(a.cls) + ' tl-im-anim-' + esc(a.anim) + '" src="' + esc(a.src) + '" alt="">';
        }).join('') +
        '<div class="tl-im-label">' +
          '<div class="tl-im-label-year">' + esc(t.year) + '</div>' +
          (t.title ? '<div class="tl-im-label-title">' + esc(t.title) + '</div>' : '') +
        '</div>' +
        '<div class="tl-im-panel">' +
          '<ul class="tl-im-bullets">' +
          bullets.map(function (b) { return '<li>' + b + '</li>'; }).join('') +
          '</ul>' +
        '</div>' +
        '<button class="tl-det-close tl-im-close-btn">&#10005; Close</button>' +
        '<div class="tl-im-nav">' +
          '<button class="tl-det-btn tl-im-prev"' + (i === 0 ? ' disabled' : '') + '>&#8592; Prev</button>' +
          '<button class="tl-det-btn tl-im-next"' + (i === C.timeline.length - 1 ? ' disabled' : '') + '>Next &#8594;</button>' +
        '</div>'
      );
    }

    function closeImmersive() {
      imDetail.classList.remove("open");
      imDetail.innerHTML = "";
    }

    function showEntry(i) {
      var t = C.timeline[i];
      activeTl = i;

      if (t.layout === "immersive") {
        detail.classList.remove("open");
        imDetail.innerHTML = buildImmersive(t, i);
        imDetail.classList.add("open");
        imDetail.querySelector(".tl-im-close-btn").addEventListener("click", closeImmersive);
        var imPrev = imDetail.querySelector(".tl-im-prev");
        var imNext = imDetail.querySelector(".tl-im-next");
        imPrev.addEventListener("click", function () { if (activeTl > 0) showEntry(activeTl - 1); });
        imNext.addEventListener("click", function () { if (activeTl < C.timeline.length - 1) showEntry(activeTl + 1); });
        return;
      }

      closeImmersive();
      bg.style.backgroundImage = "url(assets/timeline/" + t.year + ".jpg)";
      if (eyebrowEl) {
        eyebrowEl.textContent = t.eyebrow || "";
        eyebrowEl.style.display = t.eyebrow ? "block" : "none";
      }
      yearEl.textContent = t.title ? t.title : t.year;
      if (t.title) yearEl.setAttribute("data-year", t.year);
      else yearEl.removeAttribute("data-year");
      textEl.textContent = t.text;
      if (t.fact) {
        factEl.innerHTML = "<b>Fun fact:</b> " + esc(t.fact);
        factEl.style.display = "block";
      } else {
        factEl.textContent = "";
        factEl.style.display = "none";
      }
      prevB.disabled = i === 0;
      nextB.disabled = i === C.timeline.length - 1;
      detail.classList.add("open");
    }

    el.querySelectorAll(".tl-tile").forEach(function (tile) {
      tile.addEventListener("click", function () {
        showEntry(parseInt(tile.getAttribute("data-tl"), 10));
      });
    });
    closeB.addEventListener("click", function () { detail.classList.remove("open"); });
    prevB.addEventListener("click", function () { if (activeTl > 0) showEntry(activeTl - 1); });
    nextB.addEventListener("click", function () { if (activeTl < C.timeline.length - 1) showEntry(activeTl + 1); });
  }

  /* ---- vehicle wiring (hotspots + overlays) ---- */
  function wireVehicle(el) {
    // hotspot dots
    var dots = el.querySelectorAll(".hs-dot");
    dots.forEach(function (dot) {
      dot.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = dot.classList.contains("open");
        dots.forEach(function (d) { d.classList.remove("open"); });
        if (!open) dot.classList.add("open");
      });
    });
    el.addEventListener("click", function () {
      dots.forEach(function (d) { d.classList.remove("open"); });
    });
    // fun fact overlay
    var btnFun = el.querySelector("#btn-fun");
    var funOv  = el.querySelector("#fun-ov");
    if (btnFun && funOv) {
      btnFun.addEventListener("click", function (e) { e.stopPropagation(); funOv.classList.add("open"); });
      el.querySelector("#ov-close-fun").addEventListener("click", function (e) { e.stopPropagation(); funOv.classList.remove("open"); });
    }
    // press overlay
    var btnPress = el.querySelector("#btn-press");
    var pressOv  = el.querySelector("#press-ov");
    if (btnPress && pressOv) {
      btnPress.addEventListener("click", function (e) { e.stopPropagation(); pressOv.classList.add("open"); });
      el.querySelector("#ov-close-press").addEventListener("click", function (e) { e.stopPropagation(); pressOv.classList.remove("open"); });
    }
    // vs overlay
    var btnVs = el.querySelector("#btn-vs");
    var vsOv  = el.querySelector("#vs-ov");
    if (btnVs && vsOv) {
      btnVs.addEventListener("click", function (e) { e.stopPropagation(); vsOv.classList.add("open"); });
      el.querySelector("#ov-close-vs").addEventListener("click", function (e) { e.stopPropagation(); vsOv.classList.remove("open"); });
    }
  }

  /* ---- responsive scaling ---- */
  function scaleStage() {
    var wrap = document.getElementById("stage-wrap");
    var k = Math.min(wrap.clientWidth / 960, wrap.clientHeight / 540);
    stage.style.transform = "scale(" + k + ")";
  }
  window.addEventListener("resize", scaleStage);

  /* ---- wire footer ---- */
  elPrev.addEventListener("click", function () { go(current - 1); });
  elNext.addEventListener("click", function () { go(current + 1); });
  elFinish.addEventListener("click", function () {
    window.VXSCORM.setStatus("completed");
    window.VXSCORM.commit();
    var pill = document.getElementById("completion-status");
    if (pill) { pill.className = "status-pill done"; pill.textContent = "Status: Completed ✓"; }
    elFinish.textContent = "Completed ✓";
    elFinish.disabled = true;
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" && !elNext.disabled && !elNext.classList.contains("hidden")) go(current + 1);
    if (e.key === "ArrowLeft" && !elPrev.disabled) go(current - 1);
  });

  /* ---- start gate ---- */
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
