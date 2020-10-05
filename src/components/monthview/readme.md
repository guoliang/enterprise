---
title: MonthView
description: A Full page monthview shared component.
demo:
  embedded:
  - name: Full Page MonthView Example
    slug: example-index
  pages:
  - name: Disabling Weeks/Days
    slug: example-disable-weekends
  - name: Restricting Month Selection
    slug: test-restrict-month-selection
---

The setup for a monthview only involves creating an `<div>` with the class `monthview`. The monthview is also used in [datepicker](./datepicker) popup (isPopup option). and inside the [calendar](./calendar) component. This component works by using Locale plugin which provides data for the calendar for [all supported locales](./locale). This data includes start day of the week, format and date translations as well as UmAlQura and Gregorion calendars.

```html
<div class="monthview">
</div>
```

## Accessibility

The monthview is a very complex component to code for accessibility. We take the following approach:

- Add an `aria` label to the calendar element
- Add `aria-selected=true` to selected day
- Each calendar item should have an audible label to announce the day of week while arrowing through days
- For comparison, see a similar <a href="http://oaa-accessibility.org/example/15/" target="_blank">example</a>

## Keyboard Shortcuts

- <kbd>Tab</kbd> - Tabbing will tab across the header elements and into the monthview
- <kbd>Shift + Tab</kbd> reverses the direction of the tab order.
- <kbd>Up</kbd> and <kbd>Down</kbd> goes to the same day of the week in the previous or next week respectively. If the user advances past the end of the month they continue into the next or previous month as appropriate
- <kbd>Left</kbd> and <kbd>Right</kbd> advances one day to the next, also in a continuum. Visually, focus is moved from day to day and wraps from row to row in a grid of days and weeks
- <kbd>Control + Page Up</kbd> moves to the same date in the previous year
- <kbd>Control + Page Down</kbd> moves to the same date in the next year
- <kbd>Home</kbd> moves to the first day of the current month
- <kbd>End</kbd> moves to the last day of the current month
- <kbd>Page Up</kbd> moves to the same date in the previous month
- <kbd>Page Down</kbd> moves to the same date in the next month

## Upgrading from 3.X

- This is a new component for 4.x
