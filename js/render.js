(function () {
  "use strict";

  window.FPQueue = window.FPQueue || {};
  const FPQueue = window.FPQueue;

  // ---------------------------------------------------------------------
  // Rendering: panel visibility, queue list, and add-button state
  // ---------------------------------------------------------------------

  function all() {
    updatePanelVisibility();
    renderQueueList();
    updateTileButtonStates();
    FPQueue.settings.syncCheckboxes();
  }

  function setAddButtonState(btn, inQueue) {
    btn.innerHTML = "";
    btn.appendChild(
      inQueue ? FPQueue.panel.createMinusIcon() : FPQueue.panel.createPlusIcon()
    );
    btn.classList.toggle("in-queue", inQueue);
    btn.title = inQueue ? "Remove from Queue" : "Add to Queue";
  }

  function updateTileButtonStates() {
    const queueIds = new Set(FPQueue.state.queue.map((v) => v.id));
    document.querySelectorAll(".fp-queue-add-btn").forEach((btn) => {
      setAddButtonState(btn, queueIds.has(btn.dataset.postId));
    });
  }

  function updatePanelVisibility() {
    const container = document.getElementById("fp-queue-container");
    const count = document.getElementById("fp-queue-count");
    if (!container || !count) return;

    const { queue, currentIndex } = FPQueue.state;

    if (queue.length === 0) {
      container.style.display = "none";
      container.classList.add("fp-queue-collapsed");
    } else {
      container.style.display = "flex";
    }

    count.textContent =
      queue.length === 0
        ? "-/0"
        : `${currentIndex >= 0 ? currentIndex + 1 : "-"}/${queue.length}`;
  }

  function renderQueueList() {
    const list = document.getElementById("fp-queue-list");
    if (!list) return;
    list.innerHTML = "";

    const { queue, currentIndex } = FPQueue.state;

    queue.forEach((video, idx) => {
      const item = document.createElement("div");
      item.className =
        "fp-queue-item" + (idx === currentIndex ? " current" : "");
      item.draggable = true;

      const thumb = document.createElement("div");
      thumb.className = "fp-queue-item-thumb";
      if (video.thumbnail) {
        thumb.style.backgroundImage = `url(${video.thumbnail})`;
      }
      if (idx === currentIndex) {
        const indicator = document.createElement("div");
        indicator.className = "fp-queue-playing-indicator";
        indicator.textContent = "▶";
        thumb.appendChild(indicator);
      }

      const info = document.createElement("div");
      info.className = "fp-queue-item-info";

      const titleEl = document.createElement("div");
      titleEl.className = "fp-queue-item-title";
      const rank = document.createElement("span");
      rank.className = "fp-queue-rank";
      rank.textContent = `${idx + 1}. `;
      titleEl.appendChild(rank);
      titleEl.appendChild(document.createTextNode(video.title || ""));

      const meta = document.createElement("div");
      meta.className = "fp-queue-item-meta";
      const metaParts = [];
      if (video.subchannel) metaParts.push(video.subchannel);
      if (video.duration) metaParts.push(video.duration);
      meta.textContent = metaParts.join(" • ");

      info.appendChild(titleEl);
      info.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "fp-queue-actions";
      const removeBtn = document.createElement("button");
      removeBtn.className = "fp-queue-remove";
      removeBtn.title = "Remove";
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        FPQueue.queueActions.remove(idx);
      });
      actions.appendChild(removeBtn);

      item.appendChild(thumb);
      item.appendChild(info);
      item.appendChild(actions);

      item.addEventListener("click", () => {
        FPQueue.queueActions.playAt(idx);
      });

      item.addEventListener("dragstart", (ev) => {
        ev.dataTransfer.setData("text/plain", String(idx));
      });
      item.addEventListener("dragover", (ev) => {
        ev.preventDefault();
      });
      item.addEventListener("drop", (ev) => {
        ev.preventDefault();
        const sourceIdx = parseInt(ev.dataTransfer.getData("text/plain"), 10);
        if (!Number.isNaN(sourceIdx)) {
          FPQueue.queueActions.reorder(sourceIdx, idx);
        }
      });

      list.appendChild(item);
    });
  }

  FPQueue.render = {
    all,
    setAddButtonState,
    updateTileButtonStates,
    updatePanelVisibility,
    renderQueueList,
  };
})();
