(function () {
  "use strict";

  window.FPQueue = window.FPQueue || {};
  const FPQueue = window.FPQueue;

  // ---------------------------------------------------------------------
  // Floating queue panel: DOM construction and icons
  // ---------------------------------------------------------------------

  function createSvgIcon(paths, size) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    paths.forEach(([x1, y1, x2, y2]) => {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", String(x1));
      line.setAttribute("y1", String(y1));
      line.setAttribute("x2", String(x2));
      line.setAttribute("y2", String(y2));
      svg.appendChild(line);
    });
    return svg;
  }

  function createListIcon() {
    return createSvgIcon(
      [
        [3, 6, 21, 6],
        [3, 12, 21, 12],
        [3, 18, 21, 18],
      ],
      18
    );
  }

  function createPlusIcon() {
    return createSvgIcon(
      [
        [12, 5, 12, 19],
        [5, 12, 19, 12],
      ],
      16
    );
  }

  function createMinusIcon() {
    return createSvgIcon([[5, 12, 19, 12]], 16);
  }

  // Fetches the actual assets/cog.svg file and inlines it so its `fill` can
  // be recolored to currentColor (an <img src="..."> can't be restyled this
  // way, and would keep the file's hardcoded black).
  function loadCogIcon(button) {
    const api = typeof browser !== "undefined" ? browser : chrome;
    fetch(api.runtime.getURL("assets/cog.svg"))
      .then((res) => res.text())
      .then((svgText) => {
        const svg = new DOMParser()
          .parseFromString(svgText, "image/svg+xml")
          .querySelector("svg");
        if (!svg) return;
        svg.setAttribute("width", "16");
        svg.setAttribute("height", "16");
        svg.setAttribute("fill", "currentColor");
        svg
          .querySelectorAll("[fill]")
          .forEach((el) => el.setAttribute("fill", "currentColor"));
        button.appendChild(svg);
      })
      .catch(() => {});
  }

  function build() {
    if (document.getElementById("fp-queue-container")) return;

    const container = document.createElement("div");
    container.id = "fp-queue-container";
    container.className = "fp-queue-glass fp-queue-collapsed";
    container.style.display = "none";

    const toggle = document.createElement("div");
    toggle.id = "fp-queue-toggle";

    const toggleLeft = document.createElement("div");
    toggleLeft.className = "fp-queue-toggle-left";
    toggleLeft.appendChild(createListIcon());
    const label = document.createElement("span");
    label.textContent = "Queue";
    toggleLeft.appendChild(label);

    const count = document.createElement("span");
    count.id = "fp-queue-count";
    count.className = "fp-queue-badge";
    count.textContent = "-/0";

    const settingsBtn = document.createElement("button");
    settingsBtn.id = "fp-queue-settings-btn";
    settingsBtn.type = "button";
    settingsBtn.title = "Settings";
    loadCogIcon(settingsBtn);

    const toggleRight = document.createElement("div");
    toggleRight.className = "fp-queue-toggle-right";
    toggleRight.appendChild(count);
    toggleRight.appendChild(settingsBtn);

    toggle.appendChild(toggleLeft);
    toggle.appendChild(toggleRight);
    toggle.addEventListener("click", () => {
      container.classList.toggle("fp-queue-collapsed");
    });

    const settingsMenu = document.createElement("div");
    settingsMenu.id = "fp-queue-settings-menu";
    settingsMenu.className = "fp-queue-glass fp-queue-settings-closed";

    const autoRemoveRow = document.createElement("label");
    autoRemoveRow.className = "fp-queue-settings-row";
    const autoRemoveCheckbox = document.createElement("input");
    autoRemoveCheckbox.type = "checkbox";
    autoRemoveCheckbox.id = "fp-queue-setting-auto-remove";
    autoRemoveRow.appendChild(autoRemoveCheckbox);
    autoRemoveRow.appendChild(
      document.createTextNode("Remove video from queue when it finishes")
    );

    const restartRow = document.createElement("label");
    restartRow.className = "fp-queue-settings-row";
    const restartCheckbox = document.createElement("input");
    restartCheckbox.type = "checkbox";
    restartCheckbox.id = "fp-queue-setting-restart";
    restartRow.appendChild(restartCheckbox);
    restartRow.appendChild(
      document.createTextNode("Always restart videos from the beginning")
    );

    settingsMenu.appendChild(autoRemoveRow);
    settingsMenu.appendChild(restartRow);

    const content = document.createElement("div");
    content.id = "fp-queue-content";

    const header = document.createElement("div");
    header.className = "fp-queue-header";
    const h3 = document.createElement("h3");
    h3.textContent = "Up Next";

    const navBtns = document.createElement("div");
    navBtns.className = "fp-queue-nav-btns";

    const clearBtn = document.createElement("button");
    clearBtn.className = "fp-queue-text-btn";
    clearBtn.textContent = "Clear";
    clearBtn.addEventListener("click", () => FPQueue.queueActions.clear());

    navBtns.appendChild(clearBtn);

    header.appendChild(h3);
    header.appendChild(navBtns);

    const list = document.createElement("div");
    list.id = "fp-queue-list";

    content.appendChild(header);
    content.appendChild(list);

    container.appendChild(toggle);
    container.appendChild(settingsMenu);
    container.appendChild(content);

    document.body.appendChild(container);
  }

  FPQueue.panel = { build, createListIcon, createPlusIcon, createMinusIcon };
})();
