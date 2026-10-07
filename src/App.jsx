import { useState } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import CatalogManager from './components/CatalogManager';
import ImageUploader from './components/ImageUploader';
import ProductTable from './components/ProductTable';
import DesignSelector from './components/DesignSelector';
import GenerationPanel from './components/GenerationPanel';
import ExportPanel from './components/ExportPanel';
import { useProducts } from './hooks/useProducts';
import { useDesigns } from './hooks/useDesigns';
import { useCatalog } from './hooks/useCatalog';
import { revokeImageUrl } from './utils/imageManager';

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

function App() {
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

  const {
    entries: catalogEntries,
    loaded: catalogLoaded,
    lookup: catalogLookup,
    importCatalog,
    clearCatalog,
  } = useCatalog();

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

  const catalog = useCatalog();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-6">
        <CatalogManager
          entries={catalog.entries}
          loaded={catalog.loaded}
          loading={catalog.loading}
          error={catalog.error}
          createEntry={catalog.createEntry}
          updateEntry={catalog.updateEntry}
          deleteEntry={catalog.deleteEntry}
          clearCatalog={catalog.clearCatalog}
          refresh={catalog.refresh}
        />

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
      </main>
    </div>
  );
}

export default App;
