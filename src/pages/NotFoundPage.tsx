import { Link } from "react-router-dom"

import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Không tìm thấy trang" description="Trang bạn yêu cầu không tồn tại trong hệ thống." />
      <Button render={<Link to="/dashboard" />}>Về tổng quan</Button>
    </div>
  )
}
