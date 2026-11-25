import { galleryFor as baseGalleryFor } from '../data/site.js'
import inspirationManifest from '../assets/images/services/swimming-pool-construction/manifest.json'
import { mergeGalleryPhotos, resolveInspirationPhotos } from './galleryModel.js'

const images = import.meta.glob('../assets/images/services/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, query: '?url', import: 'default' })
const inspirationPrefix = '../assets/images/services/swimming-pool-construction/'
const inspirationAssets = Object.fromEntries(Object.entries(images)
  .filter(([path]) => path.startsWith(inspirationPrefix))
  .map(([path, url]) => [path.slice(inspirationPrefix.length), url]))
const inspiration = resolveInspirationPhotos(inspirationManifest.images, inspirationAssets)

export function galleryFor(slug) {
  const base = baseGalleryFor(slug)
  // Existing project folders remain authoritative. New real photos may also
  // be placed in services/<slug>/real/; the numbered designs stay separate.
  const real = [
    ...base.s.map((src, index) => ({ src, thumbnail: src, alt: `${base.t} project photo ${index + 1}` })),
    ...Object.entries(images)
      .filter(([path]) => path.includes(`/services/${slug}/real/`) && !path.includes('/thumbnails/'))
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([path, src]) => ({ src, thumbnail: src, alt: `${base.t} project, ${path.split('/').pop().replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')}` })),
  ]
  const photos = mergeGalleryPhotos(real, slug === inspirationManifest.service ? inspiration : [])
  return { ...base, photos, s: photos.map((photo) => photo.src) }
}
