const TONES = {
  default: 'bg-white border-haus-sky text-haus-blue',
  good: 'bg-haus-blue border-haus-blue text-white',
  bad: 'bg-haus-sand border-haus-sand text-haus-blue',
}

/** Un número grande con su explicación en palabras simples. */
export default function KpiCard({ label, value, hint, tone = 'default' }) {
  const dark = tone === 'good'
  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-1 ${TONES[tone]}`}>
      <p className={`text-sm ${dark ? 'text-haus-sky' : 'text-gray-500'}`}>{label}</p>
      <p className="text-2xl font-bold leading-tight">{value}</p>
      {hint && <p className={`text-xs ${dark ? 'text-haus-sky/90' : 'text-gray-500'}`}>{hint}</p>}
    </div>
  )
}
