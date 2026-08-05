export default function WipBadge({ value }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-1 font-mono font-semibold tabular text-sm px-2 py-1 rounded-sm text-amber bg-amberSoft">
        {value}
      </span>
    )
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-1 font-mono font-semibold tabular text-sm px-2 py-1 rounded-sm text-redpen bg-redpenSoft">
        {value} ⚠
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 font-mono font-semibold tabular text-sm px-2 py-1 rounded-sm text-greenpen bg-greenpenSoft">
      ✓ 0
    </span>
  )
}
