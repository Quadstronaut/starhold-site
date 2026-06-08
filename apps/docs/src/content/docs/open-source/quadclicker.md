---
title: QuadClicker
description: A fast, native, open-source auto-clicker for Windows, macOS, and Linux — by Quadstronaut.
sidebar:
  order: 2
---

QuadClicker is a fast, native, open-source auto-clicker — fully configurable, scriptable via CLI, and built as a monorepo with three separate **native** applications. No cross-platform frameworks, ever.

| Platform | Stack |
|---|---|
| Windows | C# / .NET 10 — WPF |
| macOS | Swift — SwiftUI |
| Linux | C++ — Qt6 |

Source: [github.com/Quadstronaut/QuadClicker](https://github.com/Quadstronaut/QuadClicker) · MIT licensed

---

## Platform status

| Platform | Release status | Notes |
|---|---|---|
| Windows x64 | **v0.1.1 — shipped** | Self-contained single-file EXE, no .NET install required |
| macOS | **Unreleased** — code-complete, unverified | Never compiled or run; an Xcode-equipped Mac is required |
| Linux | **Unreleased** — build verified, no package yet | Verified on Ubuntu 24.04 (Qt 6.4.2); no `.deb` / AppImage published yet |

---

## Install

### Windows

Download `QuadClicker.exe` from [GitHub Releases](https://github.com/Quadstronaut/QuadClicker/releases/latest) and run it — no installer, no .NET runtime required (self-contained single-file build). Minimum OS: Windows 10 22H2.

**SmartScreen note:** The binary is currently unsigned. Windows SmartScreen will show "Windows protected your PC" on first launch. Click **More info → Run anyway**. An Authenticode certificate is in progress; see [CODE_SIGNING.md](https://github.com/Quadstronaut/QuadClicker/blob/master/CODE_SIGNING.md).

**Package managers (in flight — not yet published):**

| Channel | Command once live |
|---|---|
| Chocolatey | `choco install quadclicker` |
| Scoop | `scoop install quadclicker` |
| winget | `winget install Quadstronaut.QuadClicker` |

### macOS

No release yet. Planned: direct DMG download and a Homebrew cask. Accessibility permission will be required (for `CGEventPost` and global hotkeys).

### Linux

No package yet. Build from source — see the [Building-from-Source](https://github.com/Quadstronaut/QuadClicker/wiki/Building-from-Source) wiki page.

---

## Features

### Click rate

Choose **Delay** (how long to wait between clicks) or **Frequency** (clicks per unit of time) via radio button in the GUI. The CLI accepts free-form formats on either axis:

- Delay: `100ms`, `5s`, `2min`
- Frequency: `10/s`, `10cps`, `600/min`, `600cpm`, `60/h`, `60cph`, or a bare integer (interpreted as milliseconds)
- Bounds: 1 ms ≤ delay ≤ 360 min

### Mouse button and click type

Left, Right, or Middle — with Single or Double click. Double-click uses the OS double-click interval.

### Location modes

- **Current cursor** — click wherever the cursor is
- **Fixed XY** — set a coordinate (`--location x,y` in CLI, or type it in the GUI)
- **Visual picker** — click anywhere on screen in the GUI to capture coordinates

### Stop conditions

Stop after N clicks, after N seconds, or leave both unset for unlimited (manual stop or Ctrl+C in CLI).

### Idle detection

Set a system-idle threshold: QuadClicker waits until the system has been idle for N seconds before it starts clicking. Useful for background automation that shouldn't fire while you're actively using the machine.

### Hotkeys

Start and stop hotkeys are independently configurable, global (fire when the app is minimized), and persist with your settings.

**Platform notes:**

- **Windows** — Win32 `RegisterHotKey`; no special permissions required
- **macOS** — Requires Accessibility permission in System Settings; macOS status is unverified (code sourced from the Swift implementation)
- **Linux (X11)** — `XGrabKey` on X11; works on any X session
- **Linux (Wayland)** — Global hotkeys are **not supported**. `HotkeyManager` detects Wayland at startup and disables itself entirely. **There is no KDE D-Bus fallback** — the X11 path is the only implementation. Use the Start/Stop button or the system tray instead. XWayland does work (hotkeys function normally under XWayland's X11 compatibility layer)

### System tray and persistence

QuadClicker minimizes to the system tray. All settings are saved automatically on exit and restored on launch.

| Platform | Settings path |
|---|---|
| Windows | `%APPDATA%\QuadClicker\settings.json` |
| macOS | `~/Library/Application Support/QuadClicker/settings.json` |
| Linux | `~/.config/quadclicker/settings.json` |

---

## CLI quick reference

When any flag other than `--minimized`, `--no-update-check`, or `--post-update` is passed, QuadClicker runs headless with no GUI.

| Flag | Default | Description |
|---|---|---|
| `--rate <value>` | **required** | Click rate — see formats above |
| `--button <left\|right\|middle>` | `left` | Mouse button |
| `--type <single\|double>` | `single` | Click type |
| `--location <x,y>` | cursor | Fixed screen coordinate |
| `--stop-after-clicks <n>` | `0` (unlimited) | Stop after N clicks |
| `--stop-after-seconds <n>` | `0` (unlimited) | Stop after N seconds |
| `--idle-wait <n>` | `0` (disabled) | Wait for N seconds of system idle before starting |
| `--minimized` | off | Launch GUI minimized to tray (not CLI mode) |
| `--version` / `-v` | — | Print version and exit |
| `--help` / `-h` | — | Print usage and exit |

Exit codes: `0` success · `1` invalid argument · `2` runtime error · `130` Ctrl+C

**Examples:**

```
# Click at cursor, 10 times per second
quadclicker --rate 10/s

# Right-click at (500,300), stop after 100 clicks
quadclicker --rate 10/s --location 500,300 --button right --stop-after-clicks 100

# Double-click every 500 ms for 30 seconds
quadclicker --rate 500ms --type double --stop-after-seconds 30

# Click once every 5 minutes, 10 times total
quadclicker --rate 5min --stop-after-clicks 10
```

Full flag table, argument parsing edge cases, and Linux differences: [wiki CLI Reference](https://github.com/Quadstronaut/QuadClicker/wiki/CLI-Reference)

---

## Full documentation

The [QuadClicker wiki](https://github.com/Quadstronaut/QuadClicker/wiki) is the canonical deep reference:

- [Installation](https://github.com/Quadstronaut/QuadClicker/wiki/Installation)
- [Usage](https://github.com/Quadstronaut/QuadClicker/wiki/Usage)
- [CLI Reference](https://github.com/Quadstronaut/QuadClicker/wiki/CLI-Reference)
- [Click Rate Formats](https://github.com/Quadstronaut/QuadClicker/wiki/Click-Rate-Formats)
- [Hotkeys and Platform Notes](https://github.com/Quadstronaut/QuadClicker/wiki/Hotkeys-and-Platform-Notes)
- [Building from Source](https://github.com/Quadstronaut/QuadClicker/wiki/Building-from-Source)
- [Troubleshooting](https://github.com/Quadstronaut/QuadClicker/wiki/Troubleshooting)

---

## License and attribution

MIT licensed with an attribution clause: redistributions must retain credit to **Kyle Green (Quadstronaut)** and link back to the repository.

- [github.com/Quadstronaut/QuadClicker](https://github.com/Quadstronaut/QuadClicker) — source
- [Releases](https://github.com/Quadstronaut/QuadClicker/releases/latest) — downloads
- [Wiki](https://github.com/Quadstronaut/QuadClicker/wiki) — full documentation
