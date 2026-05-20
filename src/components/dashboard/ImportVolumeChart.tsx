import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDemoStore } from "@/store/demoStore"
import type { DeliveryOrder, PurchaseRequest } from "@/types"

export function ImportVolumeChart() {
  const purchaseRequests = useDemoStore((state) => state.purchaseRequests)
  const deliveryOrders = useDemoStore((state) => state.deliveryOrders)
  const importVolume = buildImportVolume(purchaseRequests, deliveryOrders)

  return (
    <Card className="min-h-[320px]">
      <CardHeader>
        <CardTitle>Hoạt động nhập hàng</CardTitle>
        <CardDescription>Yêu cầu mua hàng và đơn nhập hàng theo tháng</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={importVolume} margin={{ left: -24, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Area
              type="monotone"
              dataKey="purchaseRequests"
              stroke="var(--color-chart-1)"
              fill="var(--color-chart-1)"
              fillOpacity={0.16}
              name="Yêu cầu mua hàng"
            />
            <Area
              type="monotone"
              dataKey="deliveryOrders"
              stroke="var(--color-chart-2)"
              fill="var(--color-chart-2)"
              fillOpacity={0.18}
              name="Đơn nhập hàng"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function buildImportVolume(purchaseRequests: PurchaseRequest[], deliveryOrders: DeliveryOrder[]) {
  const monthKeys = new Set<string>()

  for (const request of purchaseRequests) {
    monthKeys.add(request.requested_order_date.slice(0, 7))
  }

  if (monthKeys.size === 0) monthKeys.add(new Date().toISOString().slice(0, 7))

  return [...monthKeys].sort().map((monthKey) => ({
    month: formatMonthLabel(monthKey),
    purchaseRequests: purchaseRequests.filter((request) => request.requested_order_date.startsWith(monthKey)).length,
    deliveryOrders: deliveryOrders.filter((order) => {
      const relatedRequest = purchaseRequests.find((request) => request.requested_order_id === order.order_info.request_code)
      return relatedRequest?.requested_order_date.startsWith(monthKey) ?? false
    }).length,
  }))
}

function formatMonthLabel(monthKey: string) {
  const month = Number(monthKey.slice(5, 7))
  return Number.isNaN(month) ? monthKey : `T${month}`
}
