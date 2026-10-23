/* CV download (every link with a "download" attribute that points at the PDF).
   Inside the claude.ai artifact viewer the page runs in a sandboxed frame where a plain
   <a download> does nothing, so there the file is saved through the viewer's
   "downloads" capability (the viewer shows a confirm box first).
   On GitHub Pages or locally there is no window.claude, so the normal link just works. */
(function () {
  var hasClaude = !!(window.claude && typeof window.claude.use === "function");
  var dlP = null;
  function getDl() {
    if (!dlP) dlP = window.claude.use("downloads").catch(function () { return null; });
    return dlP;
  }
  if (hasClaude) getDl();   /* warm it up, resolves later */

  document.addEventListener("click", function (e) {
    if (!hasClaude) return;
    var a = e.target && e.target.closest && e.target.closest('a[download][href$=".pdf"]');
    if (!a) return;
    e.preventDefault();
    var href = a.getAttribute("href");
    var name = (href.split("/").pop() || "Khaled-Abdelhadi-CV.pdf").split("?")[0];
    getDl().then(function (dl) {
      if (!dl) throw { code: "unavailable" };
      return fetch(href).then(function (r) {
        if (!r.ok) throw { code: "unavailable" };
        return r.blob();
      }).then(function (blob) { return dl.save({ filename: name, data: blob }); });
    }).catch(function (err) {
      var code = err && err.code;
      if (code === "declined" || code === "rate_limited") return;   /* viewer said no or a box is already open */
      try { window.open(a.href, "_blank", "noopener"); } catch (x) { /* nothing else we can do */ }
    });
  });
})();
