import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  Bell,
  BellOff,
  Copy,
  Download,
  FileText,
  MoreVertical,
} from "lucide-react"
import { toast } from "sonner"

import type { CatalogItem } from "@/app/catalog/data"
import { useCatalog } from "@/components/catalog-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function hasUpdate(item: CatalogItem): boolean {
  if (!item.lastDownloaded) return true
  return item.lastUpdated > item.lastDownloaded
}

export function CatalogDataTable() {
  const {
    isAdmin,
    items,
    setItems,
    setSelectedItem,
    setVersionSheetOpen,
  } = useCatalog()

  const updatedCount = items.filter(hasUpdate).length
  const defaultTab = updatedCount > 0 ? "updates" : "all"

  const [activeTab, setActiveTab] = React.useState(defaultTab)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [deleteTarget, setDeleteTarget] = React.useState<CatalogItem | null>(
    null
  )

  React.useEffect(() => {
    setColumnVisibility({
      quickActions: !isAdmin,
      visibility: isAdmin,
      actions: isAdmin,
      cloudfrontUrl: isAdmin,
    })
  }, [isAdmin])

  function handleSubscribe(item: CatalogItem) {
    const next = !item.subscribed
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, subscribed: next } : i))
    )
    toast.success(
      next
        ? `You'll be notified when ${item.name} is updated`
        : `Unsubscribed from ${item.name}`
    )
  }

  function handleDownload(item: CatalogItem) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, lastDownloaded: new Date().toISOString().split("T")[0] }
          : i
      )
    )
    toast.success(`Downloading ${item.name}`)
  }

  function handleOpenSheet(item: CatalogItem) {
    setSelectedItem(item)
    setVersionSheetOpen(true)
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url)
    toast.success("URL copied to clipboard")
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    toast.success("Item deleted")
    setDeleteTarget(null)
  }

  const columns = React.useMemo<ColumnDef<CatalogItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex items-center gap-2">
              <FileText className="text-muted-foreground size-4 shrink-0" />
              {isAdmin ? (
                <button
                  className="text-foreground hover:underline text-left font-medium"
                  onClick={() => handleOpenSheet(item)}
                >
                  {item.name}
                </button>
              ) : (
                <span className="font-medium">{item.name}</span>
              )}
            </div>
          )
        },
        enableHiding: false,
      },
      {
        accessorKey: "lastUpdated",
        header: () => (
          <span className="block text-center">Last Updated</span>
        ),
        size: 120,
        cell: ({ row }) => {
          const item = row.original
          const updated = hasUpdate(item)
          return (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-muted-foreground text-sm whitespace-nowrap">
                {new Date(item.lastUpdated).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {updated && !isAdmin && (
                <Badge
                  variant="default"
                  className="text-[10px] px-1.5 py-0"
                >
                  New version
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        id: "quickActions",
        header: () => null,
        cell: ({ row }) => {
          const item = row.original
          return (
            <TooltipProvider delayDuration={300}>
              <div className="flex items-center gap-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`size-8 ${item.subscribed ? "text-primary" : "text-muted-foreground"}`}
                      onClick={() => handleSubscribe(item)}
                    >
                      {item.subscribed ? (
                        <Bell className="size-4" />
                      ) : (
                        <BellOff className="size-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {item.subscribed
                      ? "Unsubscribe from updates"
                      : "Subscribe to updates"}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground size-8"
                      onClick={() => handleDownload(item)}
                    >
                      <Download className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download latest version</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )
        },
      },
      {
        id: "cloudfrontUrl",
        header: "CloudFront URL",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <code className="bg-muted truncate rounded px-1.5 py-0.5 text-xs">
              {row.original.cloudfrontUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={() => handleCopyUrl(row.original.cloudfrontUrl)}
            >
              <Copy className="size-3" />
            </Button>
          </div>
        ),
      },
      {
        accessorKey: "visibility",
        header: "Visibility",
        cell: ({ row }) => {
          const item = row.original
          if (item.visibility === "all") {
            return <Badge variant="secondary">All Users</Badge>
          }
          const count = item.restrictedTo.length
          return (
            <Badge variant="outline">
              {count === 1
                ? `Restricted: ${item.restrictedTo[0]}`
                : `Restricted (${count} users)`}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        size: 36,
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="data-[state=open]:bg-muted text-muted-foreground size-8"
                  >
                    <MoreVertical className="size-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => handleOpenSheet(item)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteTarget(item)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [isAdmin, items]
  )

  const filteredData = React.useMemo(
    () => (activeTab === "updates" ? items.filter(hasUpdate) : items),
    [items, activeTab]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex w-full flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="updates">
              Updates
              {updatedCount > 0 && (
                <Badge variant="secondary">{updatedCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search files..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(e) =>
                table.getColumn("name")?.setFilterValue(e.target.value)
              }
              className="h-8 w-48"
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <ScrollArea className="rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={
                          header.id === "actions"
                            ? "sticky right-0 z-20 w-0 bg-muted px-0"
                            : header.id === "lastUpdated"
                              ? "w-[120px] text-center"
                              : header.id === "quickActions"
                                ? "w-0 px-0"
                                : undefined
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === "actions"
                              ? "sticky right-0 z-10 w-0 bg-background px-0"
                              : cell.column.id === "lastUpdated"
                                ? "w-[120px]"
                                : cell.column.id === "quickActions"
                                  ? "w-0 px-2"
                                  : undefined
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {activeTab === "updates"
                        ? "All files are up to date."
                        : "No catalog items found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete "{deleteTarget?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the item and all its versions from
              the catalog. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
