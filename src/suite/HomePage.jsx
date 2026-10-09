import Wordmark from './Wordmark'

export default function HomePage({ tools }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
      <div>
        <Wordmark className="text-4xl text-haus-blue" />
        <p className="text-gray-500 mt-2">Suite de herramientas de diseño para el área de marketing de Hauscenter.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <a
            key={tool.id}
            href={`#${tool.path}`}
            className="group bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2 hover:border-haus-orange hover:shadow-sm transition"
          >
            <span className="text-3xl" aria-hidden>
              {tool.icon}
            </span>
            <h2 className="font-semibold text-haus-blue group-hover:text-haus-orange transition-colors">
              {tool.label}
            </h2>
            <p className="text-sm text-gray-500">{tool.description}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
