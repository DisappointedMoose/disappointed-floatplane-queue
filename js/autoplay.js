(function () {
  "use strict";

  window.FPQueue = window.FPQueue || {};
  const FPQueue = window.FPQueue;

  // ---------------------------------------------------------------------
  // Autoplay: advance when the video ends, and resume playback
  // after navigating to a queued video
  // ---------------------------------------------------------------------

  let autoplayIntervalId = null;

  FPQueue.state.onInvalidate(() => {
    if (autoplayIntervalId) {
      clearInterval(autoplayIntervalId);
      autoplayIntervalId = null;
    }
  });

  function onVideoEnded() {
    const state = FPQueue.state;
    if (!state.contextValid) return;
    state.load().then(() => {
      if (!state.contextValid) return;
      if (state.currentIndex < state.queue.length - 1) {
        const next = state.queue[state.currentIndex + 1];
        FPQueue.utils.showToast(`Up Next: ${next.title}`);
        setTimeout(() => {
          if (!state.contextValid) return;
          if (state.autoRemoveOnFinish) {
            FPQueue.queueActions.remove(state.currentIndex);
            FPQueue.queueActions.playAt(state.currentIndex);
          } else {
            FPQueue.queueActions.playAt(state.currentIndex + 1);
          }
        }, 1500);
      } else {
        if (state.autoRemoveOnFinish) {
          FPQueue.queueActions.remove(state.currentIndex);
        }
        FPQueue.utils.showToast("Queue complete!");
      }
    });
  }

  function start() {
    autoplayIntervalId = setInterval(() => {
      if (!FPQueue.state.contextValid) return;
      const video = document.querySelector("video");
      if (!video || video.dataset.fpQueueAutoplay) return;
      video.dataset.fpQueueAutoplay = "true";
      video.addEventListener("ended", onVideoEnded);
    }, 2000);
  }

  function clickPlayButton() {
    const selectors = [
      '[class*="play"]',
      'button[aria-label*="play"]',
      ".vjs-big-play-button",
      '[class*="PlayButton"]',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        el.click();
        return;
      }
    }
  }

  function forceVideoToStart(video) {
    const reset = () => {
      if (video.currentTime > 0.5) video.currentTime = 0;
    };
    if (video.readyState >= 1) {
      reset();
    } else {
      video.addEventListener("loadedmetadata", reset, { once: true });
    }
  }

  function attemptPlay(attempt) {
    const state = FPQueue.state;
    if (!state.contextValid || attempt >= 10) return;
    const video = document.querySelector("video");
    if (video) {
      if (state.forceRestart) {
        state.forceRestart = false;
        state.save();
        forceVideoToStart(video);
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch(() => clickPlayButton());
      }
      return;
    }
    setTimeout(() => attemptPlay(attempt + 1), 500);
  }

  function tryResumePlayback() {
    const postId = FPQueue.utils.getPostIdFromUrl(location.href);
    if (!postId || FPQueue.state.queue.length === 0) return;
    setTimeout(() => attemptPlay(0), 1000);
  }

  FPQueue.autoplay = { start, tryResumePlayback };
})();
