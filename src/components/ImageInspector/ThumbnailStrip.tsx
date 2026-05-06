import { useEffect, useRef } from 'react'
import type { ViewerMedia } from './types'

type ThumbnailStripProps = {
  images: ViewerMedia[]
  activeIndex: number
  onSelect: (index: number) => void
  labelPrefix: string
  className?: string
  thumbnailClassName?: string
}

export function ThumbnailStrip({
  images,
  activeIndex,
  onSelect,
  labelPrefix,
  className,
  thumbnailClassName,
}: ThumbnailStripProps) {
  const activeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    activeButtonRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [activeIndex])

  return (
    <div className={`rii__thumbnail-strip ${className ?? ''}`.trim()}>
      {images.map((image, index) => {
        const active = index === activeIndex
        return (
          <button
            key={image.id ?? `${image.src}-${index}`}
            ref={active ? activeButtonRef : null}
            type="button"
            className={`rii__thumbnail ${thumbnailClassName ?? ''}`.trim()}
            onClick={() => onSelect(index)}
            aria-label={`${labelPrefix} ${index + 1}`}
            aria-current={active ? 'true' : undefined}
            data-active={active}
          >
            <img
              src={image.thumbnailSrc || image.poster || image.src}
              alt={image.alt ?? `Thumbnail ${index + 1}`}
              loading="lazy"
            />
            {image.type === 'video' ? <span className="rii__thumbnail-badge">Video</span> : null}
          </button>
        )
      })}
    </div>
  )
}
