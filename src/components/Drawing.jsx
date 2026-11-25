// Building cross-section. `active` highlights one part; `anim` plays the build animation.
const wave = Array(22).fill('t12 0').join('')
const t = (v) => ({ '--t': v })

export default function Drawing({ active = null, anim = false, name = '' }) {
  const on = (p) => (active === p ? ' on' : '')
  return (
    <svg
      className={`dwg${active ? ' act' : ''}${anim ? ' go' : ''}`}
      viewBox="0 0 560 380"
      role="img"
      aria-label={`Cross-section of a building and swimming pool${name ? `, highlighting ${name}` : ''}`}
    >
      <defs>
        <pattern id="brick" width="12" height="8" patternUnits="userSpaceOnUse"><path d="M0 4h12M6 0v4M0 4v4" stroke="currentColor" fill="none" /></pattern>
        <pattern id="stamp" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M5 0l5 5-5 5-5-5z" stroke="currentColor" fill="none" /></pattern>
        <pattern id="tile" width="8" height="7" patternUnits="userSpaceOnUse"><path d="M0 0h8M0 0v7" stroke="currentColor" fill="none" /></pattern>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v6" stroke="currentColor" /></pattern>
        <pattern id="lat" width="10" height="14" patternUnits="userSpaceOnUse"><path d="M0 0l10 14M10 0L0 14" stroke="currentColor" strokeWidth=".8" fill="none" /></pattern>
        <clipPath id="pc"><path d="M14 250V336L100 344H236V250Z" /></clipPath>
      </defs>
      <g stroke="currentColor" fill="none" strokeWidth="1.5">
        <path d="M0 250H560" strokeWidth="2" />
        <rect x="240" y="252" width="320" height="20" fill="url(#hatch)" opacity=".3" stroke="none" />
        {anim && (
          <g className="crane" opacity=".7">
            <rect x="532" y="34" width="9" height="204" fill="url(#lat)" />
            <path d="M250 38H556M250 30H556M250 30V38M532 30l4.5-14 4.5 14" />
            <rect x="544" y="38" width="10" height="14" fill="currentColor" />
            <g className="hook"><path d="M500 38V78" /><rect x="486" y="78" width="30" height="7" fill="currentColor" /></g>
          </g>
        )}
        <g className={`part${on('p2')}`} data-p="p2">
          <path className="hl sd" style={t('.1s')} d="M14 250V336L100 344H236V250Z" fill="var(--teal)" fillOpacity=".22" />
          <g className="draw" style={t('1.3s')} clipPath="url(#pc)">
            <path className="wave" d={`M0 264q6-6 12 0${wave}`} stroke="var(--teal)" />
            <path className="wave" d={`M0 284q6-6 12 0${wave}`} stroke="var(--teal)" opacity=".5" />
          </g>
          <path className="hl" d="M14 272h22v14h22v14h22" strokeWidth="1" />
          <rect x="8" y="246" width="12" height="5" fill="currentColor" />
          <rect x="230" y="246" width="12" height="5" fill="currentColor" />
        </g>
        <g className={`part${on('p1')}`} data-p="p1">
          <rect className="sx" style={t('.9s')} x="254" y="258" width="226" height="12" fill="currentColor" />
          <rect className="sy" style={t('1.2s')} x="262" y="100" width="8" height="158" fill="currentColor" />
          <rect className="sy" style={t('1.5s')} x="362" y="100" width="8" height="158" fill="currentColor" />
          <rect className="sy" style={t('1.8s')} x="462" y="100" width="8" height="158" fill="currentColor" />
          <rect className="sx" style={t('2.6s')} x="262" y="172" width="208" height="8" fill="currentColor" />
          <rect className="sx" style={t('3s')} x="256" y="92" width="220" height="8" fill="currentColor" />
        </g>
        <g className={`part draw${on('p5')}`} data-p="p5" style={t('3.4s')}>
          <rect className="hl" x="270" y="242" width="190" height="8" fill="url(#tile)" />
          <path className="hl" d="M270 242h190" />
        </g>
        <g className={`part draw${on('p6')}`} data-p="p6" style={t('3.7s')}>
          <rect className="hl" x="480" y="242" width="44" height="8" fill="url(#brick)" />
          <rect className="hl" x="480" y="242" width="44" height="8" />
        </g>
        <g className={`part draw${on('p7')}`} data-p="p7" style={t('3.9s')}>
          <rect className="hl" x="526" y="238" width="32" height="12" fill="url(#stamp)" />
          <rect className="hl" x="526" y="238" width="32" height="12" />
        </g>
        <g className={`part draw${on('p3')}`} data-p="p3" style={t('4.2s')}>
          <path className="hl" d="M270 100h184v10h-12v8H282v-8h-12z" fill="var(--paper)" />
          <path className="hl" d="M292 112h140" strokeDasharray="3 3" />
        </g>
        <g className={`part draw${on('p4')}`} data-p="p4" style={t('4.5s')}>
          <rect className="hl" x="290" y="128" width="50" height="38" fill="var(--paper)" />
          <path className="hl" d="M296 160l14-20 10 12 8-8 8 16z" fill="var(--teal)" fillOpacity=".35" />
          <circle className="hl" cx="328" cy="138" r="4" />
          <path className="hl" d="M386 250v-30h30v30M380 220h42M440 118v16" />
          <circle className="hl" cx="440" cy="142" r="8" />
        </g>
        <g className={`part draw${on('p8')}`} data-p="p8" style={t('4.8s')}>
          <rect className="hl" x="470" y="100" width="8" height="150" fill="var(--teal)" fillOpacity=".35" />
          <rect className="hl" x="484" y="130" width="30" height="12" fill="var(--paper)" />
          <path className="hl" d="M514 136h8v20h-22v8M500 164v20" />
        </g>
      </g>
      <g fill="currentColor" fontSize="11" fontFamily="Instrument Sans,sans-serif" opacity=".65">
        <text x="248" y="98" textAnchor="end">+8.40</text>
        <text x="248" y="176" textAnchor="end">+4.20</text>
        <text x="248" y="238" textAnchor="end">±0.00</text>
        <text x="120" y="320" textAnchor="middle" fill="var(--teal)" opacity="1">pool, 3.4 m deep</text>
        <text x="14" y="372">Section A–A, not to scale</text>
      </g>
    </svg>
  )
}
