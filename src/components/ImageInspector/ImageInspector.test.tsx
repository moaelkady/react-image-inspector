import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImageInspector } from './ImageInspector'

const SIGNED_URL =
  'https://example.com/front.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=demo%2F20260504%2Ffsn1%2Fs3%2Faws4_request&X-Amz-Date=20260504T144303Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=demo-signature'
const flush = async () => {
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
}

describe('ImageInspector', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('resolves signed URLs to blob object URLs for rendering', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['fake image'], { type: 'image/jpeg' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const createObjectURLMock = vi.fn().mockReturnValue('blob:resolved-signed-image')
    const revokeObjectURLMock = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: createObjectURLMock,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: revokeObjectURLMock,
    })

    await act(async () => {
      root.render(<ImageInspector src={SIGNED_URL} />)
      await flush()
      await flush()
    })

    expect(fetchMock).toHaveBeenCalledWith(SIGNED_URL)

    const image = host.querySelector('.rii__image') as HTMLImageElement | null
    expect(image).not.toBeNull()
    expect(image?.getAttribute('src')).toContain('blob:resolved-signed-image')

    await act(async () => {
      root.unmount()
      await flush()
    })

    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:resolved-signed-image')
  })
})
