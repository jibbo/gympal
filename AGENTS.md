# Gym Pal - OpenCode Instructions

## Architecture

- **Single-file app**: All HTML, CSS and JS live in `index.html` (679 lines). There is no build step, no package manager, and no test framework.
- **PWA**: `manifest.json` enables standalone install on mobile (icons: `android_icon.png`, `ios_icon.png`).

## Key implementation notes

- **localStorage persistence**: Theme and sets are saved to `localStorage` under keys `"theme"` and `"sets"`. Code checks `typeof Storage !== "undefined"` before reading/writing.
- **iOS audio workaround**: Web Audio API on iOS requires user interaction to play a sound, then immediately mute it. The `audioToggle` button exists for this purpose (see `iphoneNote`). Do not remove it.
- **Themes**: Three themes switch CSS custom properties on `:root` (`--primaryColor`, `--accentColor`, `--buttonTextColor`). Default is `"green"`.

## Features (top-level section IDs)

| Section ID | Purpose |
|---|---|
| `output` | Sets counter (increment/reset, persisted) |
| `timer` | Active countdown timer with alarm sound and wake lock |
| `pinnedTimers` | Custom + standard rest timers (30s–3min presets) |
| `weights` | Beta weight tracker with canvas chart and total |
| `BarLoader` | Barbell loading calculator (total weight + percentage) |

## Assets

- Audio: `beep_short.ogg`, `digital_watch_alarm_long.ogg`
- Icons: `favicon.ico`, `android_icon.png`, `ios_icon.png`
