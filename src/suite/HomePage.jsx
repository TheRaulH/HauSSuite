import Wordmark from './Wordmark'

export default function HomePage({ tools }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
      {/* Portada: arena cálida con azul de base. Forma de marca: tres esquinas redondeadas y una recta. */}
      <div className="bg-haus-sand text-haus-blue rounded-3xl rounded-bl-none px-8 py-10 flex flex-col gap-3">
        <Wordmark className="text-5xl" />
        <p className="text-lg text-haus-blue/80 max-w-xl">
          Las herramientas de diseño del equipo de{' '}
          {/* KG The Fighter: solo acento, una palabra clave */}
          <span className="font-kg text-2xl text-haus-blue">marketing</span> de Hauscenter, en un solo lugar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <a
              key={tool.id}
              href={`#${tool.path}`}
              className="group bg-white border border-haus-sky rounded-3xl rounded-bl-none p-6 flex flex-col gap-3 transition-colors hover:bg-haus-blue hover:border-haus-blue outline-none focus-visible:ring-2 focus-visible:ring-haus-blue focus-visible:ring-offset-2"
            >
              <span className="w-11 h-11 rounded-full bg-haus-sky text-haus-blue flex items-center justify-center transition-colors group-hover:bg-white/15 group-hover:text-white">
                <Icon size={22} aria-hidden />
              </span>
              <h2 className="font-semibold text-lg text-haus-blue transition-colors group-hover:text-white">
                {tool.label}
              </h2>
              <p className="text-sm text-gray-600 transition-colors group-hover:text-haus-sky">{tool.description}</p>
            </a>
          )
        })}
      </div>
    </div>
  )
}
