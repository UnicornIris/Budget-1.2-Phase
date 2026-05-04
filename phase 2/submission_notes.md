# Phase 2 Submission Notes

Use these notes when assembling the PDF so the non-code review items are addressed alongside the revised prototype.

## Horizontal Rationale

This prototype now emphasizes three distinct horizontal tasks instead of repeating the same add-flow twice:

1. `Income review`: open pay history, inspect source totals, and add a deposit.
2. `Expense capture`: quick-add a purchase, then review or edit expenses.
3. `Reports`: compare income vs. spending across multiple chart views.

## Screenshot Checklist

Include screenshots that show breadth across the product, not just repeated forms:

1. Activity home screen inside the `640 x 960` device frame.
2. Income review screen with the `Source mix` summary visible.
3. Expense capture screen with the quick-add purchase modal open.
4. A modal with the simulated on-screen keyboard visible.
5. Reports screen with the chart and recent activity list.
6. Goals screen.
7. Settings screen.

## Offline Note

The Phase 2 screens were updated to avoid live CDN dependencies. The reports chart now loads from the local project copy of `chart.js`.
