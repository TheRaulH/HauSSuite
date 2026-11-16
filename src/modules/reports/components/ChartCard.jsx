/**
 * Tarjeta de gráfico: una pregunta en lenguaje simple arriba y la conclusión abajo,
 * para que se entienda sin saber leer gráficos.
 */
export default function ChartCard({ title, question, takeaway, children }) {
  return (
    <section className="bg-white border border-haus-sky rounded-3xl rounded-bl-none p-5 flex flex-col gap-3">
      <div>
        <h3 className="font-semibold text-haus-blue">{title}</h3>
        {question && <p className="text-sm text-gray-500">{question}</p>}
      </div>
      {children}
      {takeaway && <p className="text-sm text-haus-blue bg-haus-cream rounded-xl px-3 py-2">{takeaway}</p>}
    </section>
  )
}
