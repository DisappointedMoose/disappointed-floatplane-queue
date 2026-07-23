# <img src="./assets/icon-48.png" alt="Disappointed Floatplane Queue icon" width="48" height="48"> Disappointed Floatplane Queue

[![Mozilla Add-on](https://img.shields.io/amo/v/disappointed-floatplane-queue.svg)](https://addons.mozilla.org/de/firefox/addon/disappointed-floatplane-queue/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-blue.svg)](./manifest.json)

A lightweight Firefox/Chrome browser extension that adds a watch queue
(playlist) with autoplay to [floatplane.com](https://www.floatplane.com/).

Floatplane doesn't offer a built-in "add to queue and play through" feature —
this extension bolts one on entirely client-side, with no server, account, or
external dependency involved.

> **Note:** This is an unofficial, community-made browser extension. It is
> not affiliated with, endorsed by, or supported by Floatplane Media Inc.

> **Note:** Development and testing has focused on Firefox. The extension is
> written against the cross-browser `browser`/`chrome` APIs and *should* work
> the same way in Chrome and other Chromium-based browsers, but this hasn't
> been verified yet — feedback and bug reports from Chrome users are welcome.

## Features

- **Add videos to a queue** — a `+` button is injected onto every video tile
  on channel and listing pages, plus on the video page itself.
- **Floating queue panel** — a collapsible panel overlaid on the page shows
  the current queue, lets you jump to any entry, and clears the whole queue.
- **Reorderable queue** — drag and drop entries in the panel to change the
  playback order.
- **Autoplay** — when a video ends, the extension automatically advances to
  the next item in the queue.
- **Configurable behavior** via the panel's settings menu:
  - Remove a video from the queue automatically once it finishes.
  - Always restart queued videos from the beginning instead of resuming
    where you last left off.
- Queue and settings are persisted locally in the browser (`storage.local`),
  so they survive page reloads and browser restarts.

## Installation

### Firefox (from addons.mozilla.org)

The easiest way to install on Firefox is through the official listing on
addons.mozilla.org (AMO):

**[Disappointed Floatplane Queue on AMO](https://addons.mozilla.org/de/firefox/addon/disappointed-floatplane-queue/)**

Click **Add to Firefox** on that page — this gives you automatic updates and
doesn't require developer mode or manual packaging.

This project isn't (yet) published on the Chrome Web Store. In the meantime
it can be installed manually there, or on Firefox as a temporary/unpacked
add-on if you want to run from source.

### Firefox (temporary install)

1. Download or clone this repository.
2. Open `about:debugging#/runtime/this-firefox` in Firefox.
3. Click **Load Temporary Add-on…**.
4. Select the `manifest.json` file in the repository.

Note that temporary add-ons are removed when Firefox is closed and need to be
reloaded each session. For a persistent install without going through AMO,
package it yourself (see [Building](#building)) and install the resulting
`.zip` through `about:addons` → gear icon → **Install Add-on From File…**
(this requires Firefox to allow unsigned extensions, e.g. Firefox Developer
Edition/Nightly). For a normal release build of Firefox, installing
[from AMO](#firefox-from-addonsmozillaorg) is the simplest option since the
add-on is already signed there.

### Chrome / Chromium-based browsers (unpacked)

1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the repository folder.

## Enabling autoplay in your browser

The extension's autoplay feature (automatically advancing to the next queued
video) relies on the browser actually allowing `floatplane.com` to autoplay
video and audio. Most browsers block autoplay-with-sound by default, which
will prevent this extension from advancing the queue on its own.

### Firefox

1. Go to `about:preferences#privacy`.
2. Scroll down to **Permissions** and click **Settings…** next to
   **Autoplay**.
3. Either set **Default for all websites** to **Allow Audio and Video**, or
   add `https://www.floatplane.com` as a site-specific exception set to
   **Allow Audio and Video**.

See Mozilla's support article
[Allow or block media autoplay in Firefox](https://support.mozilla.org/en-US/kb/block-autoplay)
for more detail and screenshots.

### Chrome / Chromium-based browsers

1. Visit `https://www.floatplane.com/` and click the lock/tune icon left of
   the address bar.
2. Open **Site settings**.
3. Set the **Sound** permission to **Allow** (Chrome ties autoplay-with-sound
   to this permission).

## Usage

1. Browse to a Floatplane channel, creator page, or the home feed.
2. Click the `+` button on a video tile (or on the video page itself) to add
   it to the queue.
3. Open the **Queue** panel (bottom-right floating widget) to see and manage
   what's queued up.
4. Drag and drop entries in the panel to reorder the queue.
5. Play any video in your queue — when it ends, the extension automatically
   loads the next one.
6. Use the gear icon in the queue panel to toggle auto-remove-on-finish and
   restart-from-beginning behavior.

## Building

There's no bundler or package manager involved — the extension is a set of
plain scripts run directly by the browser. `build.sh` just zips up the
distributable files:

```bash
./build.sh
```

This produces `dist/disappointed-floatplane-queue-v<version>.zip`, excluding
development-only files (`.git`, `.idea`, `.claude`, `reference/`, docs,
etc.), ready for submission to an extension store or manual installation.

## Development

See [`CLAUDE.md`](./CLAUDE.md) for a detailed breakdown of the module
architecture. In short: it's plain ES5-ish IIFE modules with no build step,
all attached to a shared `window.FPQueue` global, loaded in dependency order
via `manifest.json`.

There's currently no linter or test suite;
To test changes manually, load the repository as a temporary/unpacked
extension (see [Installation](#installation)) and visit a Floatplane channel
or video page.

## Contributing

Issues and pull requests are welcome. If you're adding or changing DOM
scraping logic, please check [`CLAUDE.md`](./CLAUDE.md) and try to match on stable attributes
(`aria-label`, semantic structure) rather than Floatplane's hashed CSS module
class names, since those might change between deployments.

## License

Distributed under the [MIT License](./LICENSE).


Inspired by the [Floatplane Queue](https://addons.mozilla.org/de/firefox/addon/floatplane-queue/)
add-on, which stopped working correctly — this is a ground-up rewrite to
bring that functionality back.