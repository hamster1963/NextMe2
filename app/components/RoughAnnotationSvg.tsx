interface RoughAnnotationSvgProps {
  width?: number
  height?: number
  strokeColor: string
  className?: string
}

export default function RoughAnnotationSvg({
  width = 100,
  height = 100,
  strokeColor,
  className = '',
}: RoughAnnotationSvgProps) {
  return (
    <svg
      className={`rough-annotation ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'visible',
        pointerEvents: 'none',
        width,
        height,
      }}
    >
      <title>RoughAnnotationSvg</title>
      <path
        d="M406.1220100503415 293.95339003391564 C456.8192346927896 301.4074854772724, 500.25880054395645 311.59805977532636, 533.3987817745656 321.00129005499184"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
      />
      <path
        d="M532.5692945439368 318.8231803756207 C510.5106628100947 314.58523531505836, 483.6873116016016 308.3071101936139, 407.80231228657067 289.8226350527257"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
      />
      <path
        d="M409.44941854290664 291.28873464651406 C438.16757794711737 297.25272818798203, 471.24946377556773 307.6449546552636, 535.5698162894696 317.00835898704827"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
      />
      <path
        d="M536.5087784845382 289.65247714333236 C502.488655414395 298.3737930689193, 473.91940110731866 309.022250622157, 407.5470044333488 317.8572521787137"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
      />
      <path
        d="M410.902267633006 321.7671628315002 C452.9816493561491 309.72814061904324, 494.20357130263 301.8382074047066, 536.0173534136266 292.07287916727364"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
      />
      <path
        d="M532.932349415496 289.8448854070157 C487.6771870885417 304.24853204408663, 441.2254013412074 311.0783547773399, 408.8913231212646 319.4646365623921"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
      />
      {/* Add other paths as needed */}
    </svg>
  )
}
