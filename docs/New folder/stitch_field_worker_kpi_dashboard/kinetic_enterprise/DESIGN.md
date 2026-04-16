# Design System Specification: The Architectural Intelligence

## 1. Overview & Creative North Star
**The Creative North Star: "The Precision Orchestrator"**

In the realm of workforce management, data is often overwhelming. Most systems fail by cluttering the user’s cognitive load with rigid grids and harsh borders. This design system rejects the "template" aesthetic in favor of **Architectural Intelligence**. 

We move beyond standard dashboard design by treating the interface as a high-end editorial piece. We utilize intentional asymmetry, significant negative space, and tonal layering to guide the eye. Instead of a "software tool," the experience should feel like a custom-tailored command center—authoritative, calm, and hyper-efficient. By prioritizing "breathing room" over density, we ensure that every data point feels intentional and every action feels decisive.

---

## 2. Color Philosophy
The palette is rooted in deep professional blues and a sophisticated grayscale, punctuated by high-contrast semantic status colors.

### The "No-Line" Rule
**Borders are a relic of the past.** To achieve a premium, seamless feel, this system prohibits the use of 1px solid borders for sectioning content. Boundaries must be defined solely through:
- **Background Color Shifts:** Placing a `surface-container-low` component against a `surface` background.
- **Tonal Transitions:** Using depth to imply containment.

### Surface Hierarchy & Nesting
Think of the UI as a series of stacked, premium materials. Use the `surface-container` tiers to create organic depth:
- **Base Layer:** `surface` (#f7f9fb)
- **Secondary Sections:** `surface-container-low` (#f2f4f6)
- **Primary Content Cards:** `surface-container-lowest` (#ffffff)
- **Nested Inner Elements:** `surface-container-high` (#e6e8ea)

### The "Glass & Gradient" Rule
To inject "soul" into the data-driven environment, primary actions and high-level KPIs should utilize subtle gradients. Transitioning from `primary` (#000000) to `on_primary_container` (#497cff) creates a sense of light and dimension that flat colors cannot replicate. For floating modals or overlays, use **Glassmorphism**: semi-transparent surfaces with a 20px backdrop blur to maintain context of the underlying data.

---

## 3. Typography
We utilize **Inter** for its mathematical precision and exceptional legibility at small sizes.

*   **Display (lg/md/sm):** Used for "At-a-Glance" workforce totals. These should feel monumental and authoritative.
*   **Headline & Title:** Use `headline-md` for section titles. Pair them with `title-sm` for sub-headers to create a clear editorial hierarchy.
*   **Body:** `body-md` is the workhorse for data tables and descriptions.
*   **Labels:** `label-md` and `label-sm` are strictly for metadata, status tags, and micro-copy. 

**The Editorial Edge:** Experiment with wide letter-spacing (0.05em) on `label-sm` in all-caps to create a sophisticated, "pro" appearance for technical data points.

---

## 4. Elevation & Depth
We eschew traditional drop shadows for **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card sitting on a `surface-container-low` background creates a natural lift.
*   **Ambient Shadows:** If an element must float (e.g., a dropdown or modal), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(25, 28, 30, 0.06);`. The shadow color is derived from `on_surface` to appear like natural ambient light.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use a "Ghost Border": the `outline-variant` token (#c6c6cd) at 15% opacity. Never use 100% opaque lines.

---

## 5. Components

### Cards & Layout
*   **Constraint:** No dividers. Use vertical white space (referencing the `xl` 0.75rem or `lg` 0.5rem scale) to separate groups.
*   **Style:** Cards use `surface-container-lowest`, a `0.5rem (lg)` corner radius, and no border.

### Buttons
*   **Primary:** High-contrast `primary` (#000000) background with `on_primary` text. Use a subtle linear gradient for a "lithographic" finish.
*   **Secondary:** `secondary_container` background. These should feel "recessed" into the page.
*   **Tertiary:** Ghost style. No background, only `on_surface_variant` text, transforming to `surface_container_low` on hover.

### KPI Rings & Data Visualization
*   **Vibrancy:** Use the high-contrast status colors (#10b981, #f59e0b, #ef4444) against `surface_container_highest` tracks.
*   **Stroke:** KPI rings should have a "tapered" look or use a subtle glow effect (soft shadow in the color of the status) to emphasize "vibrant" data.

### Data Tables
*   **Constraint:** No vertical lines. Use horizontal `surface-variant` subtle fills for striped rows or strictly whitespace.
*   **Header:** Use `label-md` in all-caps with increased tracking for a technical, high-end feel.

### Input Fields
*   **Style:** Minimalist. `surface-container-low` background with a `0.375rem (md)` radius. The focus state shouldn't be a thick border, but a transition to `surface-container-lowest` with a soft `surface_tint` ambient glow.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts (e.g., a wide 8-column main view paired with a 4-column "Insights" panel) to break the "standard dashboard" feel.
*   **Do** leverage `surface-bright` for specific "Focus Mode" areas to highlight critical workforce alerts.
*   **Do** use the `full` (9999px) roundedness for status chips to distinguish them from structural cards.

### Don't:
*   **Don't** use 1px dividers to separate list items; use 8px or 12px of vertical padding instead.
*   **Don't** use pure black for shadows. Use a tinted version of `on_surface`.
*   **Don't** cram data. If a table feels tight, increase the `surface` padding rather than shrinking the font.
*   **Don't** use high-contrast borders on input fields; it breaks the "Architectural" flow.