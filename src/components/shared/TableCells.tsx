import type { ReactNode } from "react"

import { TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { displayValue } from "@/utils/formatters"

type CellProps = {
  children: ReactNode
  className?: string
}

type TruncatedCellProps = {
  value: ReactNode
  className?: string
  maxWidthClass?: string
}

type TwoLineCellProps = {
  primary: ReactNode
  secondary?: ReactNode
  className?: string
}

type FieldLine = {
  label: string
  value: ReactNode
  emphasis?: boolean
  title?: string
}

type CompositeCellProps = {
  lines: FieldLine[]
  className?: string
}

export function TruncatedCell({
  value,
  className,
  maxWidthClass = "max-w-[220px]",
}: TruncatedCellProps) {
  const renderedValue = typeof value === "string" || typeof value === "number" || value === null || value === undefined
    ? displayValue(value)
    : value

  return (
    <TableCell className={cn("min-w-0", maxWidthClass, className)}>
      <div className="truncate">
        {renderedValue}
      </div>
    </TableCell>
  )
}

export function TwoLineCell({ primary, secondary, className }: TwoLineCellProps) {
  return (
    <TableCell className={cn("min-w-0", className)}>
      <div className="min-w-0">
        <div className="truncate font-medium">
          {primary}
        </div>
        {secondary !== undefined && secondary !== null && (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {secondary}
          </div>
        )}
      </div>
    </TableCell>
  )
}

export function CompositeCell({ lines, className }: CompositeCellProps) {
  return (
    <TableCell className={cn("min-w-0", className)}>
      <div className="grid min-w-0 gap-0.5">
        {lines.map((line) => {
          const renderedValue = typeof line.value === "string" || typeof line.value === "number" || line.value === null || line.value === undefined
            ? displayValue(line.value)
            : line.value
          return (
            <div
              key={line.label}
              className={cn("flex min-w-0 items-baseline gap-1 text-xs", line.emphasis && "text-sm")}
            >
              <span className="shrink-0 text-muted-foreground">{line.label}:</span>
              <span className={cn("min-w-0 truncate", line.emphasis ? "font-medium text-foreground" : "text-muted-foreground")}>
                {renderedValue}
              </span>
            </div>
          )
        })}
      </div>
    </TableCell>
  )
}

export function CodeCell({ children, className }: CellProps) {
  const renderedChildren = typeof children === "string" || typeof children === "number" || children === null || children === undefined
    ? displayValue(children)
    : children

  return (
    <TableCell className={cn("w-32 max-w-36 font-medium whitespace-nowrap", className)}>
      <div className="truncate">
        {renderedChildren}
      </div>
    </TableCell>
  )
}

export function DateCell({ children, className }: CellProps) {
  return (
    <TableCell className={cn("w-28 whitespace-nowrap", className)}>
      {children}
    </TableCell>
  )
}

export function StatusCell({ children, className }: CellProps) {
  return (
    <TableCell className={cn("w-32 whitespace-nowrap", className)}>
      <div className="inline-flex max-w-full whitespace-nowrap">
        {children}
      </div>
    </TableCell>
  )
}

export function ActionsCell({ children, className }: CellProps) {
  return (
    <TableCell className={cn("w-56 whitespace-nowrap", className)}>
      <div className="flex flex-nowrap justify-start gap-2 sm:justify-end">
        {children}
      </div>
    </TableCell>
  )
}
