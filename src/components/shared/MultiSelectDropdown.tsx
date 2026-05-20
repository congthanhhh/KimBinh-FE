import { memo, useMemo } from "react"
import { Check, ChevronDown, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type MultiSelectOption = {
  value: string
  label: string
  description?: string | null
  disabled?: boolean
}

type MultiSelectDropdownProps = {
  label: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (nextValue: string[]) => void
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

function MultiSelectDropdownBase({
  label,
  options,
  value,
  onChange,
  placeholder = "Select records",
  emptyMessage = "No records available.",
  disabled,
  required,
  className,
}: MultiSelectDropdownProps) {
  const selectedSet = useMemo(() => new Set(value), [value])
  const selectedOptions = useMemo(
    () => options.filter((option) => selectedSet.has(option.value)),
    [options, selectedSet]
  )
  const summary = selectedOptions.length > 0
    ? selectedOptions.map((option) => option.label).join(", ")
    : placeholder

  function toggleOption(optionValue: string) {
    const nextSet = new Set(value)
    if (nextSet.has(optionValue)) {
      nextSet.delete(optionValue)
    } else {
      nextSet.add(optionValue)
    }
    onChange([...nextSet])
  }

  return (
    <div className={cn("grid gap-1 text-sm", className)}>
      <div className="font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-9 w-full justify-between px-3 py-2 text-left"
              disabled={disabled}
            />
          }
        >
          <span className={cn("min-w-0 truncate", selectedOptions.length === 0 && "text-muted-foreground")}>
            {summary}
          </span>
          <ChevronDown className="ml-2 size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-80 min-w-80 p-2">
          <div className="flex items-center justify-between gap-2 px-1 pb-1">
            <DropdownMenuLabel className="px-0">{label}</DropdownMenuLabel>
            {selectedOptions.length > 0 && (
              <Button type="button" variant="ghost" size="xs" onClick={() => onChange([])}>
                <X className="size-3" />
                Clear
              </Button>
            )}
          </div>
          <DropdownMenuSeparator />
          <div className="space-y-1 py-1">
            {options.map((option) => {
              const checked = selectedSet.has(option.value)

              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm outline-none hover:bg-muted focus:bg-muted",
                    option.disabled && "pointer-events-none opacity-50"
                  )}
                  onClick={() => toggleOption(option.value)}
                  disabled={option.disabled}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                      checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"
                    )}
                  >
                    {checked && <Check className="size-3" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{option.label}</span>
                    {option.description && (
                      <span className="block truncate text-xs text-muted-foreground">{option.description}</span>
                    )}
                  </span>
                </button>
              )
            })}
            {options.length === 0 && (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedOptions.length > 0 && (
        <div className="flex min-h-6 flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <span key={option.value} className="max-w-full truncate rounded-md border bg-muted/40 px-2 py-0.5 text-xs">
              {option.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export const MultiSelectDropdown = memo(MultiSelectDropdownBase)
