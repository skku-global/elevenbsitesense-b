import gardenPool from '../assets/images/projects/pool-replace.webp'
import gardenSmall from '../assets/images/projects/pool-replace-480.webp'
import gardenMedium from '../assets/images/projects/pool-replace-720.webp'
import gardenLarge from '../assets/images/projects/pool-replace-1024.webp'
import accessDetails from '../assets/images/projects/elevenpool6.webp'
import accessSmall from '../assets/images/projects/elevenpool6-480.webp'
import accessMedium from '../assets/images/projects/elevenpool6-720.webp'
import curvedPool from '../assets/images/projects/elevenpool5.webp'
import curvedSmall from '../assets/images/projects/elevenpool5-480.webp'
import curvedMedium from '../assets/images/projects/elevenpool5-720.webp'
import tilingWork from '../assets/images/projects/elevenpool4.webp'
import tilingSmall from '../assets/images/projects/elevenpool4-480.webp'
import darkCoping from '../assets/images/projects/elevenpool.webp'
import darkSmall from '../assets/images/projects/elevenpool-480.webp'
import darkMedium from '../assets/images/projects/elevenpool-720.webp'
import roundedPool from '../assets/images/projects/elevenpool2.webp'
import roundedSmall from '../assets/images/projects/elevenpool2-480.webp'

// Supplied company photographs. These are photo views, not a project count.
// Originals are preserved; enhanced variants keep the full frames below 250 KB.
const photos = [
  {
    image: gardenPool, width: 1252, height: 832,
    srcSet: `${gardenSmall} 480w, ${gardenMedium} 720w, ${gardenLarge} 1024w, ${gardenPool} 1252w`,
    title: 'Finished pool with paved surround',
    alt: 'ELEVEN B SITE SENSE rectangular blue swimming pool with pale paving and planting around it',
    description: 'A filled rectangular pool with pale paving, lawn and planting around the poolside.',
  },
  {
    image: curvedPool, width: 1080, height: 812,
    srcSet: `${curvedSmall} 480w, ${curvedMedium} 720w, ${curvedPool} 1080w`,
    title: 'Curved pool with waterfalls',
    alt: 'ELEVEN B SITE SENSE curved blue swimming pool with two waterfall outlets and raised poolside paving',
    description: 'A filled curved pool with two waterfall outlets, pale coping and raised poolside paving.',
  },
  {
    image: accessDetails, width: 960, height: 960,
    srcSet: `${accessSmall} 480w, ${accessMedium} 720w, ${accessDetails} 960w`,
    title: 'Mosaic finish and access details',
    alt: 'ELEVEN B SITE SENSE empty mosaic-tiled pool with steps, stainless-steel handrails and wood-look poolside tiles',
    description: 'Before filling: mosaic tiles, a decorative border, pool steps and stainless-steel handrails.',
  },
  {
    image: tilingWork, width: 712, height: 960,
    srcSet: `${tilingSmall} 480w, ${tilingWork} 712w`,
    title: 'Pool tiling work on site',
    alt: 'Work in progress inside an ELEVEN B SITE SENSE mosaic-tiled swimming pool with steps and metal handrails',
    description: 'Work on site inside a mosaic-tiled pool, with steps, handrails and finishing materials visible.',
  },
  {
    image: darkCoping, width: 924, height: 960,
    srcSet: `${darkSmall} 480w, ${darkMedium} 720w, ${darkCoping} 924w`,
    title: 'Rectangular pool with dark coping',
    alt: 'ELEVEN B SITE SENSE empty rectangular mosaic-tiled pool edged with dark coping beside a building',
    description: 'Before filling: a rectangular mosaic-tiled pool edged with contrasting dark coping.',
  },
  {
    image: roundedPool, width: 720, height: 540,
    srcSet: `${roundedSmall} 480w, ${roundedPool} 720w`,
    title: 'Pool with a rounded end',
    alt: 'ELEVEN B SITE SENSE blue-tiled swimming pool with a rounded end, shown during work on site',
    description: 'Work on site on a blue-tiled pool with a rounded end and paved coping.',
  },
]

export const poolWorkPhotos = photos.map(photo => ({
  ...photo,
  caption: 'Our work · ELEVEN B SITE SENSE',
  fallbackAlt: 'Swimming pool illustration shown while the company photograph is unavailable',
  fallbackLabel: 'Swimming pool illustration',
  position: '50% 50%',
}))

export const featuredPoolPhoto = poolWorkPhotos[0]
