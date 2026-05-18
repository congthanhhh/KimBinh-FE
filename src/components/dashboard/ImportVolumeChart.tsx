import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { importVolume } from "@/data/mock-data"

export function ImportVolumeChart() {
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
