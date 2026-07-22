(function () {
  "use strict";

  window.FPQueue = window.FPQueue || {};
  const FPQueue = window.FPQueue;

  // ---------------------------------------------------------------------
  // "Add to Queue" buttons on video tiles
  // ---------------------------------------------------------------------

  let tileScanTimeoutId = null;

  function elementHasBackgroundImage(el) {
    const bg = el.style.backgroundImage;
    return !!bg && bg !== "none";
  }

  function tileLooksLikeMediaLink(root) {
    if (root.querySelector("img")) return true;
    const all = root.querySelectorAll("*");
    for (const el of all) {
      if (elementHasBackgroundImage(el)) return true;
    }
    return elementHasBackgroundImage(root);
  }

  function extractBackgroundUrl(el) {
    const bg = el.style.backgroundImage;
    if (!bg || bg === "none") return null;
    const match = bg.match(/url\((['"]?)(.*?)\1\)/);
    return match ? match[2] : null;
  }

  function extractThumbnail(tile) {
    const img = tile.querySelector("img");
    if (img && img.src) return img.src;
    const divs = tile.querySelectorAll("div");
    for (const div of divs) {
      const url = extractBackgroundUrl(div);
      if (url) return url;
    }
    return "";
  }

  function extractTitle(tile, anchor, postId) {
    const candidates = tile.querySelectorAll(`a[href*="${postId}"]`);
    for (const candidate of candidates) {
      if (tileLooksLikeMediaLink(candidate)) continue;
      const text = (candidate.innerText || candidate.textContent || "").trim();
      if (!text) continue;
      if (/^\d+:\d+$/.test(text)) continue;
      if (text.startsWith("Duration:")) continue;
      return text;
    }

    const fallbackEl = tile.querySelector(
      'h1, h2, h3, h4, [class*="title"], [class*="Title"]'
    );
    if (fallbackEl) {
      const text = (
        fallbackEl.innerText || fallbackEl.textContent || ""
      ).trim();
      if (text && !/^\d+:\d+$/.test(text) && !text.startsWith("Duration:")) {
        return text;
      }
    }

    return "Unknown Video";
  }

  function extractDuration(tile, anchor) {
    const selectors = ['[class*="duration"]', '[class*="Duration"]'];
    for (const container of [tile, anchor]) {
      for (const sel of selectors) {
        const el = container.querySelector(sel);
        if (el) {
          const text = (el.innerText || el.textContent || "").trim();
          const match = text.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
          if (match) return match[1];
        }
      }
    }
    return "";
  }

  function extractSubchannel(tile) {
    const el = tile.querySelector(
      'a[class*="channelName"], [class*="channelName"]'
    );
    return el ? (el.innerText || el.textContent || "").trim() : "";
  }

  function extractVideoInfoFromTile(anchor, tile, postId) {
    return {
      id: postId,
      url: anchor.href,
      title: extractTitle(tile, anchor, postId),
      thumbnail: extractThumbnail(tile),
      duration: extractDuration(tile, anchor),
      subchannel: extractSubchannel(tile),
    };
  }

  function injectAddButton(tile, anchor, postId) {
    const btn = document.createElement("div");
    btn.className = "fp-queue-add-btn";
    btn.dataset.postId = postId;
    FPQueue.render.setAddButtonState(
      btn,
      FPQueue.state.queue.some((v) => v.id === postId)
    );

    const stop = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
    };

    btn.addEventListener("mousedown", stop);
    btn.addEventListener("click", (ev) => {
      stop(ev);
      const existingIdx = FPQueue.state.queue.findIndex(
        (v) => v.id === postId
      );
      if (existingIdx !== -1) {
        const removedTitle = FPQueue.state.queue[existingIdx].title;
        FPQueue.queueActions.remove(existingIdx);
        FPQueue.utils.showToast(`Removed from Queue: ${removedTitle}`);
        return;
      }
      const video = extractVideoInfoFromTile(anchor, tile, postId);
      FPQueue.queueActions.add(video, { silent: false, setAsCurrent: false });
    });

    tile.appendChild(btn);
  }

  function scanAndInjectAddButtons() {
    FPQueue.pageSync.scanAndInjectPageAddButton();

    const anchors = document.querySelectorAll('a[href^="/post/"]');
    const seenThisPass = new Set();

    anchors.forEach((anchor) => {
      if (!tileLooksLikeMediaLink(anchor)) return;

      const postId = FPQueue.utils.getPostIdFromUrl(anchor.href);
      if (!postId || seenThisPass.has(postId)) return;
      seenThisPass.add(postId);

      let tile = anchor;
      if (getComputedStyle(anchor).position === "static") {
        const ancestorDiv = anchor.closest("div");
        if (ancestorDiv) tile = ancestorDiv;
      }

      if (tile.dataset.fpQueueProcessed) return;
      tile.dataset.fpQueueProcessed = "true";
      tile.style.position = "relative";
      injectAddButton(tile, anchor, postId);
    });
  }

  function startObserver() {
    scanAndInjectAddButtons();
    const observer = new MutationObserver(() => {
      if (tileScanTimeoutId) clearTimeout(tileScanTimeoutId);
      tileScanTimeoutId = setTimeout(scanAndInjectAddButtons, 500);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  FPQueue.tileButtons = { startObserver };
})();
