/** Ilustrasi vektor lokal. Dekoratif, bukan representasi status perangkat. */
export function ConnectionArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 350 210" fill="none" aria-hidden="true" className={className}>
      <circle cx="195" cy="105" r="88" stroke="#c8d9be" strokeDasharray="4 7" />
      <circle cx="195" cy="105" r="66" fill="#dce8d2" fillOpacity=".55" />
      <path d="M85 60h35m117 81h48M95 160h28m119-100h26" stroke="#b7cdb0" strokeWidth="1.5" />
      <circle cx="85" cy="60" r="5" fill="#a8c595" />
      <circle cx="285" cy="141" r="5" fill="#a8c595" />
      <g transform="rotate(9 192 105)">
        <rect x="148" y="24" width="94" height="163" rx="19" fill="#fafcf8" stroke="#173d2c" strokeWidth="2.5" />
        <rect x="158" y="38" width="74" height="132" rx="11" fill="#edf3e9" />
        <path d="M182 33h25" stroke="#173d2c" strokeWidth="3" strokeLinecap="round" />
        <rect x="170" y="59" width="46" height="40" rx="13" fill="#244d36" />
        <path d="M181 84V70l12 10 12-10v14" stroke="#c9edaa" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="169" y="112" width="40" height="5" rx="2.5" fill="#bfd0b6" />
        <rect x="169" y="123" width="50" height="5" rx="2.5" fill="#d4dfcd" />
        <rect x="169" y="145" width="44" height="10" rx="5" fill="#c9edaa" />
        <path d="M185 180h21" stroke="#173d2c" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g transform="rotate(-6 110 119)">
        <rect x="49" y="90" width="113" height="62" rx="13" fill="white" stroke="#d1ddca" />
        <rect x="62" y="102" width="30" height="30" rx="10" fill="#e8f2df" />
        <path d="M71 114h12m-12 6h8" stroke="#51813e" strokeWidth="2" strokeLinecap="round" />
        <rect x="102" y="107" width="44" height="5" rx="2.5" fill="#6b8960" />
        <rect x="102" y="119" width="31" height="4" rx="2" fill="#d4dfcd" />
        <rect x="64" y="140" width="78" height="3" rx="1.5" fill="#e2eadd" />
      </g>
      <g transform="rotate(5 272 70)">
        <rect x="240" y="44" width="66" height="50" rx="13" fill="#244d36" />
        <path d="m257 69 9 9 18-20" stroke="#c9edaa" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path d="M119 38v12m-6-6h12M283 176v10m-5-5h10" stroke="#8dad79" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function EmptyDeviceArt() {
  return (
    <svg viewBox="0 0 176 124" fill="none" aria-hidden="true" className="mb-4 h-[104px] w-[150px]">
      <ellipse cx="87" cy="107" rx="60" ry="7" fill="#f0f4ec" />
      <rect x="55" y="14" width="68" height="95" rx="12" fill="#f9fbf7" stroke="#bfceb8" strokeWidth="1.5" />
      <rect x="61" y="24" width="56" height="72" rx="7" fill="#edf3e8" />
      <path d="M77 20h24m-17 82h10" stroke="#a5b49f" strokeWidth="2" strokeLinecap="round" />
      <rect x="71" y="42" width="36" height="28" rx="8" fill="white" stroke="#bdceb4" />
      <path d="m83 53 5 5 5-5m-5 5v-8" stroke="#77976b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m100 69 4 5v-8" fill="white" stroke="#bdceb4" />
      <rect x="15" y="56" width="49" height="33" rx="8" fill="white" stroke="#dae3d4" />
      <path d="M27 69h24m-24 6h15" stroke="#c6d5bd" strokeWidth="2" strokeLinecap="round" />
      <circle cx="131" cy="39" r="12" fill="#eaf2e4" stroke="#cad9c0" />
      <path d="M131 34v10m-5-5h10" stroke="#789b69" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M37 28v8m-4-4h8m108 46v8m-4-4h8" stroke="#c2d3b9" strokeWidth="1.5" />
    </svg>
  )
}
