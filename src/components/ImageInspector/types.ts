export type ViewerMediaType = 'image' | 'video'

export type ViewerMedia = {
  src: string
  alt?: string
  title?: string
  thumbnailSrc?: string
  type?: ViewerMediaType
  poster?: string
  downloadName?: string
  id?: string | number
}

// Backward-compatible alias for existing consumers.
export type ViewerImage = ViewerMedia

export type ImageInspectorTheme = 'light' | 'dark' | 'system'

export type ViewerTransformState = {
  zoom: number
  rotation: number
  flipX: boolean
  flipY: boolean
}

export type ImageInspectorFeatures = {
  toolbar?: boolean
  thumbnails?: boolean
  zoom?: boolean
  zoomIn?: boolean
  zoomOut?: boolean
  resetZoom?: boolean
  wheelZoom?: boolean
  doubleClickZoom?: boolean
  rotate?: boolean
  rotateLeft?: boolean
  rotateRight?: boolean
  flip?: boolean
  flipHorizontal?: boolean
  flipVertical?: boolean
  resetAll?: boolean
  magnifier?: boolean
  dragPan?: boolean
  keyboardShortcuts?: boolean
  touchGestures?: boolean
  videoDownload?: boolean
}

export type ImageInspectorLabels = {
  zoomIn?: string
  zoomOut?: string
  resetZoom?: string
  rotateLeft?: string
  rotateRight?: string
  flipHorizontal?: string
  flipVertical?: string
  resetAll?: string
  previousImage?: string
  nextImage?: string
  thumbnail?: string
  image?: string
  video?: string
  downloadVideo?: string
}

export type ImageInspectorError = {
  type: 'empty-source' | 'image-load-error' | 'video-load-error' | 'invalid-prop' | 'media-resolve-error'
  message: string
  image?: ViewerMedia
}

export type ImageInspectorProps = {
  src?: string
  alt?: string
  images?: ViewerMedia[]
  initialIndex?: number
  theme?: ImageInspectorTheme
  primaryColor?: string
  features?: ImageInspectorFeatures
  labels?: ImageInspectorLabels
  zoomStep?: number
  minZoom?: number
  maxZoom?: number
  initialZoom?: number
  lensSize?: number
  lensZoom?: number
  showThumbnails?: boolean
  showToolbar?: boolean
  className?: string
  imageClassName?: string
  toolbarClassName?: string
  thumbnailClassName?: string
  lensClassName?: string
  lensShimmerColors?: {
    start: string
    end: string
  }
  onImageChange?: (index: number, image: ViewerMedia) => void
  onTransformChange?: (state: ViewerTransformState) => void
  onError?: (error: ImageInspectorError) => void
}

export type ResolvedImageInspectorFeatures = Required<ImageInspectorFeatures>

export type ResolvedLabels = Required<ImageInspectorLabels>
