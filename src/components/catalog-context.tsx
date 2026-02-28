import * as React from "react"
import {
  catalogItems as initialItems,
  type CatalogItem,
} from "@/app/catalog/data"

interface CatalogContextValue {
  isAdmin: boolean
  setIsAdmin: (value: boolean) => void
  items: CatalogItem[]
  setItems: React.Dispatch<React.SetStateAction<CatalogItem[]>>
  selectedItem: CatalogItem | null
  setSelectedItem: (item: CatalogItem | null) => void
  addDialogOpen: boolean
  setAddDialogOpen: (open: boolean) => void
  versionSheetOpen: boolean
  setVersionSheetOpen: (open: boolean) => void
}

const CatalogContext = React.createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [items, setItems] = React.useState<CatalogItem[]>(initialItems)
  const [selectedItem, setSelectedItem] =
    React.useState<CatalogItem | null>(null)
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [versionSheetOpen, setVersionSheetOpen] = React.useState(false)

  return (
    <CatalogContext.Provider
      value={{
        isAdmin,
        setIsAdmin,
        items,
        setItems,
        selectedItem,
        setSelectedItem,
        addDialogOpen,
        setAddDialogOpen,
        versionSheetOpen,
        setVersionSheetOpen,
      }}
    >
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog() {
  const context = React.useContext(CatalogContext)
  if (!context)
    throw new Error("useCatalog must be used within CatalogProvider")
  return context
}
