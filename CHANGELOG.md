# Changelog

## 0.1.4

- Improve handling of signed/object-storage URLs by proactively resolving remote images to blob URLs and retrying on load error.
- Add component test coverage for signed URL rendering behavior in a jsdom Vitest environment.

## 0.1.3

- Add a fallback loader that retries failed image URLs via fetched blob object URLs.
- Improve compatibility with attachment-style object storage URLs in image gallery mode.

## 0.1.2

- Fix declaration output so `dist/index.d.ts` exports `ImageInspector` and public types.
- Move type generation to `tsc --emitDeclarationOnly` and run it after Vite build.
- Add declaration module shims for CSS/SVG and a dedicated `tsconfig.build.json`.

## 0.1.0

- Initial package release.
- Added single image and gallery support.
- Added zoom, rotate, flip, and reset tools.
- Added magnifying lens.
- Added feature flags.
- Added light, dark, and system themes.
- Added primary color customization.
