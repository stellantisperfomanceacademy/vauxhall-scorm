(function () {
  var CFG = window.VX_REVIEW_CONFIG || {};
  var STORAGE_KEY = "vx_review_comments_v1";
  var NAME_KEY = "vx_reviewer_name";
  var COURSE_ID = CFG.courseId || "vauxhall-scorm-2026";
  var TABLE = CFG.table || "course_reviews";

  function hasSupabase() {
    return !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toSceneId(slide) {
    if (!slide) return "unknown";
    if (slide.type === "vehicle") return "vehicle-" + (slide.data && slide.data.image || "unknown");
    if (slide.type === "retired") return "retired-" + (slide.data && slide.data.image || "unknown");
    if (slide.type === "quiz-intro") return "quizintro";
    if (slide.type === "quiz") return "quiz-" + slide.qi;
    if (slide.type === "divider") return "divider-" + String(slide.section || "").toLowerCase();
    return slide.type || "unknown";
  }

  function slideTitle(slide) {
    if (!slide) return "Unknown slide";
    switch (slide.type) {
      case "cover": return "Welcome — Cover";
      case "objectives": return "Welcome — Objectives";
      case "divider":
        return (slide.section || "Section") + " — " + (slide.title || slide.section || "Divider");
      case "timeline": return "History — Interactive Timeline";
      case "vehicle":
        return (slide.section || "Vehicle") + " — " + (slide.data && slide.data.name || "Model");
      case "retired":
        return "Retired — " + (slide.data && slide.data.name || "Model");
      case "comparison": return "Cheat Sheet — Full Range Comparison";
      case "quiz-intro": return "Quiz — Introduction";
      case "quiz": return "Quiz — Question " + ((slide.qi || 0) + 1);
      case "results": return "Quiz — Results";
      case "outro": return "Finish — Module Complete";
      default: return slide.type || "Slide";
    }
  }

  function getSlideIndex() {
    if (window.VX_RENDER && typeof window.VX_RENDER.getCurrentIndex === "function") {
      return window.VX_RENDER.getCurrentIndex();
    }
    var progressEl = document.getElementById("progress-readout");
    if (progressEl) {
      var m = progressEl.textContent.trim().match(/^(\d+)\s*\/\s*(\d+)/);
      if (m) return Math.max(0, parseInt(m[1], 10) - 1);
    }
    if (window.VXSCORM && typeof window.VXSCORM.getLocation === "function") {
      return window.VXSCORM.getLocation() || 0;
    }
    return 0;
  }

  function getCurrentContext() {
    var idx = getSlideIndex();
    var slides = window.VX_RENDER && window.VX_RENDER.slides || [];
    var slide = slides[idx] || null;
    var total = slides.length || 0;
    var progress = total ? ((idx + 1) + " / " + total) : "";
    var progressEl = document.getElementById("progress-readout");
    if (progressEl && progressEl.textContent.trim()) progress = progressEl.textContent.trim();

    var section = slide && slide.section ? slide.section : "";
    var sceneId = toSceneId(slide);
    var slideName = slideTitle(slide);
    var stageText = "";
    var stage = document.getElementById("stage");
    if (stage) stageText = (stage.textContent || "").trim().slice(0, 220);

    return {
      course_id: COURSE_ID,
      slide_index: idx,
      scene_id: sceneId,
      slide_title: slideName,
      section: section,
      progress: progress,
      stage_excerpt: stageText,
      page_title: document.title || "Vauxhall Product and Technology",
      created_at_client: new Date().toISOString(),
      user_agent: navigator.userAgent
    };
  }

  function getReviewerName(nameEl) {
    var val = nameEl ? (nameEl.value || "").trim() : "";
    if (val) {
      try { localStorage.setItem(NAME_KEY, val); } catch (e) {}
      return val;
    }
    try { return localStorage.getItem(NAME_KEY) || ""; } catch (e) { return ""; }
  }

  function getLocalComments() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function setLocalComments(items) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
  }

  async function fetchSupabaseComments(ctx) {
    var base = String(CFG.supabaseUrl).replace(/\/+$/, "");
    var url = base + "/rest/v1/" + encodeURIComponent(TABLE) +
      "?course_id=eq." + encodeURIComponent(ctx.course_id) +
      "&slide_index=eq." + encodeURIComponent(String(ctx.slide_index)) +
      "&select=note,reviewer_name,slide_title,created_at_client,section,scene_id,progress&order=created_at_client.desc";
    var res = await fetch(url, {
      headers: {
        apikey: CFG.supabaseAnonKey,
        Authorization: "Bearer " + CFG.supabaseAnonKey
      }
    });
    if (!res.ok) throw new Error("Supabase fetch failed");
    return await res.json();
  }

  async function insertSupabaseComment(payload) {
    var base = String(CFG.supabaseUrl).replace(/\/+$/, "");
    var url = base + "/rest/v1/" + encodeURIComponent(TABLE);
    var res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
        apikey: CFG.supabaseAnonKey,
        Authorization: "Bearer " + CFG.supabaseAnonKey
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Supabase insert failed");
  }

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso || "";
    return d.toLocaleString();
  }

  function mount() {
    var footer = document.getElementById("footer");
    if (!footer) return;

    var toggleBtn = document.createElement("button");
    toggleBtn.id = "review-panel-btn";
    toggleBtn.className = "btn btn-outline";
    toggleBtn.type = "button";
    toggleBtn.textContent = "Review Notes";
    footer.appendChild(toggleBtn);

    var panel = document.createElement("aside");
    panel.id = "review-panel";
    panel.innerHTML =
      '<div class="rv-head">' +
        '<strong>Reviewer Notes</strong>' +
        '<button id="rv-close" type="button" aria-label="Close review panel">x</button>' +
      "</div>" +
      '<div class="rv-scene" id="rv-scene"></div>' +
      '<div class="rv-meta" id="rv-meta"></div>' +
      '<label class="rv-name-label" for="rv-name">Your name</label>' +
      '<input id="rv-name" type="text" maxlength="80" placeholder="So we know who left this note">' +
      '<textarea id="rv-text" placeholder="Leave feedback for this exact slide..."></textarea>' +
      '<div class="rv-actions">' +
        '<button id="rv-save" class="btn btn-primary" type="button">Save note</button>' +
      "</div>" +
      '<div class="rv-status" id="rv-status"></div>' +
      '<div class="rv-list-title">Notes for this slide</div>' +
      '<div class="rv-list" id="rv-list"></div>';
    document.body.appendChild(panel);

    var saveBtn = panel.querySelector("#rv-save");
    var closeBtn = panel.querySelector("#rv-close");
    var textEl = panel.querySelector("#rv-text");
    var nameEl = panel.querySelector("#rv-name");
    var statusEl = panel.querySelector("#rv-status");
    var listEl = panel.querySelector("#rv-list");
    var metaEl = panel.querySelector("#rv-meta");
    var sceneEl = panel.querySelector("#rv-scene");

    try {
      var savedName = localStorage.getItem(NAME_KEY);
      if (savedName) nameEl.value = savedName;
    } catch (e) {}

    nameEl.addEventListener("change", function () {
      getReviewerName(nameEl);
    });

    function setStatus(msg, kind) {
      statusEl.textContent = msg || "";
      statusEl.className = "rv-status" + (kind ? " " + kind : "");
    }

    function renderMeta(ctx) {
      sceneEl.textContent = ctx.slide_title;
      metaEl.textContent = "Slide " + (ctx.slide_index + 1) + " of " +
        ((window.VX_RENDER && window.VX_RENDER.slides && window.VX_RENDER.slides.length) || "?") +
        " · " + (ctx.section || "Section") + " · " + ctx.scene_id;
    }

    async function loadComments() {
      var ctx = getCurrentContext();
      renderMeta(ctx);

      try {
        var items;
        if (hasSupabase()) {
          items = await fetchSupabaseComments(ctx);
        } else {
          items = getLocalComments().filter(function (x) {
            return x.course_id === ctx.course_id && x.slide_index === ctx.slide_index;
          }).sort(function (a, b) {
            return String(b.created_at_client).localeCompare(String(a.created_at_client));
          });
        }

        if (!items.length) {
          listEl.innerHTML = '<div class="rv-empty">No notes yet for this slide.</div>';
          return;
        }
        listEl.innerHTML = items.map(function (it) {
          var who = it.reviewer_name ? esc(it.reviewer_name) + " · " : "";
          return '<div class="rv-item">' +
            '<div class="rv-item-meta">' + who + esc(formatDate(it.created_at_client)) + "</div>" +
            (it.slide_title ? '<div class="rv-item-scene">' + esc(it.slide_title) + "</div>" : "") +
            '<div class="rv-item-text">' + esc(it.note || "") + "</div>" +
          "</div>";
        }).join("");
      } catch (e) {
        listEl.innerHTML = '<div class="rv-empty">Unable to load Supabase notes. Showing local notes only.</div>';
      }
    }

    async function saveComment() {
      var note = (textEl.value || "").trim();
      if (!note) { setStatus("Write a note first.", "warn"); return; }
      var ctx = getCurrentContext();
      var reviewerName = getReviewerName(nameEl);
      var payload = {
        course_id: ctx.course_id,
        slide_index: ctx.slide_index,
        scene_id: ctx.scene_id,
        slide_title: ctx.slide_title,
        section: ctx.section,
        progress: ctx.progress,
        stage_excerpt: ctx.stage_excerpt,
        page_title: ctx.page_title,
        created_at_client: ctx.created_at_client,
        user_agent: ctx.user_agent,
        reviewer_name: reviewerName || null,
        note: note
      };
      try {
        if (hasSupabase()) {
          await insertSupabaseComment(payload);
          setStatus("Comment saved.", "ok");
        } else {
          var all = getLocalComments();
          all.push(payload);
          setLocalComments(all);
          setStatus("Comment saved.", "ok");
        }
        textEl.value = "";
        await loadComments();
      } catch (e) {
        setStatus("Could not save to Supabase. Check URL, key, table, and CORS.", "err");
      }
    }

    toggleBtn.addEventListener("click", function () {
      panel.classList.toggle("open");
      if (panel.classList.contains("open")) loadComments();
    });
    closeBtn.addEventListener("click", function () { panel.classList.remove("open"); });
    saveBtn.addEventListener("click", saveComment);

    document.addEventListener("click", function (e) {
      if (!panel.classList.contains("open")) return;
      if (panel.contains(e.target) || toggleBtn.contains(e.target)) return;
      panel.classList.remove("open");
    });

    window.VX_REVIEW_PANEL = {
      onNavigate: function () {
        if (!panel.classList.contains("open")) return;
        loadComments();
      },
      refresh: loadComments
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
