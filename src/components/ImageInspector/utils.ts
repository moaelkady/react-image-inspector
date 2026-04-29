import { DEFAULT_NUMERIC_CONFIG, mergeRawFeatures } from './constants'
import type {
  ImageInspectorError,
  ImageInspectorFeatures,
  ResolvedImageInspectorFeatures,
  ViewerImage,
} from './types'

const warnedMessages = new Set<string>()

export function isDevWarning(message: string): void {
  if (!import.meta.env.DEV || warnedMessages.has(message)) return
  warnedMessages.add(message)
  console.warn(`[react-image-inspector] ${message}`)
}

export function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function normalizeRotation(value: number): number {
  const normalized = value % 360
  return normalized < 0 ? normalized + 360 : normalized
}

export function normalizeImages(input: { src?: string; alt?: string; images?: ViewerImage[] }): ViewerImage[] {
  const normalizedFromImages = Array.isArray(input.images)
    ? input.images.filter((item): item is ViewerImage => Boolean(item?.src?.trim()))
    : []

  if (normalizedFromImages.length > 0) {
    if (input.src) {
      isDevWarning('Both `images` and `src` were provided; `images` takes precedence.')
    }
    return normalizedFromImages
  }

  if (input.src?.trim()) {
    return [{ src: input.src.trim(), alt: input.alt }]
  }

  return []
}

export function resolveInitialIndex(initialIndex: number | undefined, imageCount: number): number {
  if (imageCount <= 0) return 0
  if (!Number.isFinite(initialIndex)) return 0
  return clampNumber(Math.floor(initialIndex as number), 0, imageCount - 1)
}

export function resolveFeatures(
  features?: ImageInspectorFeatures,
  imageCount = 0,
  showToolbar?: boolean,
  showThumbnails?: boolean,
): ResolvedImageInspectorFeatures {
  const merged = mergeRawFeatures(features)
  const explicitToolbar = features?.toolbar
  const explicitThumbnails = features?.thumbnails

  merged.toolbar = explicitToolbar ?? showToolbar ?? merged.toolbar
  merged.thumbnails = explicitThumbnails ?? showThumbnails ?? merged.thumbnails

  if (imageCount <= 1 && showThumbnails !== true && explicitThumbnails === undefined) {
    merged.thumbnails = false
  }

  if (!merged.zoom) {
    merged.zoomIn = false
    merged.zoomOut = false
    merged.resetZoom = false
    merged.wheelZoom = false
    merged.doubleClickZoom = false
  }

  if (!merged.rotate) {
    merged.rotateLeft = false
    merged.rotateRight = false
  }

  if (!merged.flip) {
    merged.flipHorizontal = false
    merged.flipVertical = false
  }

  return merged
}

export function resolveNumericConfig(config: {
  minZoom?: number
  maxZoom?: number
  zoomStep?: number
  initialZoom?: number
  lensSize?: number
  lensZoom?: number
  onError?: (error: ImageInspectorError) => void
}): {
  minZoom: number
  maxZoom: number
  zoomStep: number
  initialZoom: number
  lensSize: number
  lensZoom: number
} {
  let minZoom = Number.isFinite(config.minZoom) ? (config.minZoom as number) : DEFAULT_NUMERIC_CONFIG.minZoom
  let maxZoom = Number.isFinite(config.maxZoom) ? (config.maxZoom as number) : DEFAULT_NUMERIC_CONFIG.maxZoom
  if (minZoom <= 0) minZoom = DEFAULT_NUMERIC_CONFIG.minZoom
  if (maxZoom <= 0) maxZoom = DEFAULT_NUMERIC_CONFIG.maxZoom

  if (minZoom > maxZoom) {
    ;[minZoom, maxZoom] = [maxZoom, minZoom]
    config.onError?.({
      type: 'invalid-prop',
      message: 'minZoom was greater than maxZoom. Values were safely swapped.',
    })
  }

  const zoomStep =
    Number.isFinite(config.zoomStep) && (config.zoomStep as number) > 0
      ? (config.zoomStep as number)
      : DEFAULT_NUMERIC_CONFIG.zoomStep

  const initialZoomCandidate = Number.isFinite(config.initialZoom)
    ? (config.initialZoom as number)
    : DEFAULT_NUMERIC_CONFIG.initialZoom

  const initialZoom = clampNumber(initialZoomCandidate, minZoom, maxZoom)
  const lensSize =
    Number.isFinite(config.lensSize) && (config.lensSize as number) > 48
      ? (config.lensSize as number)
      : DEFAULT_NUMERIC_CONFIG.lensSize
  const lensZoom =
    Number.isFinite(config.lensZoom) && (config.lensZoom as number) > 1
      ? (config.lensZoom as number)
      : DEFAULT_NUMERIC_CONFIG.lensZoom

  return { minZoom, maxZoom, zoomStep, initialZoom, lensSize, lensZoom }
}
