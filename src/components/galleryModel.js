// Classification is explicit: generated designs must never become "Our work".
export function mergeGalleryPhotos(realPhotos, inspirationPhotos) {
  const designSources = new Set(inspirationPhotos.map((photo) => photo.src))
  return [
    ...realPhotos.filter((photo) => !designSources.has(photo.src)).map((photo) => ({ ...photo, kind: 'work', label: 'Our work' })),
    ...inspirationPhotos.map((photo) => ({ ...photo, kind: 'inspiration', label: 'Design inspiration' })),
  ]
}

export function resolveInspirationPhotos(entries, assets) {
  return entries.map((entry) => {
    const src = assets[entry.file]
    const thumbnail = assets[entry.thumbnail]
    if (!src || !thumbnail || !entry.alt?.trim()) throw new Error(`Incomplete design inspiration: ${entry.file}`)
    return {
      src, thumbnail, alt: entry.alt, width: entry.width, height: entry.height,
      thumbnailWidth: entry.thumbnailWidth, thumbnailHeight: entry.thumbnailHeight,
      kind: 'inspiration', label: 'Design inspiration',
    }
  })
}

export function galleryStartIndex(index, count) {
  return Number.isInteger(index) && index >= 0 && index < count ? index : 0
}
