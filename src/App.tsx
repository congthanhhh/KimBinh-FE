import { Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { DashboardPage } from "@/pages/DashboardPage"
import { DeliveryOrderCreatePage } from "@/pages/DeliveryOrderCreatePage"
import { DeliveryOrderDetailPage } from "@/pages/DeliveryOrderDetailPage"
import { DeliveryOrdersPage } from "@/pages/DeliveryOrdersPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { PurchaseOrderCreatePage } from "@/pages/purchase-orders/PurchaseOrderCreatePage"
import { PurchaseOrdersPage } from "@/pages/purchase-orders/PurchaseOrdersPage"
import { PurchaseRequestCreatePage } from "@/pages/PurchaseRequestCreatePage"
import { PurchaseRequestDetailPage } from "@/pages/PurchaseRequestDetailPage"
import { PurchaseRequestsPage } from "@/pages/purchase-requests/PurchaseRequestsPage"
import { TasksPage } from "@/pages/TasksPage"

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/purchase-requests" element={<PurchaseRequestsPage />} />
        <Route path="/purchase-requests/new" element={<PurchaseRequestCreatePage />} />
        <Route path="/purchase-requests/:id" element={<PurchaseRequestDetailPage />} />
        <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="/purchase-orders/create" element={<PurchaseOrderCreatePage />} />
        <Route path="/delivery-orders" element={<DeliveryOrdersPage />} />
        <Route path="/delivery-orders/create" element={<DeliveryOrderCreatePage />} />
        <Route path="/delivery-orders/:id" element={<DeliveryOrderDetailPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
