import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const pageSizeOptions = [5, 10, 20, 50]

type PaginationControlsProps = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  startIndex: number
  endIndex: number
  onPageSizeChange: (pageSize: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
  className?: string
}

export function PaginationControls({
  page,
  pageSize,
  totalItems,
  totalPages,
  startIndex,
  endIndex,
  onPageSizeChange,
  onPreviousPage,
  onNextPage,
  className,
}: PaginationControlsProps) {
  if (totalItems === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Không có dữ liệu
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        Hiển thị {startIndex + 1}-{endIndex} trong tổng số {totalItems} dòng
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <label className="flex items-center gap-2">
          <span>Hiển thị</span>
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span>dòng / trang</span>
        </label>
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={onPreviousPage}>
          Trước
        </Button>
        <span className="whitespace-nowrap px-1 font-medium text-foreground">
          Trang {page} / {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={onNextPage}>
          Sau
        </Button>
      </div>
    </div>
  )
}
