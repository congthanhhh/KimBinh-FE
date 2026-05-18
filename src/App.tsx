import { Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { DashboardPage } from "@/pages/DashboardPage"
import { DeliveryOrderDetailPage } from "@/pages/DeliveryOrderDetailPage"
import { DeliveryOrdersPage } from "@/pages/DeliveryOrdersPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { PurchaseRequestsPage } from "@/pages/PurchaseRequestsPage"
import { TasksPage } from "@/pages/TasksPage"

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/purchase-requests" element={<PurchaseRequestsPage />} />
        <Route path="/delivery-orders" element={<DeliveryOrdersPage />} />
        <Route path="/delivery-orders/:id" element={<DeliveryOrderDetailPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
