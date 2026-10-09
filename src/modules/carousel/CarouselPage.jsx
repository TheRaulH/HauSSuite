import { useState } from 'react';
import PageHeader from '../../suite/PageHeader';
import { useCatalogContext } from '../../suite/CatalogContext';
import FileUploader from '../../components/FileUploader';
import ImageUploader from '../../components/ImageUploader';
import ProductTable from '../../components/ProductTable';
import DesignSelector from '../../components/DesignSelector';
import GenerationPanel from '../../components/GenerationPanel';
import ExportPanel from '../../components/ExportPanel';
import { useProducts } from '../../hooks/useProducts';
import { useDesigns } from '../../hooks/useDesigns';
import { revokeImageUrl } from '../../utils/imageManager';

// Producto de ejemplo para poder ver la vista previa de un diseño
// incluso antes de importar un Excel.
const DEMO_PRODUCT = {
  id: 'demo',
  codigo: 'DEMO',
  nombre: 'Producto de ejemplo',
  precio: 599,
  precioAntes: 799,
  cuotas: 12,
  imagen: null,
};

function CarouselPage() {
  const {
    products,
    importProducts,
    updateProduct,
    setProductImage,
    deleteProduct,
    toggleSelected,
    selectMany,
    selectedProducts,
  } = useProducts();

  const {
    designs,
    selectedDesignId,
    setSelectedDesignId,
    selectedFormatIds,
    toggleFormat,
    selectedTemplates,
  } = useDesigns();

  const { loaded: catalogLoaded, entries: catalogEntries, lookup: catalogLookup } = useCatalogContext();

  const [generatedImages, setGeneratedImages] = useState([]);

  function handleImagesMatched(matches) {
    for (const match of matches) {
      const current = products.find((p) => p.id === match.productId);
      const previousUrl = current?.[match.field];
      // La imagen del regalo se comparte entre varios productos — no se revoca acá,
      // solo las de producto principal/combo, que son exclusivas de esa fila.
      if (previousUrl && match.field !== 'regaloImagen')
        revokeImageUrl(previousUrl);
      setProductImage(match.productId, match.url, match.field);
    }
  }

  const previewProduct = selectedProducts[0] ?? products[0] ?? DEMO_PRODUCT;

  const catalogEmpty = catalogLoaded && catalogEntries.length === 0;

  return (
    <>
      <PageHeader
        title="Generador de carruseles"
        description="Excel → plantilla → PNG, todo local"
      />
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-6">
        {catalogEmpty && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            El catálogo de productos está vacío, así que los códigos no se completarán solos.{' '}
            <a href="#/catalogo" className="underline font-medium">
              Ir al catálogo
            </a>
          </p>
        )}

        <FileUploader onImport={importProducts} catalogLookup={catalogLookup} />

        {products.length > 0 && (
          <>
            <ImageUploader
              products={products}
              onImagesMatched={handleImagesMatched}
            />
            <ProductTable
              products={products}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
              onToggleSelect={toggleSelected}
              onSelectMany={selectMany}
            />
          </>
        )}

        <DesignSelector
          designs={designs}
          selectedDesignId={selectedDesignId}
          onSelectDesign={setSelectedDesignId}
          selectedFormatIds={selectedFormatIds}
          onToggleFormat={toggleFormat}
          previewProduct={previewProduct}
        />

        {products.length > 0 && (
          <>
            <GenerationPanel
              products={selectedProducts}
              templates={selectedTemplates}
              onComplete={setGeneratedImages}
            />
            <ExportPanel images={generatedImages} />
          </>
        )}
      </div>
    </>
  );
}

export default CarouselPage;
