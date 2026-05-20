import { format } from "date-fns"

export const EMPTY_VALUE = "—"

export function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return EMPTY_VALUE
  return String(value)
}

export function isEmptyDisplayValue(value: unknown) {
  return value === null || value === undefined || value === "" || value === EMPTY_VALUE
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value: string | null | undefined) {
  if (!value) return EMPTY_VALUE

  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE

  return format(date, "dd/MM/yyyy")
}

export function formatOptionalDate(value: string | null | undefined) {
  return formatDate(value)
}
