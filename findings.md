# Findings & Research Discoveries (findings.md)

## 1. Recruiter Persona Behavioral Insights
- **Average initial scan time:** 6 to 10 seconds.
- **Top 3 things a Tech Recruiter looks for immediately:**
  1. Role, seniority, and primary stack alignment.
  2. Geographic location, work arrangement (Remote/Hybrid/Relocation), and current availability status.
  3. Direct download link for a PDF resume and immediate LinkedIn/GitHub links.
- **Top 3 things an Engineering Manager looks for in projects:**
  1. Architecture rationale: Why was technology X chosen over Y? What were the trade-offs?
  2. Concrete metrics: Not just "built a service", but "reduced p99 latency by 42% under 15,000 req/s".
  3. Code cleanliness: Live demo link and a well-structured GitHub repo with a crystal-clear README, architecture diagram, and setup instructions.

## 2. UI/UX Pro Max Synthesis
- **Recommended Theme:** Dark Mode OLED (#0B0B10 background, #161620 card surface, #22C55E accent green for live/status, #3B82F6 electric blue for tech focus).
- **Typography:**
  - Headings: `Outfit` (700, 600) for modern executive punch.
  - Body: `Inter` (400, 500) for maximum readability and legibility.
  - Metrics & Code: `JetBrains Mono` (500, 600) for technical precision.
- **Micro-Interactions:**
  - Live status indicator (subtle pulse green dot).
  - Quick-copy email button with floating toast notification.
  - Interactive Project STAR modal for engineering managers who want technical depth without leaving the page.
- **Anti-Patterns to Avoid:**
  - Arbitrary progress bars (e.g., "Node.js 90%").
  - Auto-playing music or unskippable canvas loaders.
  - Generic lorem ipsum and missing project links.
  - Low contrast text failing WCAG AA.
