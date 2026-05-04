import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
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
    return window.matchMedia('(pointer: coarse)').matches
  })

  useEffect(() => {
    if (images.length === 0) {
      props.onError?.({ type: 'empty-source', message: 'No valid image source was provided.' })
    }
  }, [images.length, props])

  const safeActiveIndex = resolveInitialIndex(activeIndex, images.length)
  const activeImage = images[safeActiveIndex]
  const rootRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const stageHoveredRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const [brokenImageIndex, setBrokenImageIndex] = useState<number | null>(null)
  const [resolvedSrcByOriginal, setResolvedSrcByOriginal] = useState<Record<string, string>>({})
  const objectUrlByOriginalRef = useRef<Record<string, string>>({})
  const resolvingOriginalsRef = useRef<Record<string, boolean>>({})
  const hasBrokenImage = brokenImageIndex === safeActiveIndex
  const displayImages = useMemo(
    () =>
      images.map((image) => ({
        ...image,
        src: resolvedSrcByOriginal[image.src] ?? image.src,
      })),
    [images, resolvedSrcByOriginal],
  )

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

  useEffect(() => {
    const objectUrls = objectUrlByOriginalRef.current
    return () => {
      Object.values(objectUrls).forEach((url) => {
        URL.revokeObjectURL(url)
      })
    }
  }, [])

  useEffect(() => {
    const onWindowWheel = (event: WheelEvent) => {
      if (!stageHoveredRef.current) return
      event.preventDefault()
      if (!features.wheelZoom) return
      if (event.deltaY < 0) zoomIn()
      else zoomOut()
    }

    window.addEventListener('wheel', onWindowWheel, { passive: false, capture: true })
    return () => window.removeEventListener('wheel', onWindowWheel, { capture: true })
  }, [features.wheelZoom, zoomIn, zoomOut])

  const lens = useMagnifierLens(features.magnifier, transform.state, numeric.lensSize, isTouchDevice, isDragging)

  const canNavigate = images.length > 1
  const showZoomControl = features.toolbar && features.zoom
  const zoomRange = numeric.maxZoom - numeric.minZoom || 1
  const zoomPercent = ((transform.state.zoom - numeric.minZoom) / zoomRange) * 100
  const toolbarFeatures = showZoomControl ? { ...features, zoomIn: false, zoomOut: false } : features
  const rootStyle = { '--rii-primary': props.primaryColor || '#38bdf8' } as CSSProperties
  const zoomSliderStyle = { '--rii-zoom-percent': `${zoomPercent}%` } as CSSProperties

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
    onEscape: lens.hideLens,
    canNavigate,
    canZoom: features.zoom,
    canRotate: features.rotate,
    canFlipHorizontal: features.flipHorizontal,
    canFlipVertical: features.flipVertical,
  })

  if (!activeImage) {
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
      aria-label={labels.image}
    >
      {hasBrokenImage ? (
        <EmptyState message="Unable to load this image." isError />
      ) : (
        <ImageStage
          images={displayImages}
          activeIndex={safeActiveIndex}
          imageClassName={props.imageClassName}
          lensClassName={props.lensClassName}
          transform={transform.state}
          pan={transform.pan}
          stageRef={stageRef}
          imageRef={imageRef}
          lens={{
            enabled: features.magnifier && lens.canRenderLens,
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
            if (!features.doubleClickZoom) return
            if (transform.state.zoom === numeric.initialZoom) {
              transform.setZoom(transform.state.zoom + numeric.zoomStep * 2)
            } else {
              transform.resetZoom()
            }
          }}
          onPointerDown={(event) => {
            if (!features.dragPan || transform.state.zoom <= numeric.initialZoom) return
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
          onError={() => {
            const originalSrc = images[safeActiveIndex]?.src
            if (!originalSrc) {
              setBrokenImageIndex(safeActiveIndex)
              props.onError?.({
                type: 'image-load-error',
                message: 'The active image failed to load.',
                image: activeImage,
              })
              return
            }

            if (originalSrc.startsWith('blob:') || resolvingOriginalsRef.current[originalSrc]) {
              setBrokenImageIndex(safeActiveIndex)
              props.onError?.({
                type: 'image-load-error',
                message: 'The active image failed to load.',
                image: activeImage,
              })
              return
            }

            resolvingOriginalsRef.current[originalSrc] = true
            fetch(originalSrc)
              .then(async (response) => {
                if (!response.ok) {
                  throw new Error(`Fallback image fetch failed with status ${response.status}`)
                }
                const blob = await response.blob()
                const objectUrl = URL.createObjectURL(blob)
                const previous = objectUrlByOriginalRef.current[originalSrc]
                if (previous) {
                  URL.revokeObjectURL(previous)
                }
                objectUrlByOriginalRef.current[originalSrc] = objectUrl
                setResolvedSrcByOriginal((current) => ({
                  ...current,
                  [originalSrc]: objectUrl,
                }))
                setBrokenImageIndex((current) => (current === safeActiveIndex ? null : current))
              })
              .catch(() => {
                setBrokenImageIndex(safeActiveIndex)
                props.onError?.({
                  type: 'image-load-error',
                  message: 'The active image failed to load.',
                  image: activeImage,
                })
              })
              .finally(() => {
                delete resolvingOriginalsRef.current[originalSrc]
              })
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
            disabled={!transform.canZoomOut || !features.zoomOut}
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
              disabled={!features.zoom}
              style={zoomSliderStyle}
            />
          </div>
          <button
            type="button"
            className="rii__zoom-icon-button"
            onClick={transform.zoomIn}
            aria-label={labels.zoomIn}
            disabled={!transform.canZoomIn || !features.zoomIn}
          >
            <img src={plusIcon} alt="" aria-hidden="true" />
          </button>
          <span className="rii__zoom-search-icon" aria-hidden="true">
            <img src={zoomInIcon} alt="" />
          </span>
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
