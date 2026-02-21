# Animation Building & Debugging Log

## Phase 1: Test "The Source" (Vessel Pulse)

### Finding 1: Stacking Context Issue
**Observation**: 
The yellow "Pulse" animation appeared attached to/inside the `PurificationDebug` panel instead of being fixed to the viewport/vessel location.

**Root Cause**: 
The `PurificationDebug` panel uses `animate-in` and `slide-in` classes (Tailwind CSS). These apply CSS `transform` properties.
- **Rule**: A child with `position: fixed` behaves as `position: absolute` relative to a parent that has a `transform` (or `filter`, `perspective`, etc.).
- **Result**: The animation is positioning itself relative to the small Debug Panel, not the screen.

### Expected Behavior (The Goal)
The Yellow Pulse should appear **directly over the Purification Vessel card**, regardless of what triggered it.
- **Visual Location**: Roughly the bottom-right quadrant of the screen (or wherever the Vessel card sits).
- **Coordinate Basis**: It must use the **Viewport** as its reference frame (`fixed` position), ignoring any parent transforms from the Debug Panel or other containers.
- **Layering**: It must sit on top of *everything* (`z-index: 9999`), including the Debug Panel itself.

### Plan: Fix Implementation
To ensure the animation overlays everything regardless of where it's triggered:

1. **Use React Portal**: Move the `PurificationAnim` rendering to `document.body` using `createPortal`. This breaks it out of the DOM hierarchy visually while keeping logic in the component.
2. **Update Component**: Modify `PurificationAnim.tsx` to wrap its return in `createPortal`.


### Phase 4: Bomb Debug Trigger (Automatic)
The system has a failsafe trigger for purification called "Bomb Debug".

**The Trigger (`TRIGGER PURIFICATION (BOMB DEBUG)`):**
Located in `MiningRig.tsx` -> `checkPurification`:
-   **Conditions**:
    1.  `timeJumped`: The `nextDate` jumps forward by more than 1 second (simulating a time skip).
    2.  `timeReached`: The `timeRemainingMs` hits <= 0.
    3.  `redTokens > 0`: Must have tokens to purify.
-   **Action**: It logs `🔥 MiningRig: TRIGGER PURIFICATION (REAL)` and sets `debugAnim = true` (starts animation).
-   **Old Status**: DISABLED.
-   **Current Status**: **ACTIVE (WIRED)**.

### Phase 5: Final Wiring (Simple & Robust)
We unified the Automatic and Manual triggers into a single path.

1.  **Trigger Source > Sets `debugAnim = true`**
    *   **Auto**: Time Jump (>1s) OR Timer Finish (<=0).
    *   **Manual**: "TEST ANIMATION" button.
    
2.  **Animation Runs**
    *   `PurificationAnim` plays full sequence (Pulse -> Flight).
    
3.  **On Impact (Callback)**
    *   `PurificationVessel` calls `handlePurificationImpact` in `MiningRig`.
    *   **Action**: `RED -> 0`, `GOLD += RED`, Log Event, DB Sync.
    
This ensures visual feedback (Impact) is perfectly synced with the data change.
