# Phase 2 Submission Notes

Use these notes when assembling the PDF so the non-code review items are addressed alongside the revised prototype.

## Horizontal Rationale

This prototype now emphasizes three distinct horizontal tasks instead of repeating the same add-flow twice:

1. `Activity`: filter recent entries, switch between income and expense logging, and add a new transaction directly on the screen.
2. `Goals`: create a savings goal, edit it inline, and enter savings with the on-screen keyboard visible.
3. `Reports`: compare income vs. spending across multiple chart views.

## Screenshot Checklist

Include screenshots that show breadth across the product, not just repeated forms:

1. Activity home screen inside the `640 x 960` device frame.
2. Activity screen with the inline composer set to `Expense`.
3. Activity screen with the inline composer switched to `Income`.
4. Activity or Goals with the simulated on-screen keyboard visible while typing.
5. Reports screen with the chart and recent activity list.
6. Goals screen.
7. Settings screen.

## Offline Note

The Phase 2 screens were updated to avoid live CDN dependencies. The reports chart now loads from the local project copy of `chart.js`.
