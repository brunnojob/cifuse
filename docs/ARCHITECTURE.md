# Architecture

`src/rules.js` contains ordered patterns and English/Portuguese messages. `src/engine.js` validates bounded input, strips ANSI sequences, redacts common secrets, classifies individual lines, groups signatures, compares a baseline, and serializes Markdown. It has no Node-specific imports.

`bin/cifuse.js` handles bounded file/stdin input, arguments and exit codes. `src/action.js` forwards arguments without shell interpolation and appends CLI output to the GitHub job summary. `site/app.js` uses the same engine and creates evidence DOM nodes with textContent. The only innerHTML updates are trusted, bundled interface translations.

`npm run build` copies the website and shared engine into `dist/`. GitHub Pages publishes only that directory after tests pass. CI tests Node 22/24 across Linux, macOS and Windows, plus the composite Action on Linux. No install step or lockfile is needed because there are no dependencies.

The project favors inspectable rules over generated diagnoses. Future directions should be justified by real fixtures: multiline diagnostics, pluggable rules and a stable schema for cross-run tooling. No promise of automatic repair is made.
