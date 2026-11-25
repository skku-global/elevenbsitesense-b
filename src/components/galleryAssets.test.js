import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync, readdirSync } from 'node:fs'

const directory = new URL('../assets/images/services/swimming-pool-construction/', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('manifest.json', directory), 'utf8'))

function webpDimensions(buffer) {
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF')
  assert.equal(buffer.toString('ascii', 8, 12), 'WEBP')
  for (let offset = 12; offset + 8 < buffer.length;) {
    const tag = buffer.toString('ascii', offset, offset + 4)
    const size = buffer.readUInt32LE(offset + 4)
    const start = offset + 8
    if (tag === 'VP8 ') return { width: buffer.readUInt16LE(start + 6) & 0x3fff, height: buffer.readUInt16LE(start + 8) & 0x3fff }
    if (tag === 'VP8X') return { width: buffer.readUIntLE(start + 4, 3) + 1, height: buffer.readUIntLE(start + 7, 3) + 1 }
    if (tag === 'VP8L') {
      const bits = buffer.readUInt32LE(start + 1)
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 }
    }
    offset += 8 + size + (size % 2)
  }
  throw new Error('Missing WebP dimensions')
}

test('the ten source images are accounted for in modified-time order', () => {
  assert.equal(manifest.images.length + manifest.excluded.length, 10)
  assert.deepEqual(manifest.images.map((image) => image.file), manifest.images.map((_, index) => `${String(index + 1).padStart(2, '0')}.webp`))
  const times = manifest.images.map((image) => Date.parse(image.sourceModifiedAt))
  assert.ok(times.every(Number.isFinite))
  assert.deepEqual(times, [...times].sort((a, b) => a - b))
})

test('every full-size asset and thumbnail meets its dimensions and size metadata', () => {
  for (const image of manifest.images) {
    const file = new URL(image.file, directory)
    const thumb = new URL(image.thumbnail, directory)
    assert.deepEqual(webpDimensions(readFileSync(file)), { width: image.width, height: image.height })
    assert.ok(image.width <= 1600)
    assert.equal(statSync(file).size, image.bytes)
    assert.ok(image.bytes < 250000)
    assert.deepEqual(webpDimensions(readFileSync(thumb)), { width: 600, height: image.thumbnailHeight })
    assert.equal(statSync(thumb).size, image.thumbnailBytes)
    assert.equal(image.kind, 'inspiration')
    assert.equal(image.label, 'Design inspiration')
    assert.ok(image.alt.length > 30)
  }
})

test('raw originals are absent from the service asset directory', () => {
  assert.ok(readdirSync(directory, { recursive: true }).every((file) => !/\.(?:jpg|jpeg|png)$/i.test(file)))
})
