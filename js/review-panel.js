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

  function navigateToSlide(idx) {
    if (window.VX_RENDER && typeof window.VX_RENDER.go === "function") {
      window.VX_RENDER.go(idx);
    }
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

  function localCommentId(item) {
    return item.local_id || item.created_at_client || "";
  }

  function supabaseHeaders(extra) {
    var h = {
      apikey: CFG.supabaseAnonKey,
      Authorization: "Bearer " + CFG.supabaseAnonKey
    };
    if (extra) Object.keys(extra).forEach(function (k) { h[k] = extra[k]; });
    return h;
  }

  async function supabaseErrorMessage(res) {
    try {
      var body = await res.json();
      if (body && body.message) return body.message;
      if (body && body.error) return body.error;
      if (body && body.hint) return body.hint;
    } catch (e) {}
    return "HTTP " + res.status;
  }

  async function fetchSupabaseComments(ctx) {
    var base = String(CFG.supabaseUrl).replace(/\/+$/, "");
    var url = base + "/rest/v1/" + encodeURIComponent(TABLE) +
      "?course_id=eq." + encodeURIComponent(ctx.course_id) +
      "&slide_index=eq." + encodeURIComponent(String(ctx.slide_index)) +
      "&select=id,note,reviewer_name,slide_title,slide_index,created_at_client,section,scene_id,progress,inserted_at" +
      "&order=created_at_client.desc";
    var res = await fetch(url, { headers: supabaseHeaders() });
    if (!res.ok) throw new Error(await supabaseErrorMessage(res));
    return await res.json();
  }

  async function fetchAllSupabaseComments() {
    var base = String(CFG.supabaseUrl).replace(/\/+$/, "");
    var url = base + "/rest/v1/" + encodeURIComponent(TABLE) +
      "?course_id=eq." + encodeURIComponent(COURSE_ID) +
      "&select=id,note,reviewer_name,slide_title,slide_index,created_at_client,section,inserted_at" +
      "&order=slide_index.asc,created_at_client.asc";
    var res = await fetch(url, { headers: supabaseHeaders() });
    if (!res.ok) throw new Error(await supabaseErrorMessage(res));
    return await res.json();
  }

  async function insertSupabaseComment(payload) {
    var base = String(CFG.supabaseUrl).replace(/\/+$/, "");
    var url = base + "/rest/v1/" + encodeURIComponent(TABLE);
    var res = await fetch(url, {
      method: "POST",
      headers: supabaseHeaders({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await supabaseErrorMessage(res));
  }

  async function updateSupabaseComment(id, payload) {
    var base = String(CFG.supabaseUrl).replace(/\/+$/, "");
    var url = base + "/rest/v1/" + encodeURIComponent(TABLE) + "?id=eq." + encodeURIComponent(String(id));
    var res = await fetch(url, {
      method: "PATCH",
      headers: supabaseHeaders({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await supabaseErrorMessage(res));
  }

  async function deleteSupabaseComment(id) {
    var base = String(CFG.supabaseUrl).replace(/\/+$/, "");
    var url = base + "/rest/v1/" + encodeURIComponent(TABLE) + "?id=eq." + encodeURIComponent(String(id));
    var res = await fetch(url, {
      method: "DELETE",
      headers: supabaseHeaders({ Prefer: "return=minimal" })
    });
    if (!res.ok) throw new Error(await supabaseErrorMessage(res));
  }

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso || "";
    return d.toLocaleString();
  }

  function mount() {
    var footer = document.getElementById("footer");
    if (!footer) return;

    // Toggle button in footer
    var toggleBtn = document.createElement("button");
    toggleBtn.id = "review-panel-btn";
    toggleBtn.className = "btn btn-outline";
    toggleBtn.type = "button";
    toggleBtn.textContent = "Review Notes";
    footer.appendChild(toggleBtn);

    // Panel HTML
    var panel = document.createElement("aside");
    panel.id = "review-panel";
    panel.innerHTML =
      '<div class="rv-head">' +
        '<strong>Reviewer Notes</strong>' +
        '<button id="rv-close" type="button" aria-label="Close review panel">&#10005;</button>' +
      '</div>' +

      // Tabs
      '<div class="rv-tabs">' +
        '<button class="rv-tab rv-tab-active" data-tab="slide">This slide</button>' +
        '<button class="rv-tab" data-tab="all">All notes <span class="rv-all-count" id="rv-all-count"></span></button>' +
      '</div>' +

      // "This slide" pane
      '<div class="rv-pane" id="rv-pane-slide">' +
        '<div class="rv-scene" id="rv-scene"></div>' +
        '<div class="rv-meta" id="rv-meta"></div>' +
        '<label class="rv-name-label" for="rv-name">Your name</label>' +
        '<input id="rv-name" type="text" maxlength="80" placeholder="So we know who left this note">' +
        '<textarea id="rv-text" placeholder="Leave feedback for this exact slide..."></textarea>' +
        '<div class="rv-actions">' +
          '<button id="rv-cancel-edit" class="btn btn-outline rv-cancel hidden" type="button">Cancel</button>' +
          '<button id="rv-save" class="btn btn-primary" type="button">Save note</button>' +
        '</div>' +
        '<div class="rv-status" id="rv-status"></div>' +
        '<div class="rv-list-title">Notes for this slide</div>' +
        '<div class="rv-list" id="rv-list"></div>' +
      '</div>' +

      // "All notes" pane
      '<div class="rv-pane rv-pane-hidden" id="rv-pane-all">' +
        '<div class="rv-all-status" id="rv-all-status">Loading...</div>' +
        '<div class="rv-all-list" id="rv-all-list"></div>' +
      '</div>';

    document.body.appendChild(panel);

    // Refs
    var saveBtn        = panel.querySelector("#rv-save");
    var cancelEditBtn  = panel.querySelector("#rv-cancel-edit");
    var closeBtn       = panel.querySelector("#rv-close");
    var textEl         = panel.querySelector("#rv-text");
    var nameEl         = panel.querySelector("#rv-name");
    var statusEl       = panel.querySelector("#rv-status");
    var listEl         = panel.querySelector("#rv-list");
    var metaEl         = panel.querySelector("#rv-meta");
    var sceneEl        = panel.querySelector("#rv-scene");
    var paneSlide      = panel.querySelector("#rv-pane-slide");
    var paneAll        = panel.querySelector("#rv-pane-all");
    var allList        = panel.querySelector("#rv-all-list");
    var allStatus      = panel.querySelector("#rv-all-status");
    var allCount       = panel.querySelector("#rv-all-count");
    var tabs           = panel.querySelectorAll(".rv-tab");

    var editingRef  = null;
    var lastItems   = [];
    var lastSource  = "local";
    var activeTab   = "slide";

    try {
      var savedName = localStorage.getItem(NAME_KEY);
      if (savedName) nameEl.value = savedName;
    } catch (e) {}

    nameEl.addEventListener("change", function () { getReviewerName(nameEl); });

    // ---- tab switching ----
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activeTab = tab.getAttribute("data-tab");
        tabs.forEach(function (t) { t.classList.toggle("rv-tab-active", t === tab); });
        paneSlide.classList.toggle("rv-pane-hidden", activeTab !== "slide");
        paneAll.classList.toggle("rv-pane-hidden", activeTab !== "all");
        if (activeTab === "all") loadAllComments();
      });
    });

    // ---- helpers ----
    function setStatus(msg, kind) {
      statusEl.textContent = msg || "";
      statusEl.className = "rv-status" + (kind ? " " + kind : "");
    }

    function clearEditMode() {
      editingRef = null;
      textEl.value = "";
      saveBtn.textContent = "Save note";
      cancelEditBtn.classList.add("hidden");
      listEl.querySelectorAll(".rv-item.editing").forEach(function (el) {
        el.classList.remove("editing");
      });
    }

    function startEditMode(item, source) {
      // Switch to slide tab when editing
      activeTab = "slide";
      tabs.forEach(function (t) { t.classList.toggle("rv-tab-active", t.getAttribute("data-tab") === "slide"); });
      paneSlide.classList.remove("rv-pane-hidden");
      paneAll.classList.add("rv-pane-hidden");

      var id = source === "supabase" ? item.id : localCommentId(item);
      editingRef = { source: source, id: id };
      textEl.value = item.note || "";
      if (item.reviewer_name && !nameEl.value.trim()) nameEl.value = item.reviewer_name;
      saveBtn.textContent = "Update note";
      cancelEditBtn.classList.remove("hidden");
      textEl.focus();
      listEl.querySelectorAll(".rv-item").forEach(function (el) {
        el.classList.toggle("editing", el.getAttribute("data-id") === String(id));
      });
      setStatus("Editing note — save or cancel when done.", "warn");
    }

    function renderMeta(ctx) {
      sceneEl.textContent = ctx.slide_title;
      metaEl.textContent = "Slide " + (ctx.slide_index + 1) + " of " +
        ((window.VX_RENDER && window.VX_RENDER.slides && window.VX_RENDER.slides.length) || "?") +
        " · " + (ctx.section || "Section");
    }

    function renderCommentItem(it, source) {
      var id = source === "supabase" ? it.id : localCommentId(it);
      var who = it.reviewer_name ? esc(it.reviewer_name) + " · " : "";
      var when = it.created_at_client || it.inserted_at || "";
      var editing = editingRef && String(editingRef.id) === String(id);
      return '<div class="rv-item' + (editing ? " editing" : "") + '" data-id="' + esc(String(id)) + '" data-source="' + source + '">' +
        '<div class="rv-item-top">' +
          '<div class="rv-item-meta">' + who + esc(formatDate(when)) + '</div>' +
          '<div class="rv-item-actions">' +
            '<button type="button" class="rv-act rv-edit" data-rv-edit>Edit</button>' +
            '<button type="button" class="rv-act rv-delete" data-rv-delete>Remove</button>' +
          '</div>' +
        '</div>' +
        (it.slide_title ? '<div class="rv-item-scene">' + esc(it.slide_title) + '</div>' : '') +
        '<div class="rv-item-text">' + esc(it.note || "") + '</div>' +
      '</div>';
    }

    // ---- This Slide tab ----
    async function loadComments() {
      var ctx = getCurrentContext();
      renderMeta(ctx);
      try {
        var items;
        var source = "local";
        if (hasSupabase()) {
          items = await fetchSupabaseComments(ctx);
          source = "supabase";
        } else {
          items = getLocalComments().filter(function (x) {
            return x.course_id === ctx.course_id && x.slide_index === ctx.slide_index;
          }).sort(function (a, b) {
            return String(b.created_at_client).localeCompare(String(a.created_at_client));
          });
        }
        lastItems  = items;
        lastSource = source;
        if (!items.length) {
          listEl.innerHTML = '<div class="rv-empty">No notes yet for this slide.</div>';
          return;
        }
        listEl.innerHTML = items.map(function (it) { return renderCommentItem(it, source); }).join("");
      } catch (e) {
        listEl.innerHTML = '<div class="rv-empty">Unable to load notes: ' + esc(e.message || "error") + '</div>';
      }
    }

    // ---- All Notes tab ----
    async function loadAllComments() {
      allStatus.textContent = "Loading…";
      allList.innerHTML = "";
      try {
        var items;
        if (hasSupabase()) {
          items = await fetchAllSupabaseComments();
        } else {
          items = getLocalComments()
            .filter(function (x) { return x.course_id === COURSE_ID; })
            .sort(function (a, b) {
              if (a.slide_index !== b.slide_index) return a.slide_index - b.slide_index;
              return String(a.created_at_client).localeCompare(String(b.created_at_client));
            });
        }

        // Update badge
        var total = items.length;
        allCount.textContent = total ? String(total) : "";
        allCount.style.display = total ? "" : "none";

        if (!total) {
          allStatus.textContent = "No notes across the course yet.";
          return;
        }
        allStatus.textContent = "";

        // Group by slide_index
        var groups = {};
        var order = [];
        items.forEach(function (it) {
          var idx = it.slide_index != null ? it.slide_index : -1;
          if (!groups[idx]) { groups[idx] = []; order.push(idx); }
          groups[idx].push(it);
        });

        var currentIdx = getSlideIndex();
        var html = "";
        order.forEach(function (slideIdx) {
          var grp = groups[slideIdx];
          var title = grp[0].slide_title || ("Slide " + (parseInt(slideIdx, 10) + 1));
          var isCurrent = slideIdx === currentIdx;
          html += '<div class="rv-group">' +
            '<div class="rv-group-head' + (isCurrent ? " rv-group-current" : "") + '">' +
              '<span class="rv-group-title">' + esc(title) + '</span>' +
              '<span class="rv-group-count">' + grp.length + ' note' + (grp.length !== 1 ? 's' : '') + '</span>' +
              (!isCurrent
                ? '<button class="rv-go-btn" data-slide-idx="' + slideIdx + '">Go to slide &#8594;</button>'
                : '<span class="rv-here-pill">You are here</span>') +
            '</div>' +
            grp.map(function (it) {
              var who = it.reviewer_name ? esc(it.reviewer_name) + " · " : "";
              var when = it.created_at_client || it.inserted_at || "";
              return '<div class="rv-all-item">' +
                '<div class="rv-item-meta">' + who + esc(formatDate(when)) + '</div>' +
                '<div class="rv-item-text">' + esc(it.note || "") + '</div>' +
              '</div>';
            }).join("") +
          '</div>';
        });
        allList.innerHTML = html;
      } catch (e) {
        allStatus.textContent = "Could not load: " + esc(e.message || "error");
      }
    }

    // Navigate from All Notes
    allList.addEventListener("click", function (e) {
      var btn = e.target.closest(".rv-go-btn");
      if (!btn) return;
      var idx = parseInt(btn.getAttribute("data-slide-idx"), 10);
      navigateToSlide(idx);
      // Switch back to slide tab so the notes for that slide are visible
      activeTab = "slide";
      tabs.forEach(function (t) { t.classList.toggle("rv-tab-active", t.getAttribute("data-tab") === "slide"); });
      paneSlide.classList.remove("rv-pane-hidden");
      paneAll.classList.add("rv-pane-hidden");
      setTimeout(loadComments, 80);
    });

    // ---- save / update comment ----
    async function saveComment() {
      var note = (textEl.value || "").trim();
      if (!note) { setStatus("Write a note first.", "warn"); return; }
      var ctx = getCurrentContext();
      var reviewerName = getReviewerName(nameEl);

      if (editingRef) {
        try {
          if (editingRef.source === "supabase" && hasSupabase()) {
            await updateSupabaseComment(editingRef.id, {
              note: note,
              reviewer_name: reviewerName || null,
              created_at_client: new Date().toISOString()
            });
          } else {
            var all = getLocalComments();
            var fi = all.findIndex(function (x) { return localCommentId(x) === editingRef.id; });
            if (fi >= 0) {
              all[fi].note = note;
              all[fi].reviewer_name = reviewerName || null;
              all[fi].created_at_client = new Date().toISOString();
              setLocalComments(all);
            }
          }
          clearEditMode();
          setStatus("Comment updated.", "ok");
          await loadComments();
        } catch (e) {
          setStatus(e.message || "Could not update.", "err");
        }
        return;
      }

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
        } else {
          payload.local_id = "local_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
          var stored = getLocalComments();
          stored.push(payload);
          setLocalComments(stored);
        }
        textEl.value = "";
        setStatus("Comment saved.", "ok");
        await loadComments();
      } catch (e) {
        setStatus(e.message || "Could not save.", "err");
      }
    }

    // ---- remove comment ----
    async function removeComment(itemEl) {
      var id = itemEl.getAttribute("data-id");
      var source = itemEl.getAttribute("data-source");
      if (!id) return;
      if (!window.confirm("Remove this note?")) return;
      if (editingRef && String(editingRef.id) === String(id)) clearEditMode();
      try {
        if (source === "supabase" && hasSupabase()) {
          await deleteSupabaseComment(id);
        } else {
          var all = getLocalComments().filter(function (x) { return localCommentId(x) !== id; });
          setLocalComments(all);
        }
        setStatus("Comment removed.", "ok");
        await loadComments();
      } catch (e) {
        setStatus(e.message || "Could not remove.", "err");
      }
    }

    // ---- list click handler (edit / remove) ----
    listEl.addEventListener("click", function (e) {
      var itemEl = e.target.closest(".rv-item");
      if (!itemEl) return;
      var id = itemEl.getAttribute("data-id");
      var item = lastItems.find(function (x) {
        var itemId = lastSource === "supabase" ? String(x.id) : String(localCommentId(x));
        return itemId === String(id);
      });
      if (e.target.closest("[data-rv-edit]")) {
        if (item) startEditMode(item, lastSource);
        return;
      }
      if (e.target.closest("[data-rv-delete]")) removeComment(itemEl);
    });

    // ---- panel open / close ----
    toggleBtn.addEventListener("click", function () {
      panel.classList.toggle("open");
      if (panel.classList.contains("open")) {
        loadComments();
        if (activeTab === "all") loadAllComments();
      } else {
        clearEditMode();
      }
    });
    closeBtn.addEventListener("click", function () {
      panel.classList.remove("open");
      clearEditMode();
    });
    cancelEditBtn.addEventListener("click", function () {
      clearEditMode();
      setStatus("", "");
    });
    saveBtn.addEventListener("click", saveComment);

    document.addEventListener("click", function (e) {
      if (!panel.classList.contains("open")) return;
      if (panel.contains(e.target) || toggleBtn.contains(e.target)) return;
      panel.classList.remove("open");
      clearEditMode();
    });

    // ---- expose to engine ----
    window.VX_REVIEW_PANEL = {
      onNavigate: function () {
        if (!panel.classList.contains("open")) return;
        clearEditMode();
        loadComments();
        if (activeTab === "all") loadAllComments();
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
