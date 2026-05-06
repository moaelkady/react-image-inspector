import type { ViewerMedia } from "../components/ImageInspector/types";

export const sampleGallery: ViewerMedia[] = [
  {
    id: "bridge",
    src: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1400&q=80",
    alt: "Bridge over mountain valley",
    title: "Landscape",
  },
  {
    id: "city",
    src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=80",
    alt: "Aerial city skyline",
    title: "City",
  },
  {
    id: "forest",
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
    alt: "Forest mountains",
    title: "Forest",
  },
  {
    id: "demo-video",
    type: "video",
    src: "",
    poster:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
    title: "Video sample",
    downloadName: "selfie.mp4",
  },
];
