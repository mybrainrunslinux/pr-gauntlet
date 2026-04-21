# Issue #5: Board names with special characters display incorrectly

**Tier:** 1 — Clear  
**Labels:** bug, security, ui

## Description

Creating a board with `&`, `<`, or `>` in the name causes the board header to display escaped HTML entities or, in some cases, renders raw HTML if the name contains tag-like strings.

Examples:
- Board named `R&D Projects` displays as `R&amp;D Projects`
- Board named `<backend>` renders as an empty or broken header

## Steps to Reproduce

1. Create a new board
2. Name it `R&D Projects` (with an ampersand)
3. Observe: board header shows `R&amp;D Projects`
4. Also try: `<script>alert(1)</script>` and observe behavior

## Expected

Board names should be displayed exactly as entered. Special characters should not be escaped or interpreted as HTML.

## Notes

This is also a potential XSS vector if the input is not sanitized before being set as innerHTML. Please review the board header rendering code.
