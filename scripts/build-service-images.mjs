import sharp from 'sharp'
import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
const SRC = process.argv[2], OUT = 'src/assets/images/services'
const titles = { 'residential-swimming-pools': 'Residential swimming pool', 'commercial-swimming-pools': 'Commercial swimming pool', 'pool-renovation-and-repair': 'Pool renovation and repair', 'general-building-contracting': 'General building', 'pop-ceiling-installation': 'P.O.P. ceiling', 'artwork-and-interior-design': 'Artwork and interior design', 'tiling': 'Tiling', 'interlock-paving': 'Interlock paving', 'imported-stamped-interlock': 'Imported stamped interlock', 'painting': 'Painting' }
for (const [slug, title] of Object.entries(titles)) {
  const from = join(SRC, slug), out = join(OUT, slug)
  if (!existsSync(from)) { console.log('skip (no folder)', slug); continue }
  if (existsSync(join(out, 'manifest.json'))) { console.log('skip (done)', slug); continue }
  const files = readdirSync(from).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).map(f => ({ f, t: statSync(join(from, f)).mtime })).sort((a, b) => a.t - b.t)
  if (!files.length) { console.log('skip (empty)', slug); continue }
  mkdirSync(join(out, 'thumbnails'), { recursive: true })
  const images = []
  for (const [i, { f, t }] of files.entries()) {
    const n = String(i + 1).padStart(2, '0') + '.webp', src = join(from, f)
    let q = 90, buf, info
    do { ({ data: buf, info } = await sharp(src).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: q, effort: 6, smartSubsample: true }).toBuffer({ resolveWithObject: true })); q -= 0 } while (false)
    const th = await sharp(buf).resize({ width: 600 }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true })
    writeFileSync(join(out, n), buf); writeFileSync(join(out, 'thumbnails', n), th.data)
    images.push({ file: n, thumbnail: 'thumbnails/' + n, alt: `${title} design inspiration, image ${i + 1}`, label: 'Design inspiration', kind: 'inspiration', source: f, sourceModifiedAt: t.toISOString(), sourceSha256: createHash('sha256').update(readFileSync(src)).digest('hex'), width: info.width, height: info.height, bytes: buf.length, quality: q, thumbnailWidth: th.info.width, thumbnailHeight: th.info.height, thumbnailBytes: th.data.length })
  }
  writeFileSync(join(out, 'manifest.json'), JSON.stringify({ service: slug, classification: 'Generated design inspiration, not completed client projects', sort: 'Source modified time, oldest first', excluded: [], images }, null, 2))
  console.log(slug, images.length, 'images')
}
