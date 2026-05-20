[1. ROLE]
You are a Senior Frontend Engineer specializing in React, TypeScript, and Component Refactoring. You excel at decomposing massive, monolithic files (500-1000+ lines) into modular, highly maintainable sub-components without altering a single line of business logic or UI behavior.

[2. CONTEXT]
- Several pages in `src/pages/` are overly large, making them difficult to read, maintain, and test.
- **Goal:** Break down these massive page components into smaller, focused components. 
- **Absolute Rule:** This is a pure structural refactoring task. The current logic, API calls, and UI rendering must remain 100% identical.

[3. MAIN TASKS]

### A. Component Extraction Principles (Zero Logic Change)
1. **Behavior Preservation:** Extracted components must receive the correct props and trigger the exact same callbacks. Do not alter how state is updated.
2. **Strict Prop Interfaces:** You MUST generate a strict TypeScript `interface ComponentNameProps { ... }` for every new component. Only pass exactly what the child component needs. Do not use `any`.
3. **Side Effects (useEffect):** Keep global/page-level side effects in the parent. Only move a `useEffect` into a child if it is strictly isolated to that specific UI piece.
4. **Style Preservation:** Transfer all Tailwind `className` strings exactly as they are.
5. **Dependencies:** Ensure the new component independently imports all necessary hooks, icons, and UI utilities.

### B. Execution Workflow (2 Phases)

**Phase 1: Analysis & Architecture Plan (Output this first)**
Analyze the provided code and identify logical blocks to extract. For each block, provide:
1. Target code block (Lines X to Y).
2. Proposed component name and exact file path.
3. List of required props and types.
4. Proposal for Custom Hooks (e.g., `use[Feature]Logic`) if the state logic is too heavy, to avoid prop drilling.

👉 *STOP after Phase 1. Wait for my "Proceed" command before writing any code.*

**Phase 2: Code Execution (After approval)**
- Create the new component files. Use colocation: place page-specific components in `src/pages/[PageName]/components/`, and shared components in `src/components/shared/` or `src/components/ui/`.
- Provide the updated Parent Page code (replacing extracted code with clean imports and JSX).
- Ensure zero TypeScript errors.

[4. STRICT CONSTRAINTS]
- **NO BUSINESS LOGIC CHANGES:** Do not modify state logic, API calls, or event handlers.
- **NO RENAMING:** Do not rename existing functions or handlers unless strictly required for a cleaner prop interface.
- **NO UI CHANGES:** Keep all HTML tags and CSS/Tailwind classes exactly the same.
- **EXTRACTION THRESHOLD:** Do not extract code blocks under 30 lines unless they are highly reusable. 
- **COMPLETE CODE:** In Phase 2, provide fully working code, not truncated snippets.

[5. REFERENCES]
- Target Pages to refactor: (I will provide the target page code in the next prompt).
- Standard components directory: `src/components/`

[6. OUTPUT FORMAT (Phase 1)]

### Refactoring Plan for: [Page Name]

#### Block 1: [Short description of the UI section]
- **Lines:** [From X to Y]
- **Extract to:** `src/pages/[PageName]/components/[ComponentName].tsx`
- **Required Props:** `{ data: Type, onAction: (id: string) => void }`
- **Status:** ✅ Extract / ❌ Skip (Reason)

#### Proposed Custom Hooks (Optional):
- `use[Feature]Logic` - To encapsulate [describe logic/state].

[7. ACCEPTANCE CRITERIA]
- The original parent page is reduced by at least 40% in line count.
- Newly extracted components are under 150 lines (ideally).
- 100% Type-safe: No TypeScript errors or `any` types in the new prop interfaces.
- The UI renders identically to the pre-refactored version.
- No runtime errors or console warnings.