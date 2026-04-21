# Issue #19: Memory leak during drag-drop operations

**Tier:** 4 — Chain (root cause)  
**Labels:** bug, memory-leak, performance  
**Note:** Root cause of chain #16, #17, #18, #20

## Description

A memory profiler shows the JavaScript heap growing at approximately 2MB per minute during normal board use. The growth accelerates when drag-drop operations are performed — each drag appears to add a persistent handler that is never removed.

After 20 minutes of use with regular dragging, the heap has grown by 30–50MB. After an hour, the browser tab is consuming 200–300MB more than on initial load.

## Evidence

Chrome DevTools > Memory > Allocation instrumentation on timeline:
- Each drag-end event creates a new closure in memory
- The closures are never garbage collected
- They appear to be event handler or subscription objects

## Steps to Reproduce (for profiling)

1. Open Chrome DevTools > Memory tab
2. Start "Allocation instrumentation on timeline"
3. Perform 20 drag-drop operations
4. Stop recording
5. Observe: 20+ retained closure objects, none released

## Notes

- The leak is in the drag-drop event handling layer specifically
- Unrelated to the number of cards or board complexity
- Closely related to how event subscriptions are managed in the drag-drop implementation
- Fixing this issue may have positive side effects on other stability issues
