import CatalogManager from '../../components/CatalogManager'
import PageHeader from '../../suite/PageHeader'
import { useCatalogContext } from '../../suite/CatalogContext'

export default function CatalogPage() {
  const catalog = useCatalogContext()

  return (
    <>
      <PageHeader
        title="Catálogo de productos"
        description="Descripción → código para buscar la imagen → código que se imprime en el arte"
      />
      <div className="max-w-5xl mx-auto px-6 py-6">
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
      </div>
    </>
  )
}
