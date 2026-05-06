import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImageInspector } from './ImageInspector'

const SIGNED_URL =
  'https://example.com/front.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=demo%2F20260504%2Ffsn1%2Fs3%2Faws4_request&X-Amz-Date=20260504T144303Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=demo-signature'
const SIGNED_VIDEO_URL =
  'https://example.com/selfie.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=demo%2F20260506%2Ffsn1%2Fs3%2Faws4_request&X-Amz-Date=20260506T080408Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=demo-signature'
const flush = async () => {
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
}

describe('ImageInspector', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not prefetch signed image URLs and keeps direct source', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)

    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await act(async () => {
      root.render(<ImageInspector src={SIGNED_URL} />)
      await flush()
    })

    expect(fetchMock).not.toHaveBeenCalled()

    const image = host.querySelector('.rii__image') as HTMLImageElement | null
    expect(image).not.toBeNull()
    expect(image?.getAttribute('src')).toBe(SIGNED_URL)

    await act(async () => {
      root.unmount()
      await flush()
    })

  })

  it('renders video slides without image-only controls and shows download button', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)

    await act(async () => {
      root.render(
        <ImageInspector
          images={[
            {
              type: 'video',
              src: 'https://cdn.example.com/video.mp4',
              title: 'KYC selfie',
              downloadName: 'selfie.mp4',
            },
          ]}
        />,
      )
      await flush()
    })

    const video = host.querySelector('.rii__video') as HTMLVideoElement | null
    expect(video).not.toBeNull()
    expect(video?.getAttribute('controls')).not.toBeNull()

    expect(host.querySelector('.rii__zoom-control')).toBeNull()

    const downloadButton = host.querySelector('.rii__video-download') as HTMLAnchorElement | null
    expect(downloadButton).not.toBeNull()
    expect(downloadButton?.getAttribute('download')).toBe('selfie.mp4')
    expect(downloadButton?.getAttribute('href')).toBe('https://cdn.example.com/video.mp4')

    await act(async () => {
      root.unmount()
      await flush()
    })
  })

  it('does not prefetch signed video URLs and uses direct source for playback/download', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)

    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await act(async () => {
      root.render(<ImageInspector images={[{ type: 'video', src: SIGNED_VIDEO_URL }]} />)
      await flush()
    })

    expect(fetchMock).not.toHaveBeenCalled()

    const video = host.querySelector('.rii__video') as HTMLVideoElement | null
    expect(video?.getAttribute('src')).toBe(SIGNED_VIDEO_URL)

    const downloadButton = host.querySelector('.rii__video-download') as HTMLAnchorElement | null
    expect(downloadButton?.getAttribute('href')).toBe(SIGNED_VIDEO_URL)

    await act(async () => {
      root.unmount()
      await flush()
    })

  })
})
