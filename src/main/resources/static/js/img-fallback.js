// Centralized image fallback handler
// Place this file in your static/js folder and include it before </body> on pages that need it.
(function () {
  // Global fallback image (absolute path from static root) — override by setting window.IMG_FALLBACK before this script runs
  // Use an absolute path (starts with '/') or relative paths will be resolved against the current document base.
  window.IMG_FALLBACK = window.IMG_FALLBACK || './hobbies/art_images/tikou.jpg';

  // Small inline SVG placeholder (data URL) used when all fallbacks fail
  var INLINE_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">'
    + '<rect width="100%" height="100%" fill="#ddd"/>'
    + '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#777" font-size="18">Image not available</text>'
    + '</svg>'
  );

  function resolveUrl(url, img) {
    try {
      // support absolute and relative URLs
      return new URL(url, document.baseURI).href;
    } catch (e) {
      // fallback to original string
      return url;
    }
  }

  function clearSrcsetAndSources(img) {
    // remove srcset from img to stop browser selecting other sources
    if (img.hasAttribute('srcset')) img.removeAttribute('srcset');
    // if inside a <picture>, remove source srcset attributes to avoid them overriding
    var pic = img.closest('picture');
    if (pic) {
      pic.querySelectorAll('source').forEach(s => s.removeAttribute('srcset'));
    }
  }

  function attachHandlers() {
    document.querySelectorAll('img').forEach(img => {
      if (img.dataset.fallbackAttached) return;

      // keep an array of candidate fallbacks for this image (per-image overrides first)
      var raw = img.dataset.fallback || '';
      var candidates = raw.split('|').map(s => s.trim()).filter(Boolean);
      // push global fallback last if present
      if (window.IMG_FALLBACK) candidates.push(window.IMG_FALLBACK);

      // resolve to absolute URLs for comparison
      candidates = candidates.map(c => resolveUrl(c || '', img));

      // state per-image
      img.dataset.fallbackIndex = img.dataset.fallbackIndex || '0';

      function handleError() {
        var idx = parseInt(img.dataset.fallbackIndex || '0', 10);
        // avoid infinite loops: if we've already tried all candidates, set placeholder and stop
        if (idx >= candidates.length) {
          img.removeEventListener('error', handleError);
          clearSrcsetAndSources(img);
          img.src = INLINE_PLACEHOLDER;
          img.classList.add('img-broken');
          img.dataset.fallbackAttached = 'true';
          return;
        }

        var candidate = candidates[idx];
        img.dataset.fallbackIndex = String(idx + 1);

        // if candidate resolves to the same URL already loaded, skip to next
        var resolvedCurrent = resolveUrl(img.src || '', img);
        if (candidate && candidate !== resolvedCurrent) {
          // remove the handler first so we don't create a loop on the same src
          img.removeEventListener('error', handleError);
          clearSrcsetAndSources(img);
          img.src = candidate;
          // reattach handler in case the candidate fails too
          img.addEventListener('error', handleError);
        } else {
          // try next candidate
          handleError();
        }
      }

      img.addEventListener('error', handleError);
      // mark as attached so we don't attach twice
      img.dataset.fallbackAttached = 'false';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachHandlers);
  } else {
    attachHandlers();
  }
})();
