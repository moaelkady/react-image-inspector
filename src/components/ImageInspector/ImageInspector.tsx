import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import dashIcon from '../../assets/icons/dash.svg'
import plusIcon from '../../assets/icons/plus.svg'
import zoomInIcon from '../../assets/icons/zoom-in.svg'
import { resolveLabelSet } from './constants'
import { EmptyState } from './EmptyState'
import { ImageStage } from './ImageStage'
import { ThumbnailStrip } from './ThumbnailStrip'
import { Toolbar } from './Toolbar'
import { useImageTransform } from './useImageTransform'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import { useMagnifierLens } from './useMagnifierLens'
import { useResolvedMediaSrc } from './useResolvedMediaSrc'
import {
  normalizeImages,
  resolveFeatures,
  resolveInitialIndex,
  resolveNumericConfig,
} from './utils'
import type { ImageInspectorProps } from './types'
import './ImageInspector.css'

export function ImageInspector(props: ImageInspectorProps) {
  const images = useMemo(
    () => normalizeImages({ src: props.src, alt: props.alt, images: props.images }),
    [props.alt, props.images, props.src],
  )

  const labels = useMemo(() => resolveLabelSet(props.labels), [props.labels])
  const numeric = useMemo(
    () =>
      resolveNumericConfig({
        minZoom: props.minZoom,
        maxZoom: props.maxZoom,
        zoomStep: props.zoomStep,
        initialZoom: props.initialZoom,
        lensSize: props.lensSize,
        lensZoom: props.lensZoom,
        onError: props.onError,
      }),
    [props.initialZoom, props.lensSize, props.lensZoom, props.maxZoom, props.minZoom, props.onError, props.zoomStep],
  )

  const features = useMemo(
    () => resolveFeatures(props.features, images.length, props.showToolbar, props.showThumbnails),
    [images.length, props.features, props.showThumbnails, props.showToolbar],
  )

  const [activeIndex, setActiveIndex] = useState(() => resolveInitialIndex(props.initialIndex, images.length))
  const [isTouchDevice] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    if (typeof window.matchMedia !== 'function') return false
    return Boolean(window.matchMedia('(pointer: coarse)')?.matches)
  })

  useEffect(() => {
    if (images.length === 0) {
      props.onError?.({ type: 'empty-source', message: 'No valid image source was provided.' })
    }
  }, [images.length, props])

  const safeActiveIndex = resolveInitialIndex(activeIndex, images.length)
  const activeMedia = images[safeActiveIndex]
  const isVideo = activeMedia?.type === 'video'
  const rootRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const stageHoveredRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const [brokenImageIndex, setBrokenImageIndex] = useState<number | null>(null)
  const hasBrokenMedia = brokenImageIndex === safeActiveIndex
  const displayImages = images

  const transform = useImageTransform({
    minZoom: numeric.minZoom,
    maxZoom: numeric.maxZoom,
    zoomStep: numeric.zoomStep,
    initialZoom: numeric.initialZoom,
    onTransformChange: props.onTransformChange,
  })
  const { resetAll, zoomIn, zoomOut } = transform

  useEffect(() => {
    resetAll()
  }, [resetAll, safeActiveIndex])

  const mediaFeatures = isVideo
    ? {
        ...features,
        zoom: false,
        zoomIn: false,
        zoomOut: false,
        resetZoom: false,
        wheelZoom: false,
        doubleClickZoom: false,
        rotate: false,
        rotateLeft: false,
        rotateRight: false,
        flip: false,
        flipHorizontal: false,
        flipVertical: false,
        resetAll: false,
        magnifier: false,
        dragPan: false,
      }
    : features

  const lens = useMagnifierLens(mediaFeatures.magnifier, transform.state, numeric.lensSize, isTouchDevice, isDragging)

  const handleResolveError = useCallback(
    (message: string, media: (typeof images)[number]) => {
      props.onError?.({
        type: 'media-resolve-error',
        message,
        image: media,
      })
    },
    [props],
  )

  useEffect(() => {
    const onWindowWheel = (event: WheelEvent) => {
      if (!stageHoveredRef.current) return
      event.preventDefault()
      if (!mediaFeatures.wheelZoom) return
      if (event.deltaY < 0) zoomIn()
      else zoomOut()
    }

    window.addEventListener('wheel', onWindowWheel, { passive: false, capture: true })
    return () => window.removeEventListener('wheel', onWindowWheel, { capture: true })
  }, [mediaFeatures.wheelZoom, zoomIn, zoomOut])

  const { resolvedSrc: resolvedActiveSrc, isObjectUrl } = useResolvedMediaSrc({
    media: activeMedia,
    onResolveError: handleResolveError,
  })

  const canNavigate = images.length > 1
  const showZoomControl = mediaFeatures.toolbar && mediaFeatures.zoom
  const zoomRange = numeric.maxZoom - numeric.minZoom || 1
  const zoomPercent = ((transform.state.zoom - numeric.minZoom) / zoomRange) * 100
  const toolbarFeatures = showZoomControl ? { ...mediaFeatures, zoomIn: false, zoomOut: false } : mediaFeatures
  const rootStyle = {
    '--rii-primary': props.primaryColor || '#38bdf8',
    '--rii-lens-shimmer-start': props.lensShimmerColors?.start || '#0ce89d',
    '--rii-lens-shimmer-end': props.lensShimmerColors?.end || '#00a3ff',
  } as CSSProperties
  const zoomSliderStyle = { '--rii-zoom-percent': `${zoomPercent}%` } as CSSProperties

  const emitActiveMediaLoadError = useCallback(
    (type: 'image' | 'video') => {
      const isVideoType = type === 'video'
      props.onError?.({
        type: isVideoType ? 'video-load-error' : 'image-load-error',
        message: isVideoType ? 'The active video failed to load.' : 'The active image failed to load.',
        image: activeMedia,
      })
    },
    [activeMedia, props],
  )

  const downloadHref = isObjectUrl ? resolvedActiveSrc : activeMedia?.src

  useKeyboardShortcuts(rootRef, {
    enabled: features.keyboardShortcuts,
    onNext: () => setActiveIndex((index) => (index + 1) % images.length),
    onPrevious: () => setActiveIndex((index) => (index - 1 + images.length) % images.length),
    onZoomIn: transform.zoomIn,
    onZoomOut: transform.zoomOut,
    onResetZoom: transform.resetZoom,
    onRotateRight: transform.rotateRight,
    onRotateLeft: transform.rotateLeft,
    onFlipHorizontal: transform.flipHorizontal,
    onFlipVertical: transform.flipVertical,
    onEscape: () => {
      if (!isVideo) lens.hideLens()
    },
    canNavigate,
    canZoom: mediaFeatures.zoom,
    canRotate: mediaFeatures.rotate,
    canFlipHorizontal: mediaFeatures.flipHorizontal,
    canFlipVertical: mediaFeatures.flipVertical,
  })

  if (!activeMedia) {
    return (
      <div className={`rii ${props.className ?? ''}`.trim()} data-theme={props.theme ?? 'system'}>
        <EmptyState message="No image available. Provide `src` or `images` with valid entries." />
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className={`rii ${props.className ?? ''}`.trim()}
      data-theme={props.theme ?? 'system'}
      tabIndex={0}
      style={rootStyle}
      aria-label={isVideo ? labels.video : labels.image}
    >
      {hasBrokenMedia ? (
        <EmptyState message={isVideo ? 'Unable to load this video.' : 'Unable to load this image.'} isError />
      ) : (
        <ImageStage
          images={displayImages}
          activeIndex={safeActiveIndex}
          resolvedActiveSrc={resolvedActiveSrc}
          imageClassName={props.imageClassName}
          lensClassName={props.lensClassName}
          transform={transform.state}
          pan={transform.pan}
          stageRef={stageRef}
          imageRef={imageRef}
          lens={{
            enabled: mediaFeatures.magnifier && lens.canRenderLens,
            visible: lens.isVisible,
            x: lens.point.x,
            y: lens.point.y,
            lensSize: numeric.lensSize,
            lensZoom: numeric.lensZoom,
          }}
          onPointerEnter={() => {
            stageHoveredRef.current = true
            lens.showLens()
          }}
          onPointerMove={(event) => {
            if (!stageRef.current) return
            if (isDragging && dragStartRef.current) {
              const nextPan = {
                x: dragStartRef.current.panX + (event.clientX - dragStartRef.current.x),
                y: dragStartRef.current.panY + (event.clientY - dragStartRef.current.y),
              }
              const clamped = transform.clampPan(nextPan, {
                width: stageRef.current.clientWidth,
                height: stageRef.current.clientHeight,
              })
              transform.setPan(clamped)
              return
            }
            lens.moveLens(event, stageRef.current, imageRef.current)
          }}
          onPointerLeave={() => {
            stageHoveredRef.current = false
            setIsDragging(false)
            dragStartRef.current = null
            lens.hideLens()
          }}
          onDoubleClick={() => {
            if (!mediaFeatures.doubleClickZoom) return
            if (transform.state.zoom === numeric.initialZoom) {
              transform.setZoom(transform.state.zoom + numeric.zoomStep * 2)
            } else {
              transform.resetZoom()
            }
          }}
          onPointerDown={(event) => {
            if (!mediaFeatures.dragPan || transform.state.zoom <= numeric.initialZoom) return
            if (!stageRef.current) return
            setIsDragging(true)
            lens.hideLens()
            dragStartRef.current = {
              x: event.clientX,
              y: event.clientY,
              panX: transform.pan.x,
              panY: transform.pan.y,
            }
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerUp={() => {
            setIsDragging(false)
            dragStartRef.current = null
          }}
          onError={(type) => {
            setBrokenImageIndex(safeActiveIndex)
            emitActiveMediaLoadError(type)
          }}
        />
      )}

      <Toolbar
        features={toolbarFeatures}
        labels={labels}
        className={props.toolbarClassName}
        disabled={{
          zoomIn: !transform.canZoomIn,
          zoomOut: !transform.canZoomOut,
          resetZoom: !transform.canResetZoom,
          resetAll: !transform.hasActiveTransforms,
        }}
        handlers={{
          zoomIn: transform.zoomIn,
          zoomOut: transform.zoomOut,
          resetZoom: transform.resetZoom,
          rotateLeft: transform.rotateLeft,
          rotateRight: transform.rotateRight,
          flipHorizontal: transform.flipHorizontal,
          flipVertical: transform.flipVertical,
          resetAll: () => {
            transform.resetAll()
            lens.hideLens()
          },
        }}
      />
      {showZoomControl ? (
        <div className="rii__zoom-control" aria-label="Zoom controls">
          <button
            type="button"
            className="rii__zoom-icon-button"
            onClick={transform.zoomOut}
            aria-label={labels.zoomOut}
            disabled={!transform.canZoomOut || !mediaFeatures.zoomOut}
          >
            <img src={dashIcon} alt="" aria-hidden="true" />
          </button>
          <div className="rii__zoom-slider-wrap">
            <input
              type="range"
              className="rii__zoom-slider"
              min={numeric.minZoom}
              max={numeric.maxZoom}
              step={numeric.zoomStep}
              value={transform.state.zoom}
              onChange={(event) => transform.setZoom(Number(event.target.value))}
              aria-label="Zoom level"
              disabled={!mediaFeatures.zoom}
              style={zoomSliderStyle}
            />
          </div>
          <button
            type="button"
            className="rii__zoom-icon-button"
            onClick={transform.zoomIn}
            aria-label={labels.zoomIn}
            disabled={!transform.canZoomIn || !mediaFeatures.zoomIn}
          >
            <img src={plusIcon} alt="" aria-hidden="true" />
          </button>
          <span className="rii__zoom-search-icon" aria-hidden="true">
            <img src={zoomInIcon} alt="" />
          </span>
        </div>
      ) : null}

      {isVideo && mediaFeatures.videoDownload && downloadHref ? (
        <div className="rii__video-actions">
          <a
            className="rii__button rii__video-download"
            href={downloadHref}
            download={activeMedia.downloadName}
            aria-label={labels.downloadVideo}
          >
            <span aria-hidden="true">↓</span>
            <span className="rii__button-text">{labels.downloadVideo}</span>
          </a>
        </div>
      ) : null}

      {features.thumbnails ? (
        <ThumbnailStrip
          images={displayImages}
          activeIndex={safeActiveIndex}
          className={props.thumbnailClassName}
          thumbnailClassName={props.thumbnailClassName}
          labelPrefix={labels.thumbnail}
          onSelect={(index) => {
            setActiveIndex(index)
            setBrokenImageIndex(null)
            props.onImageChange?.(index, images[index])
          }}
        />
      ) : null}
    </div>
  )
}
