export type ViewerImage = {
  src: string
  alt?: string
  title?: string
  thumbnailSrc?: string
  id?: string | number
}

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
}

export type ImageInspectorError = {
  type: 'empty-source' | 'image-load-error' | 'invalid-prop'
  message: string
  image?: ViewerImage
}

export type ImageInspectorProps = {
  src?: string
  alt?: string
  images?: ViewerImage[]
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
  onImageChange?: (index: number, image: ViewerImage) => void
  onTransformChange?: (state: ViewerTransformState) => void
  onError?: (error: ImageInspectorError) => void
}

export type ResolvedImageInspectorFeatures = Required<ImageInspectorFeatures>

export type ResolvedLabels = Required<ImageInspectorLabels>
