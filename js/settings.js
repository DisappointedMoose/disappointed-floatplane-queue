(function () {
  "use strict";

  window.FPQueue = window.FPQueue || {};
  const FPQueue = window.FPQueue;

  // ---------------------------------------------------------------------
  // Settings dropdown: open/close and wiring checkboxes to state
  // ---------------------------------------------------------------------

  function closeMenu() {
    const menu = document.getElementById("fp-queue-settings-menu");
    if (!menu) return;
    menu.classList.add("fp-queue-settings-closed");
    document.removeEventListener("click", onOutsideClick);
  }

  function onOutsideClick(ev) {
    const menu = document.getElementById("fp-queue-settings-menu");
    const btn = document.getElementById("fp-queue-settings-btn");
    if (!menu || !btn) return;
    if (menu.contains(ev.target) || btn.contains(ev.target)) return;
    closeMenu();
  }

  function toggleMenu() {
    const menu = document.getElementById("fp-queue-settings-menu");
    if (!menu) return;
    const willOpen = menu.classList.contains("fp-queue-settings-closed");
    menu.classList.toggle("fp-queue-settings-closed");
    if (willOpen) {
      document.addEventListener("click", onOutsideClick);
    } else {
      document.removeEventListener("click", onOutsideClick);
    }
  }

  function syncCheckboxes() {
    const autoRemove = document.getElementById("fp-queue-setting-auto-remove");
    const restart = document.getElementById("fp-queue-setting-restart");
    if (autoRemove) autoRemove.checked = FPQueue.state.autoRemoveOnFinish;
    if (restart) restart.checked = FPQueue.state.restartFromBeginning;
  }

  function init() {
    const btn = document.getElementById("fp-queue-settings-btn");
    if (btn) {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        toggleMenu();
      });
    }

    const autoRemove = document.getElementById("fp-queue-setting-auto-remove");
    if (autoRemove) {
      autoRemove.addEventListener("click", (ev) => ev.stopPropagation());
      autoRemove.addEventListener("change", () => {
        FPQueue.state.autoRemoveOnFinish = autoRemove.checked;
        FPQueue.state.save();
      });
    }

    const restart = document.getElementById("fp-queue-setting-restart");
    if (restart) {
      restart.addEventListener("click", (ev) => ev.stopPropagation());
      restart.addEventListener("change", () => {
        FPQueue.state.restartFromBeginning = restart.checked;
        FPQueue.state.save();
      });
    }
  }

  FPQueue.settings = { init, syncCheckboxes };
})();
