import { CatalogPage } from "@/components/catalog-page"
import { CatalogProvider } from "@/components/catalog-context"
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <CatalogProvider>
      <CatalogPage />
      <Toaster />
    </CatalogProvider>
  )
}

export default App
