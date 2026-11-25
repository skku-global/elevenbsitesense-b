// Public service information shared by the UI and the server. No image imports.
export const serviceOptions = Object.freeze([
  { slug: 'general-building-contracting', title: 'General Building Contracting', shortTitle: 'Building construction', category: 'Construction' },
  { slug: 'swimming-pool-construction', title: 'Swimming Pool Construction', shortTitle: 'Swimming pools', category: 'Outdoor living' },
  { slug: 'pop-ceiling-installation', title: 'P.O.P. Ceiling Installation', shortTitle: 'P.O.P. ceilings', category: 'Interior finishing' },
  { slug: 'artwork-and-interior-design', title: 'Artwork and Interior Design', shortTitle: 'Interiors & artwork', category: 'Interior design' },
  { slug: 'tiling', title: 'Tiling', shortTitle: 'Precision tiling', category: 'Interior finishing' },
  { slug: 'interlock-paving', title: 'Interlock Paving', shortTitle: 'Interlock paving', category: 'Exterior finishing' },
  { slug: 'imported-stamped-interlock', title: 'Imported Stamped Interlock', shortTitle: 'Stamped interlock', category: 'Exterior finishing' },
  { slug: 'painting', title: 'Painting', shortTitle: 'Painting & finishes', category: 'Interior & exterior' },
].map((option) => Object.freeze(option)))

export const getServiceOption = (slug) => serviceOptions.find((option) => option.slug === slug)
