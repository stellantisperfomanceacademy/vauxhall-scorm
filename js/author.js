(function () {
  "use strict";

  var STORAGE_KEY = "vauxhall-scene-author-v2";
  var CANVAS_W = 960;
  var CANVAS_H = 540;

  /* Premade Vauxhall palette */
  var VX_PALETTE = [
    { name: "Vauxhall Blue", hex: "#000037" },
    { name: "Blue Soft", hex: "#1A1A4D" },
    { name: "Blue Ink", hex: "#0A0A28" },
    { name: "Vauxhall Red", hex: "#EB001E" },
    { name: "Red Deep", hex: "#D7001C" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Grey", hex: "#E8E8E8" },
    { name: "Fog", hex: "#E8E8F0" },
    { name: "Fact Yellow", hex: "#FEF4A8" },
    { name: "Green", hex: "#1F8A5B" },
    { name: "Black", hex: "#101010" }
  ];

  var state = {
    scenes: {},
    assets: [],
    activeSceneId: null,
    selectedElementId: null,
    selectedPopupId: null,
    liveMode: false
  };

  var canvas = document.getElementById("canvas");
  var canvasScaler = document.getElementById("canvas-scaler");
  var slideRoot = document.getElementById("slide-root");
  var canvasPopup = document.getElementById("canvas-popup");
  var floatToolbar = document.getElementById("float-toolbar");
  var interaction = null;
  var nativeInteraction = null;
  var selectedNativeSlot = null;
  var viewScale = 1;
  var pickerTarget = null; // "scene" or "element"
  var draggedSinceDown = false;
  var saveStatusTimer = null;
  var formSyncing = false;
  var cropModeActive = false; // true = drag on selected image repositions (no Ctrl needed)

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function uid(p) { return p + "-" + Math.random().toString(36).slice(2, 8); }

  /* ---------------- scene helpers ---------------- */

  function getVehicleData(sc) {
    if (!sc || !sc.id || sc.id.indexOf("vehicle-") !== 0) return null;
    var img = sc.id.replace("vehicle-", "");
    var i;
    if (window.COURSE && window.COURSE.cars) {
      for (i = 0; i < window.COURSE.cars.length; i++) {
        if (window.COURSE.cars[i].image === img) return { kind: "car", data: window.COURSE.cars[i] };
      }
    }
    if (window.COURSE && window.COURSE.vans) {
      for (i = 0; i < window.COURSE.vans.length; i++) {
        if (window.COURSE.vans[i].image === img) return { kind: "van", data: window.COURSE.vans[i] };
      }
    }
    return null;
  }

  function sceneKind(sc) {
    if (!sc) return "custom";
    if (sc.kind) return sc.kind;
    if (sc.id.indexOf("vehicle-") === 0) {
      var v = getVehicleData(sc);
      return v ? v.kind : "custom";
    }
    if (sc.id.indexOf("timeline-") === 0) return "timeline";
    return "custom";
  }

  function slotText(sc, slot, def) {
    if (sc.over && sc.over[slot] != null) return sc.over[slot];
    return def;
  }

  /* ---------------- default scenes ---------------- */

  function defaultScenes() {
    var scenes = {};
    var C = window.COURSE || {};

    if (C.meta) {
      scenes["cover"] = {
        id: "cover", kind: "cover", label: "Home — Cover",
        background: "", bgColor: "#0A0A28", over: {}, elements: [], popups: []
      };
      scenes["objectives"] = {
        id: "objectives", kind: "objectives", label: "Home — Objectives",
        background: "", bgColor: "#000037", over: {}, elements: [], popups: []
      };
    }

    var dividers = [
      { id: "divider-history", num: "01", title: "Vauxhall History", quote: "From a smithy to Britain's favourite brand. Quite a journey." },
      { id: "divider-cars", num: "02", title: "The 2026 Range: Cars", quote: "Let's meet the cars. Everything you need to know about each model, in plain English." },
      { id: "divider-vans", num: "03", title: "The 2026 Range: Vans", quote: "Our van range is a cornerstone of British business, and it's going electric too." },
      { id: "divider-retired", num: "04", title: "Retired Models", quote: "Understanding what came before helps you explain the full Vauxhall story." }
    ];
    dividers.forEach(function (d) {
      scenes[d.id] = {
        id: d.id, kind: "divider", label: "Divider — " + d.title,
        num: d.num, title: d.title, quote: d.quote,
        background: "", bgColor: "#0A0A28", over: {}, elements: [], popups: []
      };
    });

    if (C.timeline) {
      C.timeline.forEach(function (t) {
        var id = "timeline-" + t.year;
        scenes[id] = {
          id: id, kind: "timeline",
          label: t.title ? t.year + " — " + t.title : t.year,
          background: "assets/timeline/" + t.year + ".svg",
          bgColor: "#0A0A28", over: {}, elements: [],
          popups: t.fact ? [{
            id: "popup-" + t.year, template: "info-panel",
            eyebrow: t.eyebrow || "", title: t.title || t.year,
            body: t.text || "", fact: t.fact || "", accent: "#EB001E"
          }] : []
        };
      });
    }

    if (C.cars) {
      C.cars.forEach(function (c) {
        var id = "vehicle-" + c.image;
        scenes[id] = {
          id: id, kind: "car", label: "Car — " + c.name,
          background: "images/" + c.image + ".jpg", bgColor: "#FFFFFF", over: {},
          elements: (c.hotspots || []).map(function (h, i) {
            return {
              id: "hs-" + c.image + "-" + i, type: "hotspot",
              x: h.x, y: h.y, w: 0, h: 0, z: 10 + i,
              text: h.label, facts: (h.facts || []).slice(),
              color: "#ffffff", bg: "#EB001E", fontSize: 13, bold: true, src: "", trigger: ""
            };
          }),
          popups: c.funFact ? [{
            id: "popup-fun-" + c.image, template: "card-popup",
            eyebrow: "Did you know?", title: c.name, body: c.funFact, fact: "", accent: "#EB001E"
          }] : []
        };
      });
    }

    if (C.vans) {
      C.vans.forEach(function (v) {
        var id = "vehicle-" + v.image;
        scenes[id] = {
          id: id, kind: "van", label: "Van — " + v.name,
          background: "images/" + v.image + ".jpg", bgColor: "#FFFFFF", over: {}, elements: [],
          popups: v.funFact ? [{
            id: "popup-fun-" + v.image, template: "card-popup",
            eyebrow: "Did you know?", title: v.name, body: v.funFact, fact: "", accent: "#EB001E"
          }] : []
        };
      });
    }

    return scenes;
  }

  function normaliseScene(sc) {
    if (!sc.over) sc.over = {};
    if (!sc.pos) sc.pos = {};
    if (!sc.elements) sc.elements = [];
    if (!sc.popups) sc.popups = [];
    if (sc.bgColor == null) sc.bgColor = "";
    sc.elements.forEach(function (el) {
      if (el.type === "pill") el.type = "hotspot";
      if (el.type === "hotspot" && !el.facts) el.facts = [];
      if (el.type === "image") {
        if (!el.fit) el.fit = "cover";
        if (el.posX == null) el.posX = 50;
        if (el.posY == null) el.posY = 50;
        if (el.radius == null) el.radius = 0;
        if (el.zoom == null) el.zoom = 1;
      }
    });
  }

  function mergeMissingScenes() {
    var defaults = defaultScenes();
    Object.keys(defaults).forEach(function (id) {
      if (!state.scenes[id]) state.scenes[id] = defaults[id];
    });
    Object.keys(state.scenes).forEach(function (id) { normaliseScene(state.scenes[id]); });
  }

  function loadState() {
    var loaded = false;
    [STORAGE_KEY, "vauxhall-scene-author-v1"].forEach(function (key) {
      if (loaded) return;
      try {
        var raw = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (!raw) return;
        var p = JSON.parse(raw);
        if (p && p.scenes) {
          state.scenes = p.scenes;
          state.assets = p.assets || [];
          state.activeSceneId = p.activeSceneId || Object.keys(p.scenes)[0];
          loaded = true;
        }
      } catch (e) { /* ignore */ }
    });
    if (!loaded) state.scenes = defaultScenes();
    mergeMissingScenes();
    if (!state.activeSceneId || !state.scenes[state.activeSceneId]) {
      state.activeSceneId = Object.keys(state.scenes)[0] || null;
    }
  }

  function flashSaveStatus(msg, isError) {
    var el = document.getElementById("save-status");
    if (!el) return;
    el.textContent = msg;
    el.className = isError ? "save-status err" : "save-status ok";
    clearTimeout(saveStatusTimer);
    saveStatusTimer = setTimeout(function () { el.textContent = ""; el.className = "save-status"; }, 2500);
  }

  function persist(quiet) {
    var payload = JSON.stringify({
      scenes: state.scenes, assets: state.assets, activeSceneId: state.activeSceneId
    });
    try {
      localStorage.setItem(STORAGE_KEY, payload);
      sessionStorage.setItem(STORAGE_KEY, payload);
      if (!quiet) flashSaveStatus("Saved");
      return true;
    } catch (e) {
      try {
        sessionStorage.setItem(STORAGE_KEY, payload);
        if (!quiet) flashSaveStatus("Saved (session only — storage limit reached)", true);
        return true;
      } catch (e2) {
        flashSaveStatus("Save failed — changes kept until you close this tab", true);
        return false;
      }
    }
  }

  function scene() { return state.activeSceneId ? state.scenes[state.activeSceneId] : null; }
  function elById(id) {
    var sc = scene();
    return sc ? sc.elements.find(function (e) { return e.id === id; }) : null;
  }

  /* ---------------- canvas fitting ---------------- */

  function fitCanvas() {
    var outer = document.getElementById("canvas-outer");
    if (!outer || !canvasScaler) return;
    viewScale = Math.min(outer.clientWidth / CANVAS_W, outer.clientHeight / CANVAS_H, 1);
    if (viewScale <= 0) viewScale = 0.5;
    canvasScaler.style.transform = "scale(" + viewScale + ")";
  }

  function containerForEl(el) {
    if (el.type === "hotspot") {
      var h = document.getElementById("hero-layer");
      if (h) return h;
    }
    return document.getElementById("overlay-layer") ||
           document.getElementById("hero-layer") || canvas;
  }

  /* ---------------- element nodes ---------------- */

  function applyElStyle(node, el) {
    node.style.left = el.x + "%";
    node.style.top = el.y + "%";
    node.style.zIndex = el.z || 1;
    if (el.type === "image") {
      node.style.width = el.w + "%";
      node.style.height = el.h + "%";
    } else {
      node.style.width = "auto";
      node.style.height = "auto";
    }
  }

  function handlesHTML() {
    return '<div class="resize-handles">' +
      '<div class="rh rh-nw" data-h="nw"></div><div class="rh rh-ne" data-h="ne"></div>' +
      '<div class="rh rh-sw" data-h="sw"></div><div class="rh rh-se" data-h="se"></div>' +
      '<div class="rh rh-n" data-h="n"></div><div class="rh rh-s" data-h="s"></div>' +
      '<div class="rh rh-w" data-h="w"></div><div class="rh rh-e" data-h="e"></div></div>';
  }

  function applyImageCrop(img, el) {
    if (!img || !el) return;
    img.style.objectFit = el.fit || "cover";
    var px = el.posX != null ? el.posX : 50;
    var py = el.posY != null ? el.posY : 50;
    img.style.objectPosition = px + "% " + py + "%";
    var zoom = el.zoom || 1;
    if (zoom > 1 && el.fit !== "fill") {
      img.style.transform = "scale(" + zoom + ")";
      img.style.transformOrigin = px + "% " + py + "%";
    } else {
      img.style.transform = "";
      img.style.transformOrigin = "";
    }
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function syncCropSliders(el) {
    var px = document.getElementById("el-posx");
    var py = document.getElementById("el-posy");
    var zm = document.getElementById("el-zoom");
    if (px) px.value = el.posX != null ? el.posX : 50;
    if (py) py.value = el.posY != null ? el.posY : 50;
    if (zm) zm.value = Math.round((el.zoom || 1) * 100);
  }

  function attachHandles(node, el) {
    var existing = node.querySelector(".resize-handles");
    if (existing) existing.remove();
    if (el.type !== "image") return;
    node.insertAdjacentHTML("beforeend", handlesHTML());
    node.querySelectorAll(".rh").forEach(function (h) {
      h.addEventListener("mousedown", startResize);
    });
  }

  function buildHotspotNode(el, index) {
    var node = document.createElement("button");
    node.type = "button";
    var sel = state.selectedElementId === el.id;
    node.className = "hs-dot auth-el type-hotspot" + (sel ? " selected" : "") +
      (el.y < 46 ? " hs-flip" : "") + (el.trigger ? " has-trigger" : "");
    node.dataset.id = el.id;
    node.style.left = el.x + "%";
    node.style.top = el.y + "%";
    node.style.zIndex = el.z || 10;
    var tip = "";
    var factsArr = el.facts && el.facts.length ? el.facts : [];
    var tipBody = factsArr.length
      ? '<ul class="hs-facts">' + factsArr.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>"
      : "";
    tip = '<div class="hs-tip"><strong>' + esc(el.text || "Hotspot") + "</strong>" + tipBody + "</div>";
    node.innerHTML = '<span class="hs-num">' + (index + 1) + '</span><span class="hs-ring"></span>' + tip;
    node.addEventListener("mousedown", startDrag);
    node.addEventListener("click", function (e) {
      if (state.liveMode) {
        e.stopPropagation();
        if (el.trigger) { openCanvasPopup(el.trigger); return; }
        node.classList.toggle("open");
      }
    });
    node.addEventListener("dblclick", function (e) {
      e.stopPropagation();
      if (state.liveMode) return;
      selectElement(el.id);
      document.getElementById("el-text").focus();
    });
    return node;
  }

  function buildNode(el) {
    var node = document.createElement("div");
    var sel = state.selectedElementId === el.id;
    node.className = "auth-el type-" + el.type + (sel ? " selected" : "") + (el.trigger ? " has-trigger" : "");
    node.dataset.id = el.id;
    applyElStyle(node, el);

    if (el.type === "text") {
      node.style.color = el.color || "#000037";
      node.style.fontSize = (el.fontSize || 16) + "px";
      node.style.fontWeight = el.bold ? "700" : "400";
      node.textContent = el.text || "Double-click to edit";
    } else if (el.type === "button") {
      node.style.background = el.bg || "#EB001E";
      node.style.color = el.color || "#fff";
      node.style.fontSize = (el.fontSize || 13) + "px";
      node.style.fontWeight = el.bold ? "700" : "600";
      node.textContent = el.text || "BUTTON";
    } else if (el.type === "image") {
      node.style.borderRadius = (el.radius || 0) + "px";
      if (el.shadow) node.classList.add("has-shadow");
      if (el.src) {
        var img = document.createElement("img");
        img.src = el.src;
        img.alt = "";
        img.draggable = false;
        applyImageCrop(img, el);
        img.onerror = function () { node.innerHTML = '<div class="ph">Missing image</div>'; };
        img.addEventListener("mousedown", function (e) {
          if (state.liveMode || !el.src || el.fit === "fill") return;
          if (!(e.ctrlKey || e.metaKey || cropModeActive)) return;
          e.stopPropagation();
          startCropDrag(e, el, node);
        });
        node.appendChild(img);
        node.addEventListener("wheel", function (e) {
          if (state.liveMode || state.selectedElementId !== el.id || !el.src || el.fit === "fill") return;
          e.preventDefault();
          e.stopPropagation();
          el.zoom = clamp((el.zoom || 1) + (e.deltaY > 0 ? -0.06 : 0.06), 1, 3);
          applyImageCrop(img, el);
          syncCropSliders(el);
          persist();
        }, { passive: false });
      } else {
        node.innerHTML = '<div class="ph">Click to choose<br>or upload an image</div>';
      }
    }

    if (sel) attachHandles(node, el);

    node.addEventListener("mousedown", startDrag);
    node.addEventListener("click", function (e) {
      if (state.liveMode) return;
      if (draggedSinceDown) return;
      if (el.type === "image" && !el.src) { e.stopPropagation(); openImagePicker("element"); }
    });
    node.addEventListener("dblclick", function (e) {
      e.stopPropagation();
      if (state.liveMode) return;
      if (el.type === "image") { openImagePicker("element"); return; }
      if (el.type === "text" || el.type === "button") startInlineEdit(node, el);
    });
    return node;
  }

  function startInlineEdit(node, el) {
    if (state.liveMode) return;
    node.classList.add("editing");
    node.contentEditable = "true";
    node.focus();
    document.execCommand("selectAll", false, null);
    function finish() {
      node.contentEditable = "false";
      node.classList.remove("editing");
      el.text = node.textContent.trim() || el.text;
      var t = document.getElementById("el-text");
      if (t) t.value = el.text;
      persist(true);
      patchCanvasElement(el);
      node.removeEventListener("blur", finish);
    }
    node.addEventListener("blur", finish);
  }

  /* ---------------- inline editing for native slot text ---------------- */

  function startSlotEdit(node) {
    if (state.liveMode) return;
    var slot = node.dataset.slot;
    node.classList.add("editing");
    node.contentEditable = "true";
    node.focus();
    document.execCommand("selectAll", false, null);
    function finish() {
      node.contentEditable = "false";
      node.classList.remove("editing");
      var sc = scene();
      if (sc) {
        if (!sc.over) sc.over = {};
        sc.over[slot] = node.textContent.trim();
        persist(true);
        if (selectedNativeSlot === slot) {
          var ta = document.getElementById("native-text");
          if (ta) ta.value = sc.over[slot];
        }
      }
      node.removeEventListener("blur", finish);
    }
    node.addEventListener("blur", finish);
  }

  function applyNativePos(node, slot) {
    var sc = scene();
    var p = sc && sc.pos && sc.pos[slot];
    node.style.transform = p ? ("translate(" + p.dx + "px," + p.dy + "px)") : "";
  }

  function wireNative() {
    slideRoot.querySelectorAll("[data-slot]").forEach(function (node) {
      var slot = node.dataset.slot;
      var isText = node.classList.contains("ce");
      var isImg = node.classList.contains("native-img");
      applyNativePos(node, slot);
      if (slot === selectedNativeSlot) node.classList.add("native-selected");
      node.addEventListener("mousedown", function (e) { startNativeDrag(e, node, slot, isImg, isText); });
      if (isText) {
        node.addEventListener("dblclick", function (e) {
          e.stopPropagation();
          selectNative(slot, isImg, true, node);
          if (node.classList.contains("veh-btn")) {
            var ta = document.getElementById("native-text");
            if (ta) { ta.focus(); ta.select(); }
            return;
          }
          startSlotEdit(node);
        });
      }
    });
  }

  function startNativeDrag(e, node, slot, isImg, isText) {
    if (state.liveMode) return;
    if (e.button !== 0) return;
    if (node.isContentEditable) return;
    e.stopPropagation();
    selectNative(slot, isImg, isText, node);
    var sc = scene();
    var p = (sc.pos && sc.pos[slot]) || { dx: 0, dy: 0 };
    nativeInteraction = {
      slot: slot, node: node, isImg: isImg,
      sx: e.clientX, sy: e.clientY, odx: p.dx, ody: p.dy, moved: false, cur: null
    };
  }

  function selectNative(slot, isImg, isText, node) {
    state.selectedElementId = null;
    state.selectedPopupId = null;
    selectedNativeSlot = slot;
    showProps("native");
    var n = node || slideRoot.querySelector('[data-slot="' + slot + '"]');
    var img = isImg != null ? isImg : (n && n.classList.contains("native-img"));
    var txt = isText != null ? isText : (n && n.classList.contains("ce"));
    document.getElementById("native-text-wrap").hidden = !txt;
    document.getElementById("native-img-wrap").hidden = !img;
    document.getElementById("native-kind").textContent =
      slot === "hero" ? "Hero image" : (img ? "Image" : (txt ? "Text — " + slot : slot));
    if (txt && n) {
      var sc = scene();
      var saved = sc && sc.over && sc.over[slot] != null ? sc.over[slot] : n.textContent.trim();
      document.getElementById("native-text").value = saved;
    }
    floatToolbar.hidden = true;
    slideRoot.querySelectorAll(".native-selected").forEach(function (x) { x.classList.remove("native-selected"); });
    if (n) n.classList.add("native-selected");
    refreshLists();
  }

  function saveNativeText() {
    if (!selectedNativeSlot) return;
    var sc = scene();
    if (!sc) return;
    if (!sc.over) sc.over = {};
    var v = document.getElementById("native-text").value;
    sc.over[selectedNativeSlot] = v;
    var n = slideRoot.querySelector('[data-slot="' + selectedNativeSlot + '"]');
    if (n) n.textContent = v;
    persist(true);
    flashSaveStatus("Saved");
  }

  function resetNativePos() {
    if (!selectedNativeSlot) return;
    var sc = scene();
    if (sc.pos) delete sc.pos[selectedNativeSlot];
    persist();
    renderCanvas();
  }

  /* ---------------- popups ---------------- */

  function renderPopupHTML(p) {
    var a = p.accent || "#EB001E";
    if (p.template === "split-modal") {
      return '<button class="pop-close" type="button">✕</button><div class="tpl-split-modal">' +
        '<div class="left" style="background:' + a + '"><div class="ey">' + esc(p.eyebrow) + '</div><h2>' + esc(p.title) + '</h2></div>' +
        '<div class="right"><p>' + esc(p.body) + '</p></div></div>';
    }
    if (p.template === "dark-hud") {
      return '<button class="pop-close" type="button">✕</button><div class="tpl-dark-hud">' +
        '<div class="copy"><div class="ey">' + esc(p.eyebrow) + '</div><h2>' + esc(p.title) + '</h2><p>' + esc(p.body) + '</p></div>' +
        '<div class="media">media</div></div>';
    }
    if (p.template === "info-panel") {
      return '<button class="pop-close" type="button">✕</button><div class="tpl-info-panel" style="background:' + a + '">' +
        '<h2>' + esc(p.title) + '</h2><p>' + esc(p.body) + '</p>' +
        (p.fact ? '<p class="fact">Fun fact: ' + esc(p.fact) + '</p>' : '') + '</div>';
    }
    return '<button class="pop-close" type="button">✕</button><div class="tpl-card-popup">' +
      '<div class="head" style="background:' + a + '">' +
      (p.eyebrow ? '<div class="ey">' + esc(p.eyebrow) + '</div>' : '') +
      '<h2>' + esc(p.title) + '</h2></div><div class="body">' + esc(p.body) + '</div>' +
      (p.fact ? '<div class="fact"><b>Fun fact:</b> ' + esc(p.fact) + '</div>' : '') + '</div>';
  }

  function closeCanvasPopup() {
    canvasPopup.hidden = true;
    canvasPopup.innerHTML = "";
  }

  function openCanvasPopup(popupId) {
    var sc = scene();
    if (!sc) return;
    var p = sc.popups.find(function (x) { return x.id === popupId; });
    if (!p) return;
    canvasPopup.innerHTML = renderPopupHTML(p);
    canvasPopup.hidden = false;
    canvasPopup.querySelector(".pop-close").addEventListener("click", closeCanvasPopup);
  }

  /* ---------------- slide renderers ---------------- */

  function statsHTML(sc, stats) {
    if (!stats || !stats.length) return "";
    return '<div class="stats native-band">' + stats.map(function (s, i) {
      return '<div class="stat">' +
        '<div class="v ce" data-slot="stat-' + i + '-v">' + esc(slotText(sc, "stat-" + i + "-v", s.v)) + '</div>' +
        '<div class="l ce" data-slot="stat-' + i + '-l">' + esc(slotText(sc, "stat-" + i + "-l", s.l)) + '</div></div>';
    }).join("") + "</div>";
  }

  function vehActionsHTML(sc, d) {
    return '<div class="veh-actions native-band"><div class="veh-btns">' +
      (d.funFact ? '<span class="veh-btn btn-fun ce" data-slot="btn-fun" data-pop="fun" role="button" tabindex="0">' +
        esc(slotText(sc, "btn-fun", "★ Fun Fact")) + '</span>' : '') +
      '<span class="veh-btn btn-press ce" data-slot="btn-press" role="button" tabindex="0">' +
        esc(slotText(sc, "btn-press", "📰 Press Quotes")) + '</span>' +
      (d.headToHead && d.headToHead.length ? '<span class="veh-btn btn-vs ce" data-slot="btn-vs" role="button" tabindex="0">' +
        esc(slotText(sc, "btn-vs", "⚡ vs Rivals")) + '</span>' : '') +
      '</div></div>';
  }

  function chromeHTML(section) {
    return '<img class="chrome-logo" src="assets/img/logo-h-blue.png" alt="Vauxhall" ' +
      'onerror="this.style.display=\'none\'">' +
      '<div class="chrome-nav"><span class="sec">' + esc(section) + '</span>' +
      '<span class="bar"><span style="width:40%"></span></span>' +
      '<span class="count">preview</span></div>';
  }

  function overlayLayerHTML() { return '<div class="author-overlay" id="overlay-layer"></div>'; }

  function applyBgColor(sc) {
    var slide = slideRoot.querySelector(".author-slide");
    if (slide && sc.bgColor) slide.style.background = sc.bgColor;
    var ff = slideRoot.querySelector(".author-freeform");
    if (ff && sc.bgColor) ff.style.background = sc.bgColor;
  }

  function renderCarSlide(sc, d, root) {
    var bg = sc.background || ("images/" + d.image + ".jpg");
    var dark = false;
    root.innerHTML =
      '<section class="slide veh-car-slide author-slide active">' +
      chromeHTML("Cars") +
      '<div class="veh-head"><div>' +
      '<div class="eyebrow ce" data-slot="eyebrow">' + esc(slotText(sc, "eyebrow", "Car · " + d.tagline)) + '</div>' +
      '<h2 class="title ce" data-slot="title">' + esc(slotText(sc, "title", d.name)) + '</h2></div></div>' +
      '<p class="pitch-sm ce" data-slot="pitch">' + esc(slotText(sc, "pitch", d.pitch || "")) + '</p>' +
      '<div class="hero" id="hero-zone">' +
      '<img class="native-img" data-slot="hero" src="' + bg.replace(/"/g, "") + '" alt="' + esc(d.name) + '" onerror="this.style.opacity=0.15">' +
      '<div class="hs-layer" id="hero-layer"></div></div>' +
      statsHTML(sc, d.stats) +
      vehActionsHTML(sc, d) +
      overlayLayerHTML() +
      '</section>';
  }

  function renderVanSlide(sc, d, root) {
    var bg = sc.background || ("images/" + d.image + ".jpg");
    root.innerHTML =
      '<section class="slide veh-car-slide author-slide active">' +
      chromeHTML("Vans") +
      '<div class="veh-head"><div>' +
      '<div class="eyebrow ce" data-slot="eyebrow">' + esc(slotText(sc, "eyebrow", "Van · " + d.tagline)) + '</div>' +
      '<h2 class="title ce" data-slot="title">' + esc(slotText(sc, "title", d.name)) + '</h2></div></div>' +
      '<div class="hero" id="hero-zone">' +
      '<img class="native-img" data-slot="hero" src="' + bg.replace(/"/g, "") + '" alt="' + esc(d.name) + '" onerror="this.style.opacity=0.15">' +
      '<div class="hs-layer" id="hero-layer"></div></div>' +
      statsHTML(sc, d.stats) +
      vehActionsHTML(sc, d) +
      overlayLayerHTML() +
      '</section>';
  }

  function renderCoverSlide(sc, root) {
    var C = window.COURSE || { meta: {} };
    var m = C.meta || {};
    root.innerHTML =
      '<section class="slide ink cover author-slide active">' +
      chromeHTML("Welcome") +
      '<div class="eyebrow ce" data-slot="eyebrow">' + esc(slotText(sc, "eyebrow", "eLearning · Retailer Module")) + '</div>' +
      '<h1 class="title ce" data-slot="title">' + esc(slotText(sc, "title", m.title || "Title")) + '</h1>' +
      '<div class="blurb"><strong class="ce" data-slot="subtitle">' + esc(slotText(sc, "subtitle", m.subtitle || "")) + '</strong><br>' +
      '<span class="ce" data-slot="blurb">' + esc(slotText(sc, "blurb", m.blurb || "")) + '</span></div>' +
      '<div class="chips">' + (m.chips || []).map(function (c, i) {
        return '<span class="chip' + (i === 1 ? " red" : "") + '">' + esc(c) + "</span>";
      }).join("") + '</div>' +
      overlayLayerHTML() +
      '</section>';
  }

  function renderObjectivesSlide(sc, root) {
    var C = window.COURSE || {};
    var objs = C.objectives || [];
    root.innerHTML =
      '<section class="slide dark author-slide active">' +
      chromeHTML("Welcome") +
      '<div class="eyebrow ce" data-slot="eyebrow">' + esc(slotText(sc, "eyebrow", "Learning Objectives")) + '</div>' +
      '<h2 class="title ce" data-slot="title">' + esc(slotText(sc, "title", "By the end of this module…")) + '</h2>' +
      '<div class="obj-list">' + objs.map(function (o, i) {
        return '<div class="obj-item"><span class="n">0' + (i + 1) + '</span><span class="t">' + esc(o) + "</span></div>";
      }).join("") + '</div>' +
      overlayLayerHTML() +
      '</section>';
  }

  function renderDividerSlide(sc, root) {
    root.innerHTML =
      '<section class="slide ink divider author-slide active">' +
      chromeHTML(sc.title || "Section") +
      '<div class="eyebrow ce" data-slot="eyebrow">' + esc(slotText(sc, "eyebrow", "Section " + (sc.num || "01"))) + '</div>' +
      '<div class="bignum ce" data-slot="num">' + esc(slotText(sc, "num", sc.num || "01")) + '</div>' +
      '<h1 class="title ce" data-slot="title">' + esc(slotText(sc, "title", sc.title || "Section title")) + '</h1>' +
      '<div class="quote ce" data-slot="quote">"' + esc(slotText(sc, "quote", sc.quote || "")) + '"</div>' +
      overlayLayerHTML() +
      '</section>';
  }

  function renderFreeformSlide(sc, root) {
    var bg = sc.background || "";
    root.innerHTML =
      '<div class="author-freeform">' +
      '<div class="canvas-bg" id="canvas-bg"></div>' +
      overlayLayerHTML() + '</div>';
    var cbg = document.getElementById("canvas-bg");
    cbg.style.backgroundImage = bg ? 'url("' + bg.replace(/"/g, "") + '")' : "none";
  }

  function flushActiveEdits() {
    var editing = slideRoot.querySelector(".editing[contenteditable='true']");
    if (editing) editing.blur();
    if (selectedNativeSlot) saveNativeText();
    if (state.selectedElementId && !formSyncing) {
      var el = elById(state.selectedElementId);
      if (el) { readFormIntoElement(el); persist(true); }
    }
  }

  function renderCanvas() {
    flushActiveEdits();
    var sc = scene();
    if (!sc) return;
    document.getElementById("scene-bg").value = (sc.background && sc.background.indexOf("data:") === 0) ? "[uploaded image]" : (sc.background || "");
    document.getElementById("scene-bgcolor").value = /^#[0-9a-fA-F]{6}$/.test(sc.bgColor || "") ? sc.bgColor : "#ffffff";
    slideRoot.innerHTML = "";
    closeCanvasPopup();

    var kind = sceneKind(sc);
    if (kind === "car") renderCarSlide(sc, getVehicleData(sc).data, slideRoot);
    else if (kind === "van") renderVanSlide(sc, getVehicleData(sc).data, slideRoot);
    else if (kind === "cover") renderCoverSlide(sc, slideRoot);
    else if (kind === "objectives") renderObjectivesSlide(sc, slideRoot);
    else if (kind === "divider") renderDividerSlide(sc, slideRoot);
    else renderFreeformSlide(sc, slideRoot);

    applyBgColor(sc);
    wireNative();

    var sorted = sc.elements.slice().sort(function (a, b) { return (a.z || 0) - (b.z || 0); });
    var hsIndex = 0;
    sorted.forEach(function (el) {
      var container = containerForEl(el);
      if (el.type === "hotspot") { container.appendChild(buildHotspotNode(el, hsIndex)); hsIndex++; }
      else container.appendChild(buildNode(el));
    });

    wireNativeButtons();
    markSelection();
    refreshTriggers();
    syncPanelsAfterRender();
    fitCanvas();
  }

  function hotspotIndexById(id) {
    var sc = scene();
    if (!sc) return 0;
    var idx = 0;
    for (var i = 0; i < sc.elements.length; i++) {
      var e = sc.elements[i];
      if (e.type === "hotspot") {
        if (e.id === id) return idx;
        idx++;
      }
    }
    return 0;
  }

  function reorderElementsInDom() {
    var sc = scene();
    if (!sc) return;
    var sorted = sc.elements.slice().sort(function (a, b) { return (a.z || 0) - (b.z || 0); });
    sorted.forEach(function (el) {
      var node = slideRoot.querySelector('[data-id="' + el.id + '"]');
      var container = containerForEl(el);
      if (node && container) container.appendChild(node);
    });
  }

  function patchCanvasElement(el) {
    if (!el || !slideRoot) return;
    var old = slideRoot.querySelector('[data-id="' + el.id + '"]');
    if (!old) { renderCanvas(); return; }
    var container = old.parentNode;
    var neu = el.type === "hotspot"
      ? buildHotspotNode(el, hotspotIndexById(el.id))
      : buildNode(el);
    container.replaceChild(neu, old);
    reorderElementsInDom();
    markSelection();
  }

  function syncPanelsAfterRender() {
    if (state.selectedElementId) {
      var el = elById(state.selectedElementId);
      if (el) {
        showProps("element");
        formSyncing = true;
        fillElementForm(el);
        formSyncing = false;
      }
    } else if (selectedNativeSlot) {
      showProps("native");
      var n = slideRoot.querySelector('[data-slot="' + selectedNativeSlot + '"]');
      var isImg = n && n.classList.contains("native-img");
      var isText = n && n.classList.contains("ce");
      selectNative(selectedNativeSlot, isImg, isText, n);
    } else if (state.selectedPopupId) {
      selectPopup(state.selectedPopupId);
    }
  }

  function wireNativeButtons() {
    var sc = scene();
    if (!sc) return;
    var funPop = sc.popups.find(function (p) { return p.id.indexOf("popup-fun-") === 0; });
    slideRoot.querySelectorAll(".veh-btn").forEach(function (b) {
      b.addEventListener("click", function (e) {
        if (!state.liveMode) return;
        e.stopPropagation();
        if (b.classList.contains("btn-fun") && funPop) openCanvasPopup(funPop.id);
      });
    });
  }

  /* ---------------- selection + toolbar ---------------- */

  function markSelection() {
    slideRoot.querySelectorAll(".auth-el").forEach(function (node) {
      var id = node.dataset.id;
      var el = elById(id);
      var sel = id === state.selectedElementId;
      node.classList.toggle("selected", sel);
      if (sel && el) attachHandles(node, el);
      else { var h = node.querySelector(".resize-handles"); if (h) h.remove(); }
    });
    updateFloatToolbar();
    refreshLists();
  }

  function updateFloatToolbar() {
    if (!state.selectedElementId || state.liveMode) { floatToolbar.hidden = true; return; }
    var node = slideRoot.querySelector('[data-id="' + state.selectedElementId + '"]');
    if (!node) { floatToolbar.hidden = true; return; }
    var outer = document.getElementById("canvas-outer").getBoundingClientRect();
    var r = node.getBoundingClientRect();
    floatToolbar.hidden = false;
    floatToolbar.style.left = (r.left - outer.left + r.width / 2) + "px";
    floatToolbar.style.top = (r.top - outer.top) + "px";
  }

  /* ---------------- lists ---------------- */

  function elPreview(el) {
    if (el.type === "hotspot") return (el.text || "Hotspot") + (el.facts && el.facts.length ? " · " + el.facts.length + " facts" : "");
    if (el.type === "image") return el.src ? "image" : "(empty image)";
    return el.text || el.type;
  }

  function refreshLists() {
    var sc = scene();
    if (!sc) return;
    var elList = document.getElementById("element-list");
    var sorted = sc.elements.slice().sort(function (a, b) { return (b.z || 0) - (a.z || 0); });

    // custom overlay elements
    var customHTML = sorted.map(function (el) {
      return '<li data-el="' + el.id + '" class="' + (state.selectedElementId === el.id ? "active" : "") + '">' +
        '<span class="li-z" title="Layer">' + (el.z || 1) + '</span>' +
        '<span class="li-type li-' + el.type + '">' + el.type + '</span>' +
        '<span class="li-name">' + esc(elPreview(el)) + '</span>' +
        '<span class="li-order">' +
        '<button type="button" class="li-btn" data-el="' + el.id + '" data-z="1" title="Bring forward">↑</button>' +
        '<button type="button" class="li-btn" data-el="' + el.id + '" data-z="-1" title="Send back">↓</button>' +
        '</span></li>';
    }).join("");

    // native slide elements (title, hero, stats, etc.)
    var nativeNodes = slideRoot.querySelectorAll("[data-slot]");
    var nativeHTML = "";
    nativeNodes.forEach(function (n) {
      var slot = n.getAttribute("data-slot");
      var label = slot.charAt(0).toUpperCase() + slot.slice(1);
      var isActive = (selectedNativeSlot === slot) ? " active" : "";
      nativeHTML += '<li data-native="' + slot + '" class="li-native' + isActive + '" title="Native slide element">' +
        '<span class="li-type li-native-badge">native</span>' +
        '<span class="li-name">' + esc(label) + '</span></li>';
    });

    elList.innerHTML = customHTML + nativeHTML || '<li class="hint">Nothing on canvas yet</li>';

    elList.querySelectorAll("li[data-el]").forEach(function (li) {
      li.onclick = function (e) {
        if (e.target.closest(".li-btn")) return;
        selectElement(li.getAttribute("data-el"));
      };
    });
    elList.querySelectorAll(".li-btn").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        nudgeElementZ(btn.getAttribute("data-el"), parseInt(btn.getAttribute("data-z"), 10));
      };
    });
    elList.querySelectorAll("li[data-native]").forEach(function (li) {
      li.onclick = function () {
        var slot = li.getAttribute("data-native");
        var n = slideRoot.querySelector('[data-slot="' + slot + '"]');
        if (!n) return;
        var isImg = n.classList.contains("native-img");
        var isText = n.classList.contains("ce");
        selectNative(slot, isImg, isText, n);
      };
    });

    // scroll active item into view
    var activeItem = elList.querySelector("li.active");
    if (activeItem) activeItem.scrollIntoView({ block: "nearest" });

    var popList = document.getElementById("popup-list");
    popList.innerHTML = sc.popups.map(function (p) {
      return '<li data-pop="' + p.id + '" class="' + (state.selectedPopupId === p.id ? "active" : "") + '">' +
        '<span class="li-name">' + esc(p.title || p.id) + '</span><span class="li-type">' + p.template + '</span></li>';
    }).join("") || '<li class="hint">No pop-ups</li>';
    popList.querySelectorAll("[data-pop]").forEach(function (li) {
      li.onclick = function () { selectPopup(li.getAttribute("data-pop")); };
    });
  }

  function refreshTriggers() {
    var sc = scene();
    var sel = document.getElementById("el-trigger");
    if (!sel || !sc) return;
    var v = sel.value;
    sel.innerHTML = '<option value="">— none —</option>';
    sc.popups.forEach(function (p) {
      var o = document.createElement("option");
      o.value = p.id; o.textContent = p.title || p.id;
      sel.appendChild(o);
    });
    if (v) sel.value = v;
  }

  /* ---------------- property panels ---------------- */

  function showProps(which) {
    document.getElementById("props-empty").hidden = which !== null;
    document.getElementById("props-element").hidden = which !== "element";
    document.getElementById("props-popup").hidden = which !== "popup";
    document.getElementById("props-native").hidden = which !== "native";
  }

  function fillElementForm(el) {
    document.getElementById("el-type").value = el.type;
    document.getElementById("el-text").value = el.text || "";
    document.getElementById("el-facts").value = (el.facts || []).join("\n");
    document.getElementById("el-src").value = (el.src && el.src.indexOf("data:") === 0) ? "[uploaded image]" : (el.src || "");
    document.getElementById("el-color").value = /^#[0-9a-fA-F]{6}$/.test(el.color || "") ? el.color : "#ffffff";
    document.getElementById("el-bg").value = /^#[0-9a-fA-F]{6}$/.test(el.bg || "") ? el.bg : "#EB001E";
    document.getElementById("el-font").value = el.fontSize || 14;
    document.getElementById("el-bold").checked = !!el.bold;
    document.getElementById("el-fit").value = el.fit || "cover";
    document.getElementById("el-posx").value = el.posX != null ? el.posX : 50;
    document.getElementById("el-posy").value = el.posY != null ? el.posY : 50;
    document.getElementById("el-zoom").value = Math.round((el.zoom || 1) * 100);
    document.getElementById("el-radius").value = el.radius || 0;
    document.getElementById("el-shadow").checked = !!el.shadow;
    document.getElementById("el-z").value = el.z || 1;

    var isHotspot = el.type === "hotspot";
    var isImage = el.type === "image";
    var isText = el.type === "text" || el.type === "button";
    document.getElementById("wrap-el-text").hidden = isImage;
    document.getElementById("wrap-el-facts").hidden = !isHotspot;
    document.getElementById("wrap-el-image").hidden = !isImage;
    var cropWrap = document.getElementById("wrap-el-crop");
    if (cropWrap) cropWrap.hidden = !isImage || el.fit === "fill";
    document.getElementById("wrap-el-colors").hidden = !(isText);
    document.getElementById("sw-el-color").hidden = !isText;
    document.getElementById("sw-el-bg").hidden = !(el.type === "button");
    document.getElementById("wrap-el-font").hidden = !isText;

    var textLabel = document.getElementById("el-text").closest("label");
    if (textLabel) textLabel.firstChild.textContent = isHotspot ? "Hotspot label" : "Text";

    refreshTriggers();
    document.getElementById("el-trigger").value = el.trigger || "";
  }

  function clearNativeSelection() {
    selectedNativeSlot = null;
    slideRoot.querySelectorAll(".native-selected").forEach(function (x) { x.classList.remove("native-selected"); });
  }

  function selectElement(id) {
    state.selectedElementId = id;
    state.selectedPopupId = null;
    clearNativeSelection();
    // exit crop mode when switching elements
    if (cropModeActive) {
      cropModeActive = false;
      canvas.classList.remove("crop-mode");
      var btn = document.getElementById("btn-crop-mode");
      if (btn) btn.classList.remove("active");
    }
    var el = elById(id);
    if (!el) { showProps(null); return; }
    showProps("element");
    fillElementForm(el);
    markSelection();
  }

  function selectPopup(id) {
    state.selectedPopupId = id;
    state.selectedElementId = null;
    clearNativeSelection();
    showProps("popup");
    var p = scene().popups.find(function (x) { return x.id === id; });
    if (!p) return;
    document.getElementById("pop-template").value = p.template || "card-popup";
    document.getElementById("pop-eyebrow").value = p.eyebrow || "";
    document.getElementById("pop-title").value = p.title || "";
    document.getElementById("pop-body").value = p.body || "";
    document.getElementById("pop-fact").value = p.fact || "";
    document.getElementById("pop-accent").value = /^#[0-9a-fA-F]{6}$/.test(p.accent || "") ? p.accent : "#EB001E";
    markSelection();
  }

  function addElement(type) {
    var sc = scene();
    if (!sc) return;
    var n = sc.elements.length;
    var el = {
      id: uid(type), type: type,
      x: type === "hotspot" ? 45 + (n % 3) * 8 : 30 + (n % 5) * 4,
      y: type === "hotspot" ? 50 : 30 + (n % 5) * 4,
      w: type === "image" ? 30 : 0,
      h: type === "image" ? 34 : 0,
      z: 20 + n,
      text: type === "hotspot" ? "New hotspot" : type === "button" ? "BUTTON" : "Your text here",
      facts: type === "hotspot" ? [] : undefined,
      src: "", fit: "cover", posX: 50, posY: 50, zoom: 1, radius: 0, shadow: false,
      color: type === "text" ? "#000037" : "#ffffff",
      bg: "#EB001E",
      fontSize: type === "text" ? 18 : 13,
      bold: true, trigger: ""
    };
    sc.elements.push(el);
    persist();
    renderCanvas();
    selectElement(el.id);
    if (type === "image") openImagePicker("element");
  }

  function addPopup() {
    var sc = scene();
    var p = {
      id: uid("popup"), template: "info-panel",
      eyebrow: "Did you know?", title: "Pop-up title",
      body: "Edit this text in the right panel.", fact: "", accent: "#000037"
    };
    sc.popups.push(p);
    persist();
    renderCanvas();
    selectPopup(p.id);
  }

  function readFormIntoElement(el) {
    el.text = document.getElementById("el-text").value;
    el.facts = document.getElementById("el-facts").value.split("\n")
      .map(function (s) { return s.trim(); }).filter(Boolean);
    var srcVal = document.getElementById("el-src").value.trim();
    if (srcVal === "[uploaded image]") {
      /* keep existing data: URL on el.src */
    } else if (srcVal) {
      el.src = srcVal;
    } else if (!el.src || el.src.indexOf("data:") !== 0) {
      el.src = "";
    }
    el.color = document.getElementById("el-color").value;
    el.bg = document.getElementById("el-bg").value;
    el.fontSize = parseInt(document.getElementById("el-font").value, 10) || 14;
    el.bold = document.getElementById("el-bold").checked;
    el.fit = document.getElementById("el-fit").value;
    el.posX = parseInt(document.getElementById("el-posx").value, 10);
    el.posY = parseInt(document.getElementById("el-posy").value, 10);
    el.zoom = (parseInt(document.getElementById("el-zoom").value, 10) || 100) / 100;
    el.radius = parseInt(document.getElementById("el-radius").value, 10) || 0;
    el.shadow = document.getElementById("el-shadow").checked;
    el.z = parseInt(document.getElementById("el-z").value, 10) || 1;
    el.trigger = document.getElementById("el-trigger").value;
  }

  function saveElFromForm() {
    if (formSyncing) return;
    var el = elById(state.selectedElementId);
    if (!el) return;
    readFormIntoElement(el);
    // keep crop controls visibility in sync with fit selection
    var cropWrap = document.getElementById("wrap-el-crop");
    if (cropWrap) cropWrap.hidden = el.type !== "image" || el.fit === "fill";
    persist(true);
    patchCanvasElement(el);
    refreshLists();
    flashSaveStatus("Saved");
  }

  function savePopFromForm() {
    if (formSyncing) return;
    var sc = scene();
    if (!sc || !state.selectedPopupId) return;
    var p = sc.popups.find(function (x) { return x.id === state.selectedPopupId; });
    if (!p) return;
    p.template = document.getElementById("pop-template").value;
    p.eyebrow = document.getElementById("pop-eyebrow").value;
    p.title = document.getElementById("pop-title").value;
    p.body = document.getElementById("pop-body").value;
    p.fact = document.getElementById("pop-fact").value;
    p.accent = document.getElementById("pop-accent").value;
    persist(true);
    refreshLists();
    if (!canvasPopup.hidden) openCanvasPopup(p.id);
    flashSaveStatus("Saved");
  }

  function deleteSelected() {
    var sc = scene();
    if (state.selectedElementId) {
      sc.elements = sc.elements.filter(function (e) { return e.id !== state.selectedElementId; });
      state.selectedElementId = null;
    } else if (state.selectedPopupId) {
      var pid = state.selectedPopupId;
      sc.popups = sc.popups.filter(function (p) { return p.id !== pid; });
      sc.elements.forEach(function (e) { if (e.trigger === pid) e.trigger = ""; });
      state.selectedPopupId = null;
    }
    showProps(null);
    persist();
    renderCanvas();
  }

  function duplicateSelected() {
    var el = elById(state.selectedElementId);
    if (!el) return;
    var copy = JSON.parse(JSON.stringify(el));
    copy.id = uid(el.type);
    copy.x = Math.min(92, el.x + 4);
    copy.y = Math.min(92, el.y + 4);
    scene().elements.push(copy);
    persist();
    renderCanvas();
    selectElement(copy.id);
  }

  function nudgeZ(dir) {
    var el = elById(state.selectedElementId);
    if (!el) return;
    el.z = (el.z || 1) + dir;
    persist();
    renderCanvas();
    fillElementForm(el);
  }

  function zExtents() {
    var zs = scene().elements.map(function (e) { return e.z || 1; });
    if (!zs.length) return { min: 1, max: 1 };
    return { min: Math.min.apply(null, zs), max: Math.max.apply(null, zs) };
  }

  function bringToFront() {
    var el = elById(state.selectedElementId);
    if (!el) return;
    el.z = zExtents().max + 1;
    persist();
    renderCanvas();
    selectElement(el.id);
  }

  function sendToBack() {
    var el = elById(state.selectedElementId);
    if (!el) return;
    el.z = zExtents().min - 1;
    persist();
    renderCanvas();
    selectElement(el.id);
  }

  function setElementZ(id, z) {
    var el = elById(id);
    if (!el) return;
    el.z = Math.max(1, parseInt(z, 10) || 1);
    persist();
    renderCanvas();
    if (state.selectedElementId === id) fillElementForm(el);
    else refreshLists();
  }

  function nudgeElementZ(id, dir) {
    var sc = scene();
    var el = elById(id);
    if (!el) return;
    var sorted = sc.elements.slice().sort(function (a, b) { return (a.z || 0) - (b.z || 0); });
    var i = sorted.findIndex(function (e) { return e.id === id; });
    var j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    var other = sorted[j];
    var tmp = el.z || 1;
    el.z = other.z || 1;
    other.z = tmp;
    persist();
    renderCanvas();
    if (state.selectedElementId === id) selectElement(id);
    else refreshLists();
  }

  /* ---------------- drag + resize ---------------- */

  function startCropDrag(e, el, node) {
    if (e.button !== 0) return;
    e.preventDefault();
    if (state.selectedElementId !== el.id) selectElement(el.id);
    draggedSinceDown = false;
    var box = node.getBoundingClientRect();
    node.classList.add("cropping");
    interaction = {
      mode: "crop", id: el.id, sx: e.clientX, sy: e.clientY,
      opx: el.posX != null ? el.posX : 50,
      opy: el.posY != null ? el.posY : 50,
      boxW: box.width / viewScale,
      boxH: box.height / viewScale
    };
  }

  function startDrag(e) {
    if (e.button !== 0 || e.target.classList.contains("rh")) return;
    var id = e.currentTarget.dataset.id;
    var el = elById(id);
    if (!el) return;
    if (state.liveMode) return; // live clicks handled per-node
    e.stopPropagation();
    e.preventDefault();
    if (state.selectedElementId !== id) selectElement(id);
    draggedSinceDown = false;
    var rect = containerForEl(el).getBoundingClientRect();
    interaction = { mode: "drag", id: id, sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y, rect: rect, moved: false };
  }

  function startResize(e) {
    if (state.liveMode) return;
    e.stopPropagation(); e.preventDefault();
    var id = e.currentTarget.closest(".auth-el").dataset.id;
    var el = elById(id);
    if (!el) return;
    var rect = containerForEl(el).getBoundingClientRect();
    interaction = {
      mode: "resize", id: id, handle: e.currentTarget.dataset.h,
      sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y, ow: el.w, oh: el.h, rect: rect
    };
  }

  function onMove(e) {
    if (nativeInteraction) {
      if (Math.abs(e.clientX - nativeInteraction.sx) > 3 || Math.abs(e.clientY - nativeInteraction.sy) > 3) nativeInteraction.moved = true;
      if (nativeInteraction.isImg) return; // hero image: click-to-swap, not draggable
      var ndx = nativeInteraction.odx + (e.clientX - nativeInteraction.sx) / viewScale;
      var ndy = nativeInteraction.ody + (e.clientY - nativeInteraction.sy) / viewScale;
      nativeInteraction.node.style.transform = "translate(" + ndx + "px," + ndy + "px)";
      nativeInteraction.cur = { dx: Math.round(ndx), dy: Math.round(ndy) };
      return;
    }
    if (!interaction) return;
    var el = elById(interaction.id);
    var node = slideRoot.querySelector('[data-id="' + interaction.id + '"]');
    if (!el || !node) return;
    var dx = ((e.clientX - interaction.sx) / interaction.rect.width) * 100;
    var dy = ((e.clientY - interaction.sy) / interaction.rect.height) * 100;

    if (interaction.mode === "drag") {
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) { interaction.moved = true; draggedSinceDown = true; }
      var maxX = el.type === "image" ? 100 - (el.w || 10) : 99;
      var maxY = el.type === "image" ? 100 - (el.h || 10) : 99;
      el.x = Math.max(0, Math.min(maxX, interaction.ox + dx));
      el.y = Math.max(0, Math.min(maxY, interaction.oy + dy));
      applyElStyle(node, el);
      if (el.type === "hotspot") node.classList.toggle("hs-flip", el.y < 46);
      updateFloatToolbar();
    } else if (interaction.mode === "resize") {
      var h = interaction.handle;
      if (h.indexOf("e") >= 0) el.w = Math.max(5, interaction.ow + dx);
      if (h.indexOf("s") >= 0) el.h = Math.max(5, interaction.oh + dy);
      if (h.indexOf("w") >= 0) { el.x = interaction.ox + dx; el.w = Math.max(5, interaction.ow - dx); }
      if (h.indexOf("n") >= 0) { el.y = interaction.oy + dy; el.h = Math.max(5, interaction.oh - dy); }
      applyElStyle(node, el);
      updateFloatToolbar();
    } else if (interaction.mode === "crop") {
      var cdx = (e.clientX - interaction.sx) / viewScale;
      var cdy = (e.clientY - interaction.sy) / viewScale;
      if (Math.abs(cdx) > 1 || Math.abs(cdy) > 1) { interaction.moved = true; draggedSinceDown = true; }
      var sensX = 100 / Math.max(interaction.boxW, 1);
      var sensY = 100 / Math.max(interaction.boxH, 1);
      el.posX = clamp(interaction.opx - cdx * sensX, 0, 100);
      el.posY = clamp(interaction.opy - cdy * sensY, 0, 100);
      var img = node.querySelector("img");
      applyImageCrop(img, el);
      syncCropSliders(el);
    }
  }

  function onUp() {
    if (nativeInteraction) {
      var ni = nativeInteraction;
      nativeInteraction = null;
      if (ni.cur) {
        var sc = scene();
        if (!sc.pos) sc.pos = {};
        sc.pos[ni.slot] = ni.cur;
        persist();
      }
      if (!ni.moved && ni.isImg) openImagePicker("scene");
      return;
    }
    if (interaction) {
      var wasCrop = interaction.mode === "crop";
      interaction = null;
      slideRoot.querySelectorAll(".auth-el.cropping").forEach(function (n) { n.classList.remove("cropping"); });
      if (wasCrop) {
        var el = elById(state.selectedElementId);
        if (el) fillElementForm(el);
      }
      persist();
    }
  }

  /* ---------------- image library + picker ---------------- */

  function imageLibrary() {
    var lib = [];
    var seen = {};
    function push(label, src) {
      if (!src || seen[src]) return;
      seen[src] = true; lib.push({ label: label, src: src });
    }
    var C = window.COURSE || {};
    (C.cars || []).forEach(function (c) { push(c.name, "images/" + c.image + ".jpg"); });
    (C.vans || []).forEach(function (v) { push(v.name, "images/" + v.image + ".jpg"); });
    (C.timeline || []).forEach(function (t) { push(t.year, "assets/timeline/" + t.year + ".svg"); });
    push("Logo (blue)", "assets/img/logo-h-blue.png");
    push("Logo (white)", "assets/img/logo-h-white.png");
    push("Roundel", "assets/img/roundel-red.png");
    state.assets.forEach(function (a) { push(a.label, a.src); });
    return lib;
  }

  function openImagePicker(target) {
    pickerTarget = target;
    var grid = document.getElementById("img-picker-grid");
    grid.innerHTML = "";
    imageLibrary().forEach(function (item) {
      var cell = document.createElement("button");
      cell.type = "button";
      cell.className = "img-cell";
      cell.innerHTML = '<img src="' + item.src.replace(/"/g, "") + '" alt="" ' +
        'onerror="this.parentNode.classList.add(\'broken\')"><span>' + esc(item.label) + '</span>';
      cell.onclick = function () { applyPickedImage(item.src); };
      grid.appendChild(cell);
    });
    document.getElementById("img-picker").hidden = false;
  }

  function applyUploadedImage(dataUrl, name, target) {
    var dest = target || pickerTarget || "scene";
    var label = name || "uploaded";
    state.assets.push({ label: label, src: dataUrl });
    if (dest === "scene") {
      var sc = scene();
      if (!sc) return;
      sc.background = dataUrl;
      document.getElementById("scene-bg").value = "[uploaded image]";
      var ok = persist(true);
      renderCanvas();
      if (!ok) flashSaveStatus("Image shown — storage full, export your work", true);
      else flashSaveStatus("Image uploaded");
      return;
    }
    var el = elById(state.selectedElementId);
    if (!el || el.type !== "image") {
      flashSaveStatus("Select an image box first", true);
      return;
    }
    el.src = dataUrl;
    document.getElementById("el-src").value = "[uploaded image]";
    var saved = persist(true);
    patchCanvasElement(el);
    formSyncing = true;
    fillElementForm(el);
    formSyncing = false;
    refreshLists();
    if (!saved) flashSaveStatus("Image shown — storage full, export your work", true);
    else flashSaveStatus("Image uploaded");
  }

  function applyPickedImage(src) {
    if (pickerTarget === "scene") {
      var sc = scene();
      if (sc) {
        sc.background = src;
        document.getElementById("scene-bg").value =
          src.indexOf("data:") === 0 ? "[uploaded image]" : src;
        persist(true);
        renderCanvas();
      }
    } else {
      var el = elById(state.selectedElementId);
      if (el) {
        el.src = src;
        document.getElementById("el-src").value =
          src.indexOf("data:") === 0 ? "[uploaded image]" : src;
        persist(true);
        patchCanvasElement(el);
        formSyncing = true;
        fillElementForm(el);
        formSyncing = false;
        refreshLists();
      }
    }
    document.getElementById("img-picker").hidden = true;
    flashSaveStatus("Saved");
  }

  /* ---------------- palette swatches ---------------- */

  function buildSwatches() {
    document.querySelectorAll(".swatches").forEach(function (box) {
      var targetId = box.dataset.swatchTarget;
      box.innerHTML = "";
      VX_PALETTE.forEach(function (c) {
        var sw = document.createElement("button");
        sw.type = "button"; sw.className = "swatch";
        sw.style.background = c.hex; sw.title = c.name + " " + c.hex;
        sw.onclick = function () {
          var input = document.getElementById(targetId);
          if (!input) return;
          input.value = c.hex;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        };
        box.appendChild(sw);
      });
    });
  }

  /* ---------------- export ---------------- */

  function exportJSON() {
    var blob = new Blob([JSON.stringify({
      exportedAt: new Date().toISOString(),
      note: "Send this to Cursor. Re-upload any base64 images as files where noted.",
      scenes: state.scenes, assets: state.assets
    }, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "vauxhall-scenes-" + Date.now() + ".json";
    a.click();
    persist();
  }

  /* ---------------- scene picker ---------------- */

  function sceneSortKey(id) {
    var sc = state.scenes[id];
    var k = sc ? sceneKind(sc) : "custom";
    var order = { cover: 0, objectives: 1, divider: 2, timeline: 3, car: 4, van: 5, custom: 6 };
    return (order[k] != null ? order[k] : 9) + "-" + id;
  }

  function populateScenes() {
    var sel = document.getElementById("scene-select");
    sel.innerHTML = "";
    Object.keys(state.scenes).sort(function (a, b) {
      return sceneSortKey(a).localeCompare(sceneSortKey(b));
    }).forEach(function (id) {
      var o = document.createElement("option");
      o.value = id; o.textContent = state.scenes[id].label || id;
      if (id === state.activeSceneId) o.selected = true;
      sel.appendChild(o);
    });
  }

  /* ---------------- live mode ---------------- */

  function setLiveMode(on) {
    state.liveMode = on;
    canvas.classList.toggle("live", on);
    document.getElementById("canvas-hint").textContent = on
      ? "Live preview — click hotspots & buttons to test pop-ups. Untick to edit."
      : "Click to select · Drag to move · Double-click image to swap · Ctrl+drag image to crop";
    if (on) {
      state.selectedElementId = null;
      state.selectedPopupId = null;
      showProps(null);
      floatToolbar.hidden = true;
    }
    renderCanvas();
  }

  /* ---------------- wiring ---------------- */

  function wire() {
    document.getElementById("scene-select").onchange = function (e) {
      flushActiveEdits();
      state.activeSceneId = e.target.value;
      state.selectedElementId = null;
      state.selectedPopupId = null;
      persist();
      populateScenes();
      renderCanvas();
      showProps(null);
    };

    document.getElementById("scene-bg").oninput = function (e) {
      var v = e.target.value.trim();
      if (v === "[uploaded image]") return;
      scene().background = v;
      persist();
      renderCanvas();
    };
    document.getElementById("scene-bgcolor").oninput = function (e) {
      scene().bgColor = e.target.value;
      persist();
      applyBgColor(scene());
    };
    document.getElementById("scene-bgcolor").onchange = function () { persist(); };

    document.getElementById("btn-bg-pick").onclick = function () { openImagePicker("scene"); };
    document.getElementById("btn-bg-upload").onclick = function () { document.getElementById("file-bg").click(); };
    document.getElementById("file-bg").onchange = function (e) {
      var f = e.target.files[0];
      pickerTarget = "scene";
      uploadFile(f, function (dataUrl, name) { applyUploadedImage(dataUrl, name, "scene"); });
      e.target.value = "";
    };

    document.getElementById("btn-el-pick").onclick = function () { openImagePicker("element"); };
    document.getElementById("btn-el-upload").onclick = function () {
      if (!state.selectedElementId || !elById(state.selectedElementId) ||
          elById(state.selectedElementId).type !== "image") {
        flashSaveStatus("Select an image box first", true);
        return;
      }
      pickerTarget = "element";
      document.getElementById("file-el").click();
    };
    document.getElementById("file-el").onchange = function (e) {
      uploadFile(e.target.files[0], function (dataUrl, name) { applyUploadedImage(dataUrl, name, "element"); });
      e.target.value = "";
    };

    document.getElementById("btn-clear-bg").onclick = function () {
      scene().background = ""; persist(); renderCanvas();
    };

    document.getElementById("native-text").addEventListener("input", saveNativeText);
    document.getElementById("native-text").addEventListener("change", saveNativeText);

    window.addEventListener("beforeunload", function () { persist(true); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Control" || e.key === "Meta") canvas.classList.add("ctrl-crop");
    });
    document.addEventListener("keyup", function (e) {
      if (e.key === "Control" || e.key === "Meta") canvas.classList.remove("ctrl-crop");
    });
    window.addEventListener("blur", function () { canvas.classList.remove("ctrl-crop"); });
    document.getElementById("btn-native-reset").onclick = resetNativePos;
    document.getElementById("btn-native-pick").onclick = function () { openImagePicker("scene"); };
    document.getElementById("btn-native-upload").onclick = function () {
      pickerTarget = "scene";
      document.getElementById("file-bg").click();
    };

    document.getElementById("img-picker-upload").onclick = function () {
      document.getElementById("file-picker").click();
    };
    document.getElementById("file-picker").onchange = function (e) {
      uploadFile(e.target.files[0], function (dataUrl, name) {
        applyUploadedImage(dataUrl, name, pickerTarget || "element");
        document.getElementById("img-picker").hidden = true;
      });
      e.target.value = "";
    };

    document.getElementById("btn-reset-author").onclick = function () {
      if (!confirm("Reset all scenes? Your layout work will be lost.")) return;
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("vauxhall-scene-author-v1");
      state.scenes = {}; state.assets = []; state.activeSceneId = null;
      loadState();
      populateScenes(); renderCanvas(); showProps(null);
    };

    document.querySelectorAll("[data-add]").forEach(function (b) {
      b.onclick = function () { addElement(b.getAttribute("data-add")); };
    });

    document.getElementById("btn-add-popup").onclick = addPopup;
    document.getElementById("btn-del-el").onclick = deleteSelected;
    document.getElementById("btn-del-pop").onclick = deleteSelected;
    document.getElementById("btn-export").onclick = exportJSON;

    document.getElementById("btn-crop-mode").onclick = function () {
      cropModeActive = !cropModeActive;
      canvas.classList.toggle("crop-mode", cropModeActive);
      this.classList.toggle("active", cropModeActive);
      this.textContent = cropModeActive ? "✓ Repositioning on" : "Drag to reposition";
    };

    document.getElementById("file-import").onchange = function (e) {
      var f = e.target.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var data = JSON.parse(r.result);
          state.scenes = data.scenes;
          state.assets = data.assets || [];
          state.activeSceneId = Object.keys(state.scenes)[0];
          mergeMissingScenes();
          persist(); populateScenes(); renderCanvas();
        } catch (err) { alert("Invalid JSON"); }
      };
      r.readAsText(f);
    };
    document.getElementById("btn-import").onclick = function () { document.getElementById("file-import").click(); };

    document.getElementById("live-mode").onchange = function (e) { setLiveMode(e.target.checked); };

    document.getElementById("img-picker-close").onclick = function () { document.getElementById("img-picker").hidden = true; };
    document.getElementById("img-picker").onclick = function (e) {
      if (e.target === this) this.hidden = true;
    };

    floatToolbar.querySelectorAll("button").forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute("data-act");
        if (a === "del") deleteSelected();
        if (a === "dup") duplicateSelected();
        if (a === "top") bringToFront();
        if (a === "front") nudgeZ(1);
        if (a === "back") nudgeZ(-1);
        if (a === "bottom") sendToBack();
      };
    });

    ["el-text", "el-facts", "el-src", "el-color", "el-bg", "el-font", "el-bold",
     "el-fit", "el-posx", "el-posy", "el-zoom", "el-radius", "el-shadow", "el-z", "el-trigger"].forEach(function (id) {
      var n = document.getElementById(id);
      n.oninput = saveElFromForm;
      n.onchange = saveElFromForm;
    });
    ["pop-template", "pop-eyebrow", "pop-title", "pop-body", "pop-fact", "pop-accent"].forEach(function (id) {
      document.getElementById(id).oninput = savePopFromForm;
    });

    document.getElementById("btn-z-top").onclick = bringToFront;
    document.getElementById("btn-z-up").onclick = function () { nudgeZ(1); };
    document.getElementById("btn-z-down").onclick = function () { nudgeZ(-1); };
    document.getElementById("btn-z-bottom").onclick = sendToBack;

    document.getElementById("show-grid").onchange = function (e) { canvas.classList.toggle("show-grid", e.target.checked); };
    document.getElementById("show-safe").onchange = function (e) { canvas.classList.toggle("show-safe", e.target.checked); };

    slideRoot.addEventListener("mousedown", function (e) {
      if (state.liveMode) return;
      if (e.target.closest(".auth-el")) return;
      if (e.target.closest("[data-slot]")) return;
      state.selectedElementId = null;
      state.selectedPopupId = null;
      clearNativeSelection();
      showProps(null);
      markSelection();
    });

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeCanvasPopup(); document.getElementById("img-picker").hidden = true; }
      if ((e.key === "Delete" || e.key === "Backspace") && state.selectedElementId &&
          document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA" &&
          !document.activeElement.isContentEditable) {
        deleteSelected();
      }
    });
    window.addEventListener("resize", function () { fitCanvas(); updateFloatToolbar(); });
  }

  function uploadFile(file, callback) {
    if (!file) return;
    if (!file.type || file.type.indexOf("image/") !== 0) {
      flashSaveStatus("Please choose an image file", true);
      return;
    }
    var reader = new FileReader();
    reader.onerror = function () { flashSaveStatus("Could not read that file", true); };
    reader.onload = function () { callback(reader.result, file.name); };
    reader.readAsDataURL(file);
  }

  /* ---------------- boot ---------------- */

  loadState();
  persist();
  buildSwatches();
  wire();
  canvas.classList.add("show-grid", "show-safe");
  populateScenes();
  fitCanvas();
  renderCanvas();
  showProps(null);
})();
