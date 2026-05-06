import type {
  ImageInspectorFeatures,
  ImageInspectorLabels,
  ResolvedImageInspectorFeatures,
  ViewerTransformState,
} from './types'

export const DEFAULT_FEATURES: ResolvedImageInspectorFeatures = {
  toolbar: true,
  thumbnails: true,
  zoom: true,
  zoomIn: true,
  zoomOut: true,
  resetZoom: true,
  wheelZoom: true,
  doubleClickZoom: true,
  rotate: true,
  rotateLeft: true,
  rotateRight: true,
  flip: true,
  flipHorizontal: true,
  flipVertical: true,
  resetAll: true,
  magnifier: true,
  dragPan: true,
  keyboardShortcuts: true,
  touchGestures: true,
  videoDownload: true,
}

export const DEFAULT_LABELS: Required<ImageInspectorLabels> = {
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  resetZoom: 'Reset zoom',
  rotateLeft: 'Rotate left',
  rotateRight: 'Rotate right',
  flipHorizontal: 'Flip horizontal',
  flipVertical: 'Flip vertical',
  resetAll: 'Reset all',
  previousImage: 'Previous image',
  nextImage: 'Next image',
  thumbnail: 'Thumbnail',
  image: 'Image preview',
  video: 'Video preview',
  downloadVideo: 'Download video',
}

export const DEFAULT_TRANSFORM: ViewerTransformState = {
  zoom: 1,
  rotation: 0,
  flipX: false,
  flipY: false,
}

export const DEFAULT_NUMERIC_CONFIG = {
  zoomStep: 0.2,
  minZoom: 1,
  maxZoom: 4,
  initialZoom: 1,
  lensSize: 180,
  lensZoom: 2.5,
}

export const TOOLBAR_ACTIONS: Array<{
  key:
    | 'zoomIn'
    | 'zoomOut'
    | 'resetZoom'
    | 'rotateLeft'
    | 'rotateRight'
    | 'flipHorizontal'
    | 'flipVertical'
    | 'resetAll'
  icon: string
}> = [
  { key: 'zoomIn', icon: '+' },
  { key: 'zoomOut', icon: '-' },
  { key: 'resetZoom', icon: '100%' },
  { key: 'rotateLeft', icon: '⟲' },
  { key: 'rotateRight', icon: '⟳' },
  { key: 'flipHorizontal', icon: '⇋' },
  { key: 'flipVertical', icon: '⇅' },
  { key: 'resetAll', icon: '↺' },
]

export function resolveLabelSet(labels?: ImageInspectorLabels): Required<ImageInspectorLabels> {
  return { ...DEFAULT_LABELS, ...labels }
}

export function mergeRawFeatures(features?: ImageInspectorFeatures): ResolvedImageInspectorFeatures {
  return { ...DEFAULT_FEATURES, ...features }
}
