import * as React from "react"
import { Upload } from "lucide-react"
import Dropzone from "shadcn-dropzone"
import { toast } from "sonner"

import type { CatalogItem } from "@/app/catalog/data"
import { useCatalog } from "@/components/catalog-context"
import { UserPicker } from "@/components/user-picker"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AddItemDialog() {
  const { addDialogOpen, setAddDialogOpen, setItems } = useCatalog()
  const [name, setName] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [visibility, setVisibility] = React.useState<"all" | "restricted">(
    "all"
  )
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([])

  function handleDrop(files: File[]) {
    if (files[0]) setFile(files[0])
  }

  function handleSave() {
    if (!name.trim()) return

    const newItem: CatalogItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      lastUpdated: new Date().toISOString().split("T")[0],
      visibility,
      restrictedTo: visibility === "restricted" ? selectedUsers : [],
      subscribed: false,
      lastDownloaded: null,
      currentVersion: "v1",
      versions: [
        {
          id: crypto.randomUUID(),
          filename: file
            ? file.name
            : `${name.trim().toLowerCase().replace(/\s+/g, "_")}_v1`,
          uploadDate: new Date().toISOString().split("T")[0],
          fileSize: file
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : "0 MB",
          isCurrent: true,
        },
      ],
      cloudfrontUrl: `https://d1234.cloudfront.net/catalog/${encodeURIComponent(name.trim().toLowerCase().replace(/\s+/g, "-"))}`,
    }

    setItems((prev) => [...prev, newItem])
    toast.success("Item added successfully")
    handleClose()
  }

  function handleClose() {
    setName("")
    setFile(null)
    setVisibility("all")
    setSelectedUsers([])
    setAddDialogOpen(false)
  }

  return (
    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Add a new file to the catalog for distribution.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              placeholder="e.g. Q1 Revenue Report"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>File</Label>
            <Dropzone
              onDrop={handleDrop}
              dropZoneClassName="border-input bg-background hover:bg-accent/50 text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-6 text-center transition-colors data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/5"
              showFilesList={false}
              showErrorMessage={false}
            >
              {(dropzone) => (
                <>
                  <Upload className="size-6 opacity-50" />
                  <div className="text-sm font-medium">
                    {file
                      ? file.name
                      : dropzone.isDragAccept
                        ? "Drop file here"
                        : "Drag and drop a file, or click to browse"}
                  </div>
                  {file && (
                    <div className="text-xs opacity-70">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  )}
                </>
              )}
            </Dropzone>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(v) => setVisibility(v as "all" | "restricted")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All DDA Subscribers</SelectItem>
                <SelectItem value="restricted">Specific Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {visibility === "restricted" && (
            <div className="flex flex-col gap-2">
              <Label>Select Users</Label>
              <UserPicker value={selectedUsers} onChange={setSelectedUsers} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
