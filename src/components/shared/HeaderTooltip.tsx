import { CircleHelp } from "lucide-react"

type HeaderTooltipProps = {
  label: string
  subtitle?: string
  tooltip: string
}

export function HeaderTooltip({ label, subtitle, tooltip }: HeaderTooltipProps) {
  return (
    <span
      aria-label={`${label}: ${tooltip}`}
      className="group relative inline-flex min-w-0 flex-col items-start gap-0.5 align-middle focus:outline-none"
      tabIndex={0}
    >
      <span className="inline-flex min-w-0 items-center gap-1">
        <span className="truncate">{label}</span>
        <CircleHelp
          aria-hidden="true"
          className="size-3 shrink-0 text-muted-foreground/70"
          strokeWidth={2}
        />
      </span>
      {subtitle && (
        <span className="block max-w-full truncate text-[11px] font-normal leading-tight text-muted-foreground">
          {subtitle}
        </span>
      )}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full w-fit z-50 mt-1 hidden -translate-x-1/2 whitespace-normal rounded-md border bg-popover px-2.5 py-1.5 text-xs font-normal normal-case leading-snug text-popover-foreground shadow-md group-hover:block group-focus-within:block"
      >
        {tooltip}
      </span>
    </span>
  )
}
