# react-image-inspector

A lightweight React + TypeScript image viewer/inspector package with zoom, rotation, flips, optional toolbar/thumbnails, theme support, and a magnifying lens.  
No external image-viewer dependency is used.

## Features

- Single image mode (`src`) and gallery mode (`images`)
- Zoom in/out/reset + wheel zoom + double-click zoom
- Rotate left/right, flip horizontal/vertical, reset all
- Optional magnifier lens
- Optional drag-to-pan while zoomed
- Optional toolbar and thumbnail strip
- Feature flags to hide/disable specific tools
- Light, dark, and system theme modes
- Custom `primaryColor`
- Keyboard-accessible controls and shortcuts
- Scoped CSS under `.rii` to avoid host-app style pollution

## Installation

```bash
npm install react-image-inspector
```

## Basic usage (single image)

```tsx
import { ImageInspector } from 'react-image-inspector'
import 'react-image-inspector/styles.css'

export function Example() {
  return <ImageInspector src="/document.png" alt="Document image" />
}
```

## Gallery usage

```tsx
import { ImageInspector } from 'react-image-inspector'
import 'react-image-inspector/styles.css'

const images = [
  { src: '/front.png', alt: 'Front side', title: 'Front side' },
  { src: '/back.png', alt: 'Back side', title: 'Back side' },
]

export function Example() {
  return <ImageInspector images={images} theme="dark" primaryColor="#14b8a6" />
}
```

## Disable tools/features

```tsx
<ImageInspector
  images={images}
  features={{
    magnifier: false,
    rotateLeft: false,
    flipVertical: false,
    thumbnails: false,
  }}
/>
```

## Theming

```tsx
<ImageInspector images={images} theme="light" />
<ImageInspector images={images} theme="dark" />
<ImageInspector images={images} theme="system" />
<ImageInspector images={images} primaryColor="#22c55e" />
```

## Props

- `src?: string` single-image source
- `alt?: string` single-image alt text
- `images?: ViewerImage[]` gallery images (takes precedence over `src`)
- `initialIndex?: number`
- `theme?: 'light' | 'dark' | 'system'` (default: `system`)
- `primaryColor?: string`
- `features?: ImageInspectorFeatures`
- `labels?: ImageInspectorLabels`
- `zoomStep?: number`, `minZoom?: number`, `maxZoom?: number`, `initialZoom?: number`
- `lensSize?: number`, `lensZoom?: number`
- `showThumbnails?: boolean`, `showToolbar?: boolean`
- `className?: string`, `imageClassName?: string`, `toolbarClassName?: string`, `thumbnailClassName?: string`, `lensClassName?: string`
- `onImageChange?: (index, image) => void`
- `onTransformChange?: (state) => void`
- `onError?: (error) => void`

## Feature flags

All features are enabled by default. Parent feature flags disable child actions:

- `zoom=false` disables `zoomIn`, `zoomOut`, `resetZoom`, `wheelZoom`, `doubleClickZoom`
- `rotate=false` disables `rotateLeft`, `rotateRight`
- `flip=false` disables `flipHorizontal`, `flipVertical`
- `dragPan=false` disables pointer drag-to-pan while zoomed

Toolbar and thumbnail aliases:

- `features.toolbar` overrides `showToolbar`
- `features.thumbnails` overrides `showThumbnails`
- Thumbnails auto-hide when only one image exists (unless `showThumbnails={true}`)
- Wheel zoom runs only on the image stage and prevents page scrolling while zooming

## Styling and CSS variables

All package styles are scoped under `.rii`.

Key CSS variables:

- `--rii-primary`
- `--rii-bg`
- `--rii-surface`
- `--rii-border`
- `--rii-text`
- `--rii-muted`
- `--rii-radius`
- `--rii-button-size`
- `--rii-thumbnail-size`
- `--rii-lens-size`

## Accessibility notes

- Controls use real `<button>` elements with `aria-label`s
- Viewer is keyboard-focusable (`tabIndex=0`)
- Keyboard shortcuts only run while focus is inside the viewer
- Thumbnails expose current state with `aria-current`
- Empty and error states are announced as status regions

## Known limitations

- Pinch-to-zoom is not implemented yet (future enhancement).
- Magnifier is intentionally hidden when image rotation or flip is active, because exact mapped lens behavior for transformed states is not implemented yet.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run typecheck
npm run build
```

## Local package testing (`npm pack`)

```bash
npm run build
npm pack
```

Then install the generated `.tgz` file in another React app:

```bash
npm install ../path/to/react-image-inspector-0.1.0.tgz
```

## Publishing checklist

- Update version in `package.json`
- Update `CHANGELOG.md`
- Run `npm run typecheck`
- Run `npm run build`
- Run `npm pack` and smoke test in a separate app
- Publish to npm

## Contributing

See `CONTRIBUTING.md`.

## License

MIT (see `LICENSE`)
