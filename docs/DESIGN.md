# Aura UI Design Contract

## 1. Design Intent and Product Personality
- Premium black music cockpit with mature contrast and restrained highlights.
- Fast, focused interaction with minimal visual noise.
- Player-first composition over decorative marketing layout.

## 2. Audience and Use-Context Signals
- Desktop/laptop users who multitask while listening.
- Mobile users needing quick one-handed controls.
- Mixed catalog use: built-in songs, local uploads, and cloud songs.

## 3. Visual Direction and Distinctive Moves
- Distinctive move: fullscreen Cover slide can enter a focused cover state with vertical gesture.
- Dark tonal surfaces, subtle borders, low-glow accents, and compact metadata.
- No neon, no cyberpunk effects, no decorative gradient overload.

## 4. Color, Typography, Spacing, and Density Decisions
- Palette direction: black/charcoal surfaces, neutral text ladder, restrained accent for active state.
- Typography roles:
  - Title: strong weight, compact tracking
  - Metadata: smaller, muted, non-competing
  - Actions: concise icon labels with clear focus state
- Spacing density: music-list compactness on desktop, larger touch targets on mobile.

## 5. Token Architecture and Alias Strategy
- Use existing semantic tokens from app theme (`bg-*`, `text-*`, `border-*`, `accent`).
- New UI states must consume semantic classes, not hardcoded inline color systems.
- Component-level adjustments may use opacity/scale only when they preserve semantic contrast.

## 6. Responsive Strategy and Cross-Viewport Adaptation Matrix
- Mobile:
  - Prioritize immediate playback and action taps.
  - Do not hide critical actions behind hover-only patterns.
- Tablet:
  - Preserve list readability and touch targets.
- Desktop:
  - Enable richer motion and focus transitions for cover and contextual menus.

## 7. Motion and Interaction Rules
- Motion style: smooth, controlled easing; avoid bounce-heavy choreography.
- Cover Focus Mode:
  - Desktop: vertical drag on cover area toggles focus view.
  - Mobile: explicit toggle interaction; no drag conflict with fullscreen dismiss.
- Respect reduced-motion preferences by reducing large transform travel.

## 8. Component Language and Morphology
- Song list and song card actions use compact icon-first affordances.
- Overflow actions use a dark contextual popover with keyboard support.
- Player controls remain stable across route navigation and source types.

## 9. Context Hygiene and Source Boundaries
- Derive decisions from current repo behavior and explicit user constraints.
- Do not import unrelated style memory or external brand mimicry.
- Preserve existing interaction contracts unless change is explicitly requested.

## 10. Accessibility Non-Negotiables
- Keyboard accessibility for icon-only controls and overflow menus.
- Visible focus states and valid aria labels for interactive icons.
- Minimum practical tap targets on mobile.
- Do not encode destructive actions for static songs.

## 11. Anti-Patterns to Avoid
- Non-functional action icons.
- Hover-only critical actions on touch devices.
- Nested interactive elements that trigger accidental playback.
- Gesture collisions between content interactions and modal close mechanics.

## 12. Implementation Notes for Future UI Tasks
- Keep list/card actions source-aware (`static` read-only).
- Keep playback entry points routed through `usePlaybackActions`.
- Validate fullscreen and list interactions after each UI patch with build + runtime smoke checks.
