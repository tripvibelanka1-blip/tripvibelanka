<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI/UX Design Guidelines & Enforcement

For all UI/UX design, frontend development, component creation, and styling tasks, always use the **UI/UX Pro Max** skill located at `.agents/skills/ui-ux-pro-max/`.

- **Design System Generation**: When designing new pages, layouts, or visual aesthetics, query the design system database via `python .agents/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --design-system`.
- **Domain & Stack Guidance**: Query specific domains (`style`, `color`, `typography`, `ux`, `chart`, `icons`, `gsap`) and stack-specific guidelines (`--stack nextjs`, `react`, `html-tailwind`, etc.).
- **Visual Standards**: Strict color contrast (>=4.5:1), 4/8dp spacing rhythm, vector SVG icons (Lucide/Phosphor/Heroicons - no emojis as icons), fluid responsiveness, and accessible interactions.

# Taste Skill & Anti-Slop Frontend Guidelines

For landing pages, marketing sites, and high-aesthetic web development, activate the **Taste Skill** (`.agents/skills/taste-skill/SKILL.md`):

- **Design Read**: Always analyze the brief and state a one-line Design Read (`page kind` + `audience` + `vibe` + `aesthetic family`).
- **Three Dials**: Calibrate `DESIGN_VARIANCE` (1–10), `MOTION_INTENSITY` (1–10), and `VISUAL_DENSITY` (1–10).
- **Anti-Slop**: Reject generic AI-purple gradients, generic three-card feature grids, and clichéd marketing buzzwords (*"Elevate"*, *"Seamless"*, *"Next-Gen"*).
- **Specialized Aesthetics**: Use `.agents/skills/minimalist-skill/`, `.agents/skills/brutalist-skill/`, and `.agents/skills/soft-skill/` for matching artistic directions.
