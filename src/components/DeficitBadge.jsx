export default function DeficitBadge({ value }) {
  const isShort = value < 0
  const isExact = value === 0
  const label = isShort ? `${value}` : `+${value}`

  if (isShort) {
    // "Dilingkari pena merah" — menandai kekurangan, seperti koreksi QC di kertas pola.
    return (
      <span className="relative inline-flex items-center justify-center px-3 py-1">
        <svg
          viewBox="0 0 100 44"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M12,22 C10,8 30,3 50,4 C74,5 92,9 90,22 C92,36 70,41 50,40 C26,41 9,37 12,22 Z"
            fill="none"
            stroke="#C4342B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="relative z-10 font-mono font-semibold text-redpen tabular text-sm px-1">
          {label}
        </span>
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-semibold tabular text-sm px-2 py-1 rounded-sm ${
        isExact ? 'text-inkSoft bg-paperLine/40' : 'text-greenpen bg-greenpenSoft'
      }`}
    >
      {!isExact && <span aria-hidden="true">✓</span>}
      {label}
    </span>
  )
}
