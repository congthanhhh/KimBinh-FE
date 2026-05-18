import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const factoryReadiness = [
  { factory: "Lắp ráp Bình Dương", readiness: 78 },
  { factory: "Hoàn thiện Hải Phòng", readiness: 64 },
  { factory: "Linh kiện Đà Nẵng", readiness: 86 },
]

export function FactoryStatusList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mức sẵn sàng nhà máy</CardTitle>
        <CardDescription>Tỷ lệ vật tư nhập về cho các điểm sản xuất đang hoạt động</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {factoryReadiness.map((item) => (
          <div key={item.factory} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.factory}</span>
              <span className="text-muted-foreground">{item.readiness}%</span>
            </div>
            <Progress value={item.readiness} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
