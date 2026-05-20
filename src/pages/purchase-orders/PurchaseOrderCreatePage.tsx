import { type FormEvent, memo, type ReactNode, useCallback, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { MultiSelectDropdown, type MultiSelectOption } from "@/components/shared/MultiSelectDropdown"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useDemoStore } from "@/store/demoStore"
import type { PurchaseOrderStatus } from "@/types/purchase-order.types"
import { displayValue } from "@/utils/formatters"

type PurchaseOrderFormState = {
  po_number: string
  supplier_code: string
  supplier_name: string
  po_date: string
  status: PurchaseOrderStatus
  total_value: string
  currency: "VND" | "USD" | "EUR"
  payment_terms: string
  delivery_terms: string
  purchase_request_ids: string[]
  delivery_order_ids: string[]
}

const purchaseOrderStatuses: PurchaseOrderStatus[] = [
  "DRAFT",
  "CREATED",
  "CONFIRMED",
  "PARTIALLY_DELIVERED",
  "COMPLETED",
  "CANCELLED",
]

const currencies: PurchaseOrderFormState["currency"][] = ["VND", "USD", "EUR"]

function buildInitialForm(): PurchaseOrderFormState {
  return {
    po_number: `PO-DEMO-${new Date().getTime().toString().slice(-5)}`,
    supplier_code: "",
    supplier_name: "",
    po_date: new Date().toISOString().slice(0, 10),
    status: "CREATED",
    total_value: "",
    currency: "VND",
    payment_terms: "",
    delivery_terms: "",
    purchase_request_ids: [],
    delivery_order_ids: [],
  }
}

export function PurchaseOrderCreatePage() {
  const navigate = useNavigate()
  const selectedRole = useDemoStore((state) => state.selectedRole)
  const purchaseRequests = useDemoStore((state) => state.purchaseRequests)
  const deliveryOrders = useDemoStore((state) => state.deliveryOrders)
  const createPurchaseOrder = useDemoStore((state) => state.createPurchaseOrder)
  const error = useDemoStore((state) => state.error)
  const [form, setForm] = useState(buildInitialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const canCreatePurchaseOrder = selectedRole === "admin" || selectedRole === "purchasing_manager"

  const purchaseRequestOptions = useMemo<MultiSelectOption[]>(
    () =>
      purchaseRequests.map((request) => ({
        value: request.id,
        label: `${request.requested_order_id} - ${request.item_name}`,
        description: `${request.quantity.toLocaleString()} ${request.unit} | ${request.status}`,
      })),
    [purchaseRequests]
  )
  const deliveryOrderOptions = useMemo<MultiSelectOption[]>(
    () =>
      deliveryOrders
        .filter((order) => order.order_info.status !== "CANCELLED")
        .map((order) => ({
          value: order.id,
          label: order.order_info.order_number,
          description: `${order.order_info.status} | PO ${displayValue(order.sap_integration.po_number)}`,
        })),
    [deliveryOrders]
  )

  const updateField = useCallback(<K extends keyof PurchaseOrderFormState>(key: K, value: PurchaseOrderFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canCreatePurchaseOrder) return

    setIsSubmitting(true)
    const created = await createPurchaseOrder({
      order_number: form.po_number.trim(),
      supplier_code: form.supplier_code.trim(),
      supplier_name: form.supplier_name.trim() || null,
      total_value: optionalNumber(form.total_value),
      purchase_contract_number: null,
      supplier_partner_id: null,
      status: form.status,
      notes: buildNotes(form),
      created_by_user_id: null,
      purchase_request_ids: form.purchase_request_ids,
      delivery_order_ids: form.delivery_order_ids,
    })
    setIsSubmitting(false)

    if (created) {
      setForm(buildInitialForm())
      navigate("/purchase-orders")
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Create Purchase Order"
        description="Create a mock PO and link it to multiple Purchase Requests and Delivery Orders through the documented bridge tables."
        action={
          <Button variant="outline" nativeButton={false} render={<Link to="/purchase-orders" />}>
            Back to list
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>PO information</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormGrid>
              <TextField label="PO number" required value={form.po_number} onChange={(value) => updateField("po_number", value)} />
              <TextField label="Supplier code" required value={form.supplier_code} onChange={(value) => updateField("supplier_code", value)} />
              <TextField label="Supplier name" value={form.supplier_name} onChange={(value) => updateField("supplier_name", value)} />
              <TextField label="PO date" type="date" value={form.po_date} onChange={(value) => updateField("po_date", value)} />
              <SelectField
                label="Status"
                value={form.status}
                options={purchaseOrderStatuses}
                onChange={(value) => updateField("status", value as PurchaseOrderStatus)}
              />
              <TextField label="Total value" type="number" value={form.total_value} onChange={(value) => updateField("total_value", value)} />
              <SelectField
                label="Currency"
                value={form.currency}
                options={currencies}
                onChange={(value) => updateField("currency", value as PurchaseOrderFormState["currency"])}
              />
              <TextField label="Payment terms" value={form.payment_terms} onChange={(value) => updateField("payment_terms", value)} />
              <TextField label="Delivery terms" value={form.delivery_terms} onChange={(value) => updateField("delivery_terms", value)} />
            </FormGrid>

            <div className="grid gap-3 lg:grid-cols-2">
              <MultiSelectDropdown
                label="Link PRs"
                options={purchaseRequestOptions}
                value={form.purchase_request_ids}
                onChange={(value) => updateField("purchase_request_ids", value)}
                placeholder="Select purchase requests"
                emptyMessage="No purchase requests available."
              />
              <MultiSelectDropdown
                label="Link DOs"
                options={deliveryOrderOptions}
                value={form.delivery_order_ids}
                onChange={(value) => updateField("delivery_order_ids", value)}
                placeholder="Select delivery orders"
                emptyMessage="No non-cancelled delivery orders available."
              />
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {!canCreatePurchaseOrder && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                Only Admin or Purchasing Manager can create purchase orders in this frontend demo.
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={!canCreatePurchaseOrder || isSubmitting}>
                {isSubmitting ? "Creating..." : "Create PO"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/purchase-orders")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

const FormGrid = memo(function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
})

const TextField = memo(function TextField({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <Input
        value={value}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  )
})

const SelectField = memo(function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  )
})

function optionalNumber(value: string) {
  if (!value.trim()) return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function buildNotes(form: PurchaseOrderFormState) {
  return [
    form.po_date ? `PO date: ${form.po_date}` : null,
    form.currency ? `Currency: ${form.currency}` : null,
    form.payment_terms.trim() ? `Payment terms: ${form.payment_terms.trim()}` : null,
    form.delivery_terms.trim() ? `Delivery terms: ${form.delivery_terms.trim()}` : null,
  ].filter((item): item is string => Boolean(item)).join("\n") || null
}
