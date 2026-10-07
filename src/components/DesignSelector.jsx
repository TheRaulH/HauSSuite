import { FORMATS } from '../utils/templateModel';

const THUMB_SCALE = 0.2;

export default function DesignSelector({
  designs,
  selectedDesignId,
  onSelectDesign,
  selectedFormatIds,
  onToggleFormat,
  previewProduct,
}) {
  if (designs.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-10 border border-dashed border-gray-200 rounded-lg">
        Todavía no hay diseños definidos — agrégalos en
        src/templates/definitions.js.{' '}
      </div>
    );
  }

  const selectedDesign = designs.find((d) => d.id === selectedDesignId);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-4">
      {' '}
      <div>
        {' '}
        <h3 className="font-medium text-gray-800 mb-2">Diseño</h3>
        ```
        <div className="flex flex-wrap gap-3">
          {designs.map((design) => {
            const previewFormat =
              design.formatos.square ?? Object.values(design.formatos)[0];

            const isSelected = design.id === selectedDesignId;

            return (
              <button
                key={design.id}
                type="button"
                onClick={() => onSelectDesign(design.id)}
                className={`border rounded-lg overflow-hidden flex flex-col text-left transition-colors ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  style={{
                    width: previewFormat.width * THUMB_SCALE,
                    height: previewFormat.height * THUMB_SCALE,
                    overflow: 'hidden',
                  }}
                  className="bg-gray-100"
                >
                  <div
                    style={{
                      transform: `scale(${THUMB_SCALE})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <previewFormat.Component
                      product={previewProduct}
                      image={previewProduct?.imagen}
                    />
                  </div>
                </div>

                <p
                  className="text-sm font-medium text-gray-700 px-2 py-1.5 truncate"
                  title={design.nombre}
                >
                  {design.nombre}
                </p>
              </button>
            );
          })}
        </div>
      </div>
      {selectedDesign && (
        <>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">
              Formatos a generar
            </h3>

            <div className="flex flex-wrap gap-2">
              {FORMATS.map((format) => {
                const isChecked = selectedFormatIds.includes(format.id);
                const available = Boolean(selectedDesign.formatos[format.id]);

                return (
                  <label
                    key={format.id}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      !available
                        ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                        : isChecked
                          ? 'bg-purple-600 text-white border-purple-600 cursor-pointer'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={!available}
                      onChange={() => onToggleFormat(format.id)}
                      className="hidden"
                    />
                    {format.label}
                  </label>
                );
              })}
            </div>
          </div>

          {selectedFormatIds.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Vista previa</h3>

              <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
                <div className="flex flex-wrap items-start justify-center gap-8">
                  {selectedFormatIds.map((formatId) => {
                    const format = FORMATS.find((f) => f.id === formatId);
                    const previewFormat = selectedDesign.formatos[formatId];

                    if (!format || !previewFormat) return null;

                    const MAX_PREVIEW_WIDTH = 500;
                    const MAX_PREVIEW_HEIGHT = 650;

                    const scale = Math.min(
                      MAX_PREVIEW_WIDTH / previewFormat.width,
                      MAX_PREVIEW_HEIGHT / previewFormat.height,
                      1
                    );

                    return (
                      <div
                        key={formatId}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="text-xs font-medium text-gray-500">
                          {format.label}
                        </div>

                        <div
                          className="bg-white shadow-md overflow-hidden"
                          style={{
                            width: previewFormat.width * scale,
                            height: previewFormat.height * scale,
                          }}
                        >
                          <div
                            style={{
                              width: previewFormat.width,
                              height: previewFormat.height,
                              transform: `scale(${scale})`,
                              transformOrigin: 'top left',
                            }}
                          >
                            <previewFormat.Component
                              product={previewProduct}
                              image={previewProduct?.imagen}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
