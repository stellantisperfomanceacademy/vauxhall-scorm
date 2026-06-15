/* SCORM 1.2 wrapper exposed as window.VXSCORM.
   Falls back gracefully to offline mode (e.g. opening index.html directly). */
window.VXSCORM = (function () {
  var API = null, started = false, finished = false, offline = false;

  function find(win) {
    var n = 0;
    while (win && n++ < 500) {
      if (win.API) return win.API;
      if (win.parent && win.parent !== win) win = win.parent; else break;
    }
    return null;
  }
  function get() {
    if (API) return API;
    API = find(window);
    if (!API && window.opener) API = find(window.opener);
    if (!API) offline = true;
    return API;
  }
  function call(fn) {
    var api = get(), args = Array.prototype.slice.call(arguments, 1);
    if (!api || typeof api[fn] !== "function") return null;
    try { return api[fn].apply(api, args); } catch (e) { return null; }
  }

  return {
    init: function () {
      if (started) return true;
      var r = call("LMSInitialize", "");
      started = true;
      if (!offline) {
        var st = call("LMSGetValue", "cmi.core.lesson_status");
        if (!st || st === "not attempted" || st === "") call("LMSSetValue", "cmi.core.lesson_status", "incomplete");
      }
      return r === "true" || r === true || offline;
    },
    setStatus: function (status) { call("LMSSetValue", "cmi.core.lesson_status", status); },
    setScore: function (raw, max, min) {
      call("LMSSetValue", "cmi.core.score.min", String(min != null ? min : 0));
      call("LMSSetValue", "cmi.core.score.max", String(max != null ? max : 100));
      call("LMSSetValue", "cmi.core.score.raw", String(raw));
    },
    setLocation: function (idx) { call("LMSSetValue", "cmi.core.lesson_location", String(idx)); },
    getLocation: function () {
      var v = call("LMSGetValue", "cmi.core.lesson_location");
      var n = parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    },
    commit: function () { call("LMSCommit", ""); },
    finish: function () {
      if (finished) return;
      finished = true;
      call("LMSCommit", "");
      call("LMSFinish", "");
    },
    isOffline: function () { return offline; }
  };
})();
