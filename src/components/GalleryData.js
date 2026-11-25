import { galleryFor as baseGalleryFor } from '../data/site.js'
import { mergeGalleryPhotos, resolveInspirationPhotos } from './galleryModel.js'

const images = import.meta.glob('../assets/images/services/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, query: '?url', import: 'default' })
const manifests = import.meta.glob('../assets/images/services/*/manifest.json', { eager: true, import: 'default' })

const inspirationBySlug = Object.fromEntries(Object.entries(manifests).map(([path, manifest]) => {
  const prefix = path.slice(0, path.lastIndexOf('/') + 1)
  const assets = Object.fromEntries(Object.entries(images)
    .filter(([p]) => p.startsWith(prefix))
    .map(([p, url]) => [p.slice(prefix.length), url]))
  return [manifest.service, resolveInspirationPhotos(manifest.images, assets)]
}))

export function galleryFor(slug) {
  const base = baseGalleryFor(slug)
  const real = [
    ...base.s.map((src, index) => ({ src, thumbnail: src, alt: `${base.t} project photo ${index + 1}` })),
    ...Object.entries(images)
      .filter(([path]) => path.includes(`/services/${slug}/real/`) && !path.includes('/thumbnails/'))
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([path, src]) => ({ src, thumbnail: src, alt: `${base.t} project, ${path.split('/').pop().replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')}` })),
  ]
  const photos = mergeGalleryPhotos(real, inspirationBySlug[slug] ?? [])
  return { ...base, photos, s: photos.map((photo) => photo.src) }
}
