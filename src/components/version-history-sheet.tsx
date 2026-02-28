import * as React from "react"
import { ChevronsUpDown, Copy, Upload } from "lucide-react"
import Dropzone from "shadcn-dropzone"
import { toast } from "sonner"

import { useCatalog } from "@/components/catalog-context"
import { UserPicker } from "@/components/user-picker"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

function buildCloudfrontUrl(itemName: string, filename: string) {
  const slug = itemName.toLowerCase().replace(/\s+/g, "-")
  return `https://d1234.cloudfront.net/catalog/${slug}/${filename}`
}

export function VersionHistorySheet() {
  const {
    items,
    versionSheetOpen,
    setVersionSheetOpen,
    selectedItem,
    setSelectedItem,
    setItems,
  } = useCatalog()

  const [uploadConfirmOpen, setUploadConfirmOpen] = React.useState(false)
  const [pendingFile, setPendingFile] = React.useState<File | null>(null)
  const [versionsOpen, setVersionsOpen] = React.useState(false)
  const sheetJustOpened = React.useRef(false)

  React.useEffect(() => {
    if (selectedItem && versionSheetOpen) {
      if (!sheetJustOpened.current) {
        setVersionsOpen(false)
        sheetJustOpened.current = true
      }
    } else {
      sheetJustOpened.current = false
    }
  }, [selectedItem, versionSheetOpen])

  const mockSubscriberCount = React.useMemo(() => {
    if (!selectedItem) return 0
    return items.filter((i) => i.subscribed).length
  }, [items, selectedItem])

  const currentVersion = selectedItem?.versions.find((v) => v.isCurrent)
  const cloudfrontUrl =
    selectedItem && currentVersion
      ? buildCloudfrontUrl(selectedItem.name, currentVersion.filename)
      : selectedItem?.cloudfrontUrl ?? ""

  function updateItem(patch: Partial<typeof selectedItem>) {
    if (!selectedItem) return
    const updated = { ...selectedItem, ...patch }
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id ? { ...item, ...patch } : item
      )
    )
    setSelectedItem(updated as typeof selectedItem)
  }

  function handleNameBlur(e: React.FocusEvent<HTMLInputElement>) {
    const val = e.target.value.trim()
    if (!val || !selectedItem || val === selectedItem.name) return
    const cv = selectedItem.versions.find((v) => v.isCurrent)
    const url = cv
      ? buildCloudfrontUrl(val, cv.filename)
      : selectedItem.cloudfrontUrl
    updateItem({ name: val, cloudfrontUrl: url })
  }

  function handleVisibilityChange(v: string) {
    updateItem({
      visibility: v as "all" | "restricted",
      restrictedTo: v === "all" ? [] : selectedItem?.restrictedTo ?? [],
    })
  }

  function handleUsersChange(users: string[]) {
    updateItem({ restrictedTo: users })
  }

  function handleCopyUrl() {
    navigator.clipboard.writeText(cloudfrontUrl)
    toast.success("URL copied to clipboard")
  }

  function handleSetCurrent(versionId: string) {
    if (!selectedItem) return
    const newVersions = selectedItem.versions.map((v) => ({
      ...v,
      isCurrent: v.id === versionId,
    }))
    const newCurrent = newVersions.find((v) => v.isCurrent)
    const url = newCurrent
      ? buildCloudfrontUrl(selectedItem.name, newCurrent.filename)
      : selectedItem.cloudfrontUrl
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? { ...item, versions: newVersions, cloudfrontUrl: url }
          : item
      )
    )
    setSelectedItem({
      ...selectedItem,
      versions: newVersions,
      cloudfrontUrl: url,
    })
    toast.success("Current version updated")
  }

  function handleDeleteVersion(versionId: string) {
    if (!selectedItem) return
    const updated = selectedItem.versions.filter((v) => v.id !== versionId)
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? { ...item, versions: updated }
          : item
      )
    )
    setSelectedItem({ ...selectedItem, versions: updated })
    toast.success("Version deleted")
  }

  function handleDropzoneFile(files: File[]) {
    const file = files[0]
    if (file) {
      setPendingFile(file)
      setUploadConfirmOpen(true)
    }
  }

  function handleConfirmUpload() {
    if (!selectedItem) return
    const fileName = pendingFile
      ? pendingFile.name
      : `${selectedItem.name.toLowerCase().replace(/\s+/g, "_")}_v${selectedItem.versions.length + 1}`
    const newVersion = {
      id: crypto.randomUUID(),
      filename: fileName,
      uploadDate: new Date().toISOString().split("T")[0],
      fileSize: pendingFile
        ? `${(pendingFile.size / (1024 * 1024)).toFixed(1)} MB`
        : "0 MB",
      isCurrent: false,
    }
    const updated = [...selectedItem.versions, newVersion]
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? { ...item, versions: updated, lastUpdated: newVersion.uploadDate }
          : item
      )
    )
    setSelectedItem({
      ...selectedItem,
      versions: updated,
      lastUpdated: newVersion.uploadDate,
    })
    setPendingFile(null)
    setUploadConfirmOpen(false)
    toast.success("New version uploaded")
  }

  function handleCancelUpload() {
    setPendingFile(null)
    setUploadConfirmOpen(false)
  }

  function handleDelete() {
    if (!selectedItem) return
    setItems((prev) => prev.filter((item) => item.id !== selectedItem.id))
    toast.success("Item deleted")
    handleClose(false)
  }

  function handleClose(open: boolean) {
    if (!open) {
      setVersionSheetOpen(false)
      setSelectedItem(null)
      setPendingFile(null)
      setUploadConfirmOpen(false)
      sheetJustOpened.current = false
    }
  }

  if (!selectedItem) return null

  const olderVersions = [...selectedItem.versions]
    .reverse()
    .filter((v) => !v.isCurrent)

  return (
    <>
      <Sheet open={versionSheetOpen} onOpenChange={handleClose}>
        <SheetContent
          side="right"
          className="flex w-full flex-col overflow-hidden p-0 sm:max-w-lg"
        >
          <SheetHeader className="shrink-0 border-b px-4 pt-4 pb-3">
            <SheetTitle>Edit Item</SheetTitle>
            <SheetDescription>
              Update details, manage versions, and control distribution.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 px-4 py-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="sheet-name">Item Name</Label>
                <Input
                  id="sheet-name"
                  defaultValue={selectedItem.name}
                  key={selectedItem.id}
                  onBlur={handleNameBlur}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label>Visibility</Label>
                <Select
                  value={selectedItem.visibility}
                  onValueChange={handleVisibilityChange}
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
              {selectedItem.visibility === "restricted" && (
                <div className="flex flex-col gap-2">
                  <Label>Select Users</Label>
                  <UserPicker
                    value={selectedItem.restrictedTo}
                    onChange={handleUsersChange}
                  />
                </div>
              )}

              <Separator />

              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  CloudFront URL
                </span>
                <div className="flex items-center gap-2">
                  <code className="bg-muted flex-1 truncate rounded px-2 py-1 text-xs">
                    {cloudfrontUrl}
                  </code>
                  <Button variant="ghost" size="icon" onClick={handleCopyUrl}>
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium">Upload New Version</span>
                <Dropzone
                  onDrop={handleDropzoneFile}
                  dropZoneClassName="border-input bg-background hover:bg-accent/50 text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/5"
                  showFilesList={false}
                  showErrorMessage={false}
                >
                  {(dropzone) => (
                    <>
                      <Upload className="size-8 opacity-50" />
                      <div className="text-sm font-medium">
                        {dropzone.isDragAccept
                          ? "Drop file here"
                          : "Drag and drop a file, or click to browse"}
                      </div>
                      <div className="text-xs opacity-70">
                        This will create a new version of {selectedItem.name}
                      </div>
                    </>
                  )}
                </Dropzone>
              </div>

              <Separator />

              <Collapsible open={versionsOpen} onOpenChange={setVersionsOpen}>
                {currentVersion && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Current Version
                      </span>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <span className="text-muted-foreground text-xs">
                            {selectedItem.versions.length > 1
                              ? `${selectedItem.versions.length - 1} more`
                              : "No older versions"}
                          </span>
                          <ChevronsUpDown className="ml-1 size-3.5" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">
                            {currentVersion.filename}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {currentVersion.uploadDate} &middot;{" "}
                            {currentVersion.fileSize}
                          </span>
                        </div>
                        <Badge>Current</Badge>
                      </div>
                    </div>
                  </div>
                )}

                <CollapsibleContent className="mt-2 flex flex-col gap-2">
                  {olderVersions.map((version) => (
                    <div
                      key={version.id}
                      className="flex flex-col gap-2 rounded-lg border p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">
                            {version.filename}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {version.uploadDate} &middot; {version.fileSize}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetCurrent(version.id)}
                        >
                          Set as Current
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete version "{version.filename}"?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove this version. This
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteVersion(version.id)
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  {olderVersions.length === 0 && (
                    <p className="text-muted-foreground py-2 text-center text-sm">
                      No older versions.
                    </p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          <div className="shrink-0 border-t px-4 py-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete Item
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete "{selectedItem.name}"?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the item and all its versions
                    from the catalog. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={uploadConfirmOpen} onOpenChange={setUploadConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload new version?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingFile ? (
                <>
                  You're about to upload <strong>{pendingFile.name}</strong> as
                  a new version of {selectedItem.name}.
                </>
              ) : (
                <>
                  You're about to upload a new version of{" "}
                  {selectedItem.name}.
                </>
              )}
              {" "}This will notify{" "}
              <strong>
                {mockSubscriberCount}{" "}
                {mockSubscriberCount === 1 ? "subscriber" : "subscribers"}
              </strong>{" "}
              via email. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelUpload}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpload}>
              Upload &amp; Notify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
