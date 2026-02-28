import { Plus, Shield } from "lucide-react"

import { useCatalog } from "@/components/catalog-context"
import { AddItemDialog } from "@/components/add-item-dialog"
import { CatalogDataTable } from "@/components/catalog-data-table"
import { VersionHistorySheet } from "@/components/version-history-sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function CatalogPage() {
  const { isAdmin, setIsAdmin, setAddDialogOpen } = useCatalog()

  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                File Catalog
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Browse, subscribe, and download available data files.
              </p>
            </div>
            {isAdmin && (
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-1 size-4" />
                Add Item
              </Button>
            )}
          </div>
          <CatalogDataTable />
        </div>
      </div>

      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-full border bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Shield className="text-muted-foreground size-4" />
        <Switch
          id="admin-mode-float"
          checked={isAdmin}
          onCheckedChange={setIsAdmin}
        />
        <Label
          htmlFor="admin-mode-float"
          className="text-muted-foreground cursor-pointer text-sm"
        >
          Admin
        </Label>
      </div>

      <AddItemDialog />
      <VersionHistorySheet />
    </div>
  )
}
