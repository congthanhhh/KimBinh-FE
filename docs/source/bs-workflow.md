### CORE BUSINESS WORKFLOW (5 STAGES)
The end-to-end supply chain process flows as follows. The system and UI must support these steps and their associated data:

**1. Procurement (PR & PO)**
- **PR (Purchase Request):** Created by Production (`Requester`) specifying items, quantity, and `warehouse_deadline_date`.
- **PO (Purchase Order):** Created by Purchasing via SAP ERP. *Note: PR ↔ PO is a Many-to-Many (n-n) relationship.*

**2. Logistics Initiation (DO & Booking)**
- **DO (Delivery Order):** Represents the actual physical shipment, syncing Supplier and PO data from SAP.
- **Booking & SI:** Forwarder submits quotation (1hr SLA) -> Secures Booking (8hr SLA after approval) -> Submits Shipping Instruction (Shipper, Consignee, Gross Weight, CBM).

**3. Documentation & Tracking (HBL & Manifest)**
- **Doc Verification:** Cross-check Draft B.L, Commercial Invoice (CI), and Packing List (PL) within 1 hour.
- **HBL & Manifest:** Generate House Bill of Lading (HBL) and Manifest, linking specific Container and Seal numbers for customs.

**4. Customs & Port Execution**
- **Customs:** `customs_officer` submits declarations and tracks routing lanes (Green/Yellow/Red).
- **Port Operations:** `port_officer` verifies Telex Release, retrieves physical D.O at the port, and coordinates final delivery.

**5. Closing & Reconciliation**
- **Finance:** Accounting verifies Debit Notes, issues invoices, and updates debt status.
- **Warehouse:** Record actual receipt date to calculate `delay_days` against the PR's original deadline.
- **Archiving:** Final documents (Quotes, B.L, Customs, P.O.D) are archived to Google Drive.

*Global System Rule:* Throughout all stages, the Person In Charge (PIC) must continuously update task `progress` and `completed_at` timestamps in the system.