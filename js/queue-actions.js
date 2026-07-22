(function () {
  "use strict";

  window.FPQueue = window.FPQueue || {};
  const FPQueue = window.FPQueue;

  // ---------------------------------------------------------------------
  // Queue mutation and navigation
  // ---------------------------------------------------------------------

  function add(video, opts) {
    const silent = !!(opts && opts.silent);
    const setAsCurrent = !!(opts && opts.setAsCurrent);
    const state = FPQueue.state;

    const existingIdx = state.queue.findIndex((v) => v.id === video.id);
    if (existingIdx !== -1) {
      if (setAsCurrent) {
        state.currentIndex = existingIdx;
        state.save();
        FPQueue.render.all();
        if (!silent)
          FPQueue.utils.showToast(
            `Now Playing: ${state.queue[existingIdx].title}`
          );
      } else if (!silent) {
        FPQueue.utils.showToast("Already in Queue");
      }
      return;
    }

    state.queue.push(video);
    if (setAsCurrent) {
      state.currentIndex = state.queue.length - 1;
    }
    state.save();
    FPQueue.render.all();
    if (!silent) FPQueue.utils.showToast(`Added to Queue: ${video.title}`);
  }

  function remove(idx) {
    const state = FPQueue.state;
    const wasLast = idx === state.queue.length - 1;
    state.queue.splice(idx, 1);
    if (idx < state.currentIndex) {
      state.currentIndex -= 1;
    } else if (idx === state.currentIndex && wasLast) {
      state.currentIndex = state.queue.length - 1;
    }
    state.save();
    FPQueue.render.all();
  }

  function reorder(sourceIdx, targetIdx) {
    const state = FPQueue.state;
    if (
      sourceIdx === targetIdx ||
      sourceIdx < 0 ||
      sourceIdx >= state.queue.length ||
      targetIdx < 0 ||
      targetIdx >= state.queue.length
    ) {
      return;
    }
    const draggedIsCurrent = sourceIdx === state.currentIndex;
    const [item] = state.queue.splice(sourceIdx, 1);
    state.queue.splice(targetIdx, 0, item);

    if (draggedIsCurrent) {
      state.currentIndex = targetIdx;
    } else if (
      sourceIdx < state.currentIndex &&
      state.currentIndex <= targetIdx
    ) {
      state.currentIndex -= 1;
    } else if (
      targetIdx <= state.currentIndex &&
      state.currentIndex < sourceIdx
    ) {
      state.currentIndex += 1;
    }

    state.save();
    FPQueue.render.renderQueueList();
  }

  function clear() {
    const state = FPQueue.state;
    state.queue = [];
    state.currentIndex = -1;
    state.save();
    FPQueue.render.all();
  }

  function playAt(idx) {
    const state = FPQueue.state;
    state.currentIndex = idx;
    state.forceRestart = state.restartFromBeginning;
    state.save();
    FPQueue.utils.navigate(state.queue[idx].url);
  }

  FPQueue.queueActions = {
    add,
    remove,
    reorder,
    clear,
    playAt,
  };
})();
