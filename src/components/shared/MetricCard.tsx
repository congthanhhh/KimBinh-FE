import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type MetricCardProps = {
  title: string
  value: string
  detail?: string
  icon: LucideIcon
  iconClassName?: string
}

export function MetricCard({ title, value, detail, icon: Icon, iconClassName }: MetricCardProps) {
  const isZero = value === "0" || value === ""

  return (
    <Card className="transition-all cursor-pointer hover:shadow-md">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className={cn("text-xs font-medium uppercase text-muted-foreground", isZero && "opacity-50")}>
          {title}
        </CardTitle>
        <Icon className={cn("size-4", iconClassName || "text-primary", isZero && "opacity-50")} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", isZero ? "opacity-50 font-medium" : "font-extrabold")}>
          {value}
        </div>
        {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
      </CardContent>
    </Card>
  )
}
