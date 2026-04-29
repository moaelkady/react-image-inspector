import { ImageInspector } from './index'
import { sampleGallery } from './demo/sampleImages'

const singleImage = sampleGallery[0]

function App() {
  return (
    <main style={{ margin: '0 auto', maxWidth: 1100, padding: '1rem', display: 'grid', gap: '1rem' }}>
      <h1 style={{ margin: 0 }}>react-image-inspector demo</h1>

      <section>
        <h2>Basic single image</h2>
        <ImageInspector src={singleImage.src} alt={singleImage.alt} />
      </section>

      <section>
        <h2>Gallery with thumbnails</h2>
        <ImageInspector images={sampleGallery} />
      </section>

      <section>
        <h2>Dark theme</h2>
        <ImageInspector images={sampleGallery} theme="dark" />
      </section>

      <section>
        <h2>Light theme with custom primary color</h2>
        <ImageInspector images={sampleGallery} theme="light" primaryColor="#14b8a6" />
      </section>

      <section>
        <h2>System theme with disabled tools</h2>
        <ImageInspector
          images={sampleGallery}
          theme="system"
          features={{ magnifier: false, flipVertical: false, rotateLeft: false }}
        />
      </section>

      <section>
        <h2>Single image without thumbnails</h2>
        <ImageInspector src={singleImage.src} showThumbnails={false} />
      </section>
    </main>
  )
}

export default App
