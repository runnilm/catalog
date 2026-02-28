import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { mockUsers } from "@/app/catalog/data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface UserPickerProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function UserPicker({ value, onChange }: UserPickerProps) {
  const [open, setOpen] = React.useState(false)

  function toggleUser(userId: string) {
    onChange(
      value.includes(userId)
        ? value.filter((id) => id !== userId)
        : [...value, userId]
    )
  }

  function removeUser(userId: string) {
    onChange(value.filter((id) => id !== userId))
  }

  const selectedUsers = mockUsers.filter((u) => value.includes(u.id))

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-9 w-full justify-between font-normal"
          >
            <span className="text-muted-foreground">
              {value.length > 0
                ? `${value.length} user${value.length > 1 ? "s" : ""} selected`
                : "Search users..."}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          style={{ width: "var(--radix-popover-trigger-width)" }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandInput placeholder="Search by name or email..." />
            <CommandList className="max-h-[200px]">
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {mockUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.name} ${user.email}`}
                    onSelect={() => toggleUser(user.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value.includes(user.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm">{user.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {user.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="gap-1 pr-1">
              {user.name}
              <button
                type="button"
                onClick={() => removeUser(user.id)}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
