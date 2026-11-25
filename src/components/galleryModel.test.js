import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeGalleryPhotos, resolveInspirationPhotos, galleryStartIndex } from './galleryModel.js'

test('real project photos precede ordered design inspiration and keep their own label', () => {
  const real = [{ src: 'project-b.webp', alt: 'A completed pool' }, { src: 'project-a.webp', alt: 'Pool decking' }]
  const designs = [{ src: '01.webp', alt: 'Infinity pool' }, { src: '02.webp', alt: 'Pool at dusk' }]
  const photos = mergeGalleryPhotos(real, designs)
  assert.deepEqual(photos.map((photo) => photo.src), ['project-b.webp', 'project-a.webp', '01.webp', '02.webp'])
  assert.deepEqual(photos.map((photo) => photo.label), ['Our work', 'Our work', 'Design inspiration', 'Design inspiration'])
  assert.deepEqual(real[0], { src: 'project-b.webp', alt: 'A completed pool' })
})

test('a generated asset cannot be duplicated as completed work', () => {
  const photos = mergeGalleryPhotos([{ src: '01.webp', label: 'Our work' }], [{ src: '01.webp', label: 'Our work', alt: 'An infinity pool design' }])
  assert.equal(photos.length, 1)
  assert.equal(photos[0].kind, 'inspiration')
  assert.equal(photos[0].label, 'Design inspiration')
})

test('design metadata resolves separate full-size and thumbnail assets', () => {
  const photos = resolveInspirationPhotos([{ file: '01.webp', thumbnail: 'thumbnails/01.webp', alt: 'Pool with mosaic tiles', width: 1200, height: 896, thumbnailWidth: 600, thumbnailHeight: 448 }], { '01.webp': '/assets/pool.webp', 'thumbnails/01.webp': '/assets/pool-thumb.webp' })
  assert.equal(photos[0].src, '/assets/pool.webp')
  assert.equal(photos[0].thumbnail, '/assets/pool-thumb.webp')
  assert.equal(photos[0].alt, 'Pool with mosaic tiles')
  assert.equal(photos[0].thumbnailWidth, 600)
  assert.equal(photos[0].label, 'Design inspiration')
})

test('missing thumbnail or descriptive alt text fails rather than shipping an incomplete gallery', () => {
  assert.throws(() => resolveInspirationPhotos([{ file: '01.webp', thumbnail: 'missing.webp', alt: 'Pool' }], { '01.webp': '/pool.webp' }), /Incomplete design inspiration/)
  assert.throws(() => resolveInspirationPhotos([{ file: '01.webp', thumbnail: 'thumb.webp', alt: ' ' }], { '01.webp': '/pool.webp', 'thumb.webp': '/thumb.webp' }), /Incomplete design inspiration/)
})

test('lightbox initial index is retained only when it is in the gallery', () => {
  assert.equal(galleryStartIndex(7, 10), 7)
  for (const index of [-1, 10, NaN, 1.5, undefined]) assert.equal(galleryStartIndex(index, 10), 0)
})
