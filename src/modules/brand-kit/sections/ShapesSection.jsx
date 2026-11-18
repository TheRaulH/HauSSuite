import { useState } from 'react'
import { SHAPES } from '../brandData'
import { colorizeSvg, downloadPng, downloadSvg, svgDataUrl } from '../svgTools'
import { ActionChip, Card, CopyChip, Section } from '../ui'

const SHAPE_COLOR = '#123B64'

function ShapeCard({ shape, clipboard }) {
  const [busy, setBusy] = useState(false)
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="h-36 flex items-center justify-center bg-haus-cream rounded-2xl">
        <img src={svgDataUrl(colorizeSvg(shape.svg, SHAPE_COLOR))} alt={shape.name} className="h-24 w-auto" />
      </div>
      <div>
        <p className="font-semibold text-haus-blue">{shape.name}</p>
        <p className="text-sm text-gray-600 mt-1">{shape.use}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <CopyChip id={`${shape.id}-css`} text={shape.css} label="Copiar CSS" clipboard={clipboard} />
        <ActionChip onClick={() => downloadSvg(shape.svg, shape.fileName, SHAPE_COLOR)}>SVG</ActionChip>
        <ActionChip
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            try {
              await downloadPng(shape.svg, shape.fileName, SHAPE_COLOR, 1200)
            } finally {
              setBusy(false)
            }
          }}
        >
          {busy ? '…' : 'PNG'}
        </ActionChip>
      </div>
    </Card>
  )
}

export default function ShapesSection({ clipboard }) {
  return (
    <Section
      id="formas"
      title="Formas"
      description="Derivan de la geometría del isotipo y sirven para ordenar, conectar y jerarquizar información (contenedores de texto o imagen, badges, conectores y marcos). No agregues formas ajenas a esta geometría. Los archivos se descargan en azul Hauscenter."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {SHAPES.map((s) => (
          <ShapeCard key={s.id} shape={s} clipboard={clipboard} />
        ))}
      </div>
    </Section>
  )
}
