# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Firefox/Chrome browser extension (Manifest V3) called "Disappointed Floatplane Queue". It adds a
watch queue (playlist) with autoplay to floatplane.com via content scripts — there is no background
script, popup, or options page. Everything runs in the page context on `*.floatplane.com`.

## Commands

- `./build.sh` — packages the extension into `dist/disappointed-floatplane-queue-v<version>.zip`
  (version read from `manifest.json`), excluding dev files (`.idea`, `.claude`, `.git`, `reference`,
  `build.sh`, `*.md`, existing zips). This is the only build step; there is no bundler, transpiler,
  package.json, or test suite.
- `node --check js/<file>.js` — quick syntax check for a single content script (no other tooling
  exists to lint/typecheck this repo).
- Loading for manual testing: load the repo directory as a temporary unpacked extension
  (`about:debugging` in Firefox, or `chrome://extensions` with Developer Mode in Chrome), then visit
  a floatplane.com channel or post page.

## Architecture

Plain ES5-ish IIFE modules (no build step, no imports/exports) all attached to a single shared
global, `window.FPQueue`, each module claiming its own key (e.g. `FPQueue.state`, `FPQueue.render`).
`manifest.json` lists the content scripts in dependency order — this order matters and must be
preserved when adding files:

```
storage.js → state.js → utils.js → panel.js → settings.js → render.js
→ queue-actions.js → tile-buttons.js → page-sync.js → autoplay.js → main.js
```

### Module responsibilities

- **storage.js** — promise-based wrapper around `browser.storage.local` / `chrome.storage.local`
  (Firefox exposes the promise-based `browser` API directly; Chrome needs callback→promise
  adapting). All persistence goes through this.
- **state.js** — the single in-memory source of truth (`FPQueue.state`): the queue array,
  `currentIndex`, user settings (`autoRemoveOnFinish`, `restartFromBeginning`), and `forceRestart`
  (a one-shot flag set before navigating to a queued video so the next page load seeks to 0:00
  instead of honoring Floatplane's own resume position). Also owns extension-context-invalidation
  handling: `state.contextValid` flips false and registered `onInvalidate` handlers fire when a
  storage call fails (e.g. after the extension reloads/updates while a tab is still open). Any
  module running a timer/interval must register an `onInvalidate` cleanup (see autoplay.js).
- **utils.js** — small shared helpers: parsing a post ID out of a floatplane URL, `navigate`, and
  the toast notification (`#fp-queue-notification`).
- **panel.js** — builds the floating queue panel DOM (`#fp-queue-container`) and its icons; pure
  construction, no state logic.
- **settings.js** — the gear-icon settings dropdown: open/close and wiring its checkboxes to
  `FPQueue.state`.
- **render.js** — all DOM updates driven by state: `FPQueue.render.all()` is the one function that
  re-syncs the whole UI (panel visibility, queue list, tile add/remove button states, settings
  checkboxes) and is called after essentially every state mutation.
- **queue-actions.js** — the only place that mutates `state.queue`/`state.currentIndex`
  (add/remove/reorder/clear/playAt); every mutator calls `state.save()` then `FPQueue.render.*`.
- **tile-buttons.js** — injects "Add to Queue" (+/−) buttons onto video tiles on channel/listing
  pages. Tile detection and field scraping (title/thumbnail/duration/subchannel) is done by
  heuristics over Floatplane's DOM (see below) since there's no API access, driven by a
  `MutationObserver` (debounced 500ms) because tiles load in dynamically.
- **page-sync.js** — logic specific to the video-watch page: keeps `currentIndex` in sync when the
  user navigates directly to a queued video's URL, and injects the page-level add/remove button
  into the video's action button row.
- **autoplay.js** — watches for the `<video>` element and its `ended` event (polled every 2s since
  the player mounts asynchronously), advances to the next queue item on end (respecting
  `autoRemoveOnFinish`), and on page load retries `video.play()` (with a play-button-click fallback
  for autoplay-blocked browsers) up to 10 times, honoring `forceRestart`.
- **main.js** — the only entry point; wires DOMContentLoaded → build panel → load state → page-sync
  + resume playback → start tile observer → start autoplay watcher.

### Scraping Floatplane's DOM

Floatplane's frontend has hashed CSS-module class names that change between deployments (e.g.
`_buttonContainer_o776g_73`). Prefer matching on the stable, human-authored substring via
`[class*="..."]`, or better, on stable attributes like `aria-label` (see
`findVideoActionsContainer` in page-sync.js). `reference/channelpage.html` and
`reference/videopage.html` are saved DOM snapshots of Floatplane's real pages — consult them when
adjusting scraping selectors instead of guessing; they are excluded from git and from the build.

### Storage keys

Persisted under `browser.storage.local` as flat keys: `fp_queue`, `fp_queue_index`,
`fp_force_restart`, `fp_auto_remove_on_finish`, `fp_restart_from_beginning`. Keep `state.js`'s
`load()`/`save()` in sync if adding new persisted fields.
