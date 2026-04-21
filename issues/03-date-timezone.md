# Issue #3: Due date picker shows wrong date for non-UTC users

**Tier:** 1 — Clear  
**Labels:** bug, datetime

## Description

When setting a due date on a card, the displayed date is one day earlier than the date that was selected, for users in timezones west of UTC (UTC-1 through UTC-12).

A user in New York (UTC-5) who selects "April 25" as a due date sees "April 24" displayed on the card after saving.

## Steps to Reproduce

1. Set your system timezone to anything west of UTC (e.g. America/New_York)
2. Open or create a card
3. Set the due date to any date using the date picker
4. Save and close the card
5. Observe: displayed due date is one day before the selected date

## Expected

Displayed due date matches the date selected in the picker, regardless of timezone.

## Notes

UTC users and users east of UTC are unaffected. The stored value (ISO string) appears correct in the network payload — this is a parsing/display issue.
