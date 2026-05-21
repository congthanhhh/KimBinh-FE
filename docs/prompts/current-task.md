Act as an Expert Frontend Developer and UI/UX Engineer specializing in modern enterprise ERP dashboards.

Your task is to refactor the statistics section (PR, PO, DO statuses) by implementing a "Grouped Stats Container" layout to eliminate excessive white space, fix the "empty/bloated cards" issue, and improve scannability.

CRITICAL REFACTORING RULES:
1. ONLY modify the JSX markup and CSS styling classes.
2. DO NOT change, remove, or modify any business logic, React hooks (useState, useEffect), props, API data structures, variable names, or conditional calculations. 
3. Ensure the layout handles large numbers (e.g., 4+ digits like 1,250 or 99+) without breaking or clipping text.

SPECIFIC UI/UX IMPLEMENTATION REQUIREMENTS:

1. From Separate Cards to Unified Containers:
   - For each section (PR THEO TRẠNG THÁI, PO THEO TRẠNG THÁI, DO THEO TRẠNG THÁI), replace the grid of individual isolated cards with ONE unified, full-width white container block (Grouped Stats Container).
   - Inside this single container, arrange the statuses horizontally in a single row using Flexbox or an even Grid.
   - Separate each status item with a subtle vertical divider line (e.g., a faint right border or divider line) to create a clean, modern toolbar-style look.

2. Component Row Layout:
   - For each status item inside the row, make it compact. 
   - Arrange the elements horizontally or in a tight vertical stack: [Icon + Status Title] on one line/side, and the [Numerical Value] in a bold, prominent font next to or below it.
   - Remove any unnecessary paddings that cause bloating.

3. Visual Hierarchy & Semantic Colors (Retain & Refine):
   - Keep the semantic coloring logic for statuses:
     * Green (Success): Hoàn thành, Đã duyệt, Đã xác nhận.
     * Red/Orange (Danger/Warning): Trễ hạn, Đã hủy.
     * Blue/Yellow/Light Orange (Processing): Đang xử lý, Đang vận chuyển, Đang khai quan.
     * Gray/Neutral: Mới, Nháp.
   - Maintain the conditional dimming: If the counter value is exactly `0`, dim the entire item slot (reduce opacity to ~40-50% or use text-muted gray) so the user's eyes naturally focus only on active tasks (value > 0).

4. Responsiveness:
   - Ensure that on smaller screens, the horizontal row can either scale down or wrap gracefully (`flex-wrap`) without overlapping text.