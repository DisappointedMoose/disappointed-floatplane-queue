(function () {
  "use strict";

  window.FPQueue = window.FPQueue || {};
  const FPQueue = window.FPQueue;

  // ---------------------------------------------------------------------
  // The video page: current-index sync and the manual "Add to Queue"
  // button
  // ---------------------------------------------------------------------

  // The player's poster <img> is removed from the DOM once playback starts,
  // so it's only reliably readable right after the page loads. Cache it per
  // post as soon as we see it, and fall back to the cache once it's gone.
  const capturedPosters = {};

  function capturePoster(postId) {
    const posterImg = document.querySelector('img[class*="_poster_"]');
    const src = posterImg ? posterImg.getAttribute("src") || "" : "";
    if (src) capturedPosters[postId] = src;
  }

  function handlePostPageSync() {
    const postId = FPQueue.utils.getPostIdFromUrl(location.href);
    const state = FPQueue.state;
    if (!postId || state.queue.length === 0) return;

    const existingIdx = state.queue.findIndex((v) => v.id === postId);
    if (existingIdx !== -1 && state.currentIndex !== existingIdx) {
      state.currentIndex = existingIdx;
      state.save();
      FPQueue.render.all();
    }
  }

  function findVideoActionsContainer() {
    // Anchor on the Like button's aria-label, since it doesn't depend on
    // CSS-module class names that get a build-specific hashed suffix and can
    // change between Floatplane deployments.
    const likeBtn = document.querySelector('button[aria-label$="Likes"]');
    if (likeBtn && likeBtn.parentElement) return likeBtn.parentElement;
    // Fallback: match only the stable, human-authored part of the class
    // name, ignoring the hashed suffix (e.g. "_buttonContainer_o776g_73").
    return document.querySelector('[class*="_buttonContainer_"]');
  }

  function scrapeCurrentPageVideoInfo(postId) {
    const h1 = document.querySelector("h1");
    let title = h1 ? (h1.innerText || "").trim() : "";
    if (!title) title = (document.title || "").trim();
    title = title.replace(/^Floatplane - /, "").trim();
    if (!title) title = "Unknown Video";

    const ogImage = document.querySelector('meta[property="og:image"]');
    // The video page doesn't set og:image, so fall back to the player's
    // poster image (matched by the stable, human-authored part of the class
    // name, ignoring the hashed suffix, e.g. "_poster_1w4rv_1"), or to the
    // cached poster if playback has already removed it from the DOM.
    const posterImg = document.querySelector('img[class*="_poster_"]');
    const thumbnail = ogImage
      ? ogImage.getAttribute("content") || ""
      : posterImg
      ? posterImg.getAttribute("src") || ""
      : capturedPosters[postId] || "";

    return { id: postId, url: location.href, title, thumbnail, duration: "" };
  }

  function injectPageAddButton(container, postId) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fp-queue-add-btn fp-queue-page-btn";
    btn.dataset.postId = postId;
    FPQueue.render.setAddButtonState(
      btn,
      FPQueue.state.queue.some((v) => v.id === postId)
    );

    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const currentPostId = btn.dataset.postId;
      const existingIdx = FPQueue.state.queue.findIndex(
        (v) => v.id === currentPostId
      );
      if (existingIdx !== -1) {
        const removedTitle = FPQueue.state.queue[existingIdx].title;
        FPQueue.queueActions.remove(existingIdx);
        FPQueue.utils.showToast(`Removed from Queue: ${removedTitle}`);
        return;
      }
      const video = scrapeCurrentPageVideoInfo(currentPostId);
      FPQueue.queueActions.add(video, { silent: false, setAsCurrent: true });
    });

    container.appendChild(btn);
  }

  function scanAndInjectPageAddButton() {
    const postId = FPQueue.utils.getPostIdFromUrl(location.href);
    const existingBtn = document.querySelector(".fp-queue-page-btn");

    if (!postId) {
      if (existingBtn) existingBtn.remove();
      return;
    }

    capturePoster(postId);

    if (existingBtn) {
      if (existingBtn.dataset.postId !== postId) {
        existingBtn.dataset.postId = postId;
        FPQueue.render.setAddButtonState(
          existingBtn,
          FPQueue.state.queue.some((v) => v.id === postId)
        );
      }
      return;
    }

    const container = findVideoActionsContainer();
    if (!container) return;
    injectPageAddButton(container, postId);
  }

  FPQueue.pageSync = { handlePostPageSync, scanAndInjectPageAddButton };
})();
