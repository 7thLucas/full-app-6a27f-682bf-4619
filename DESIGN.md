# CVTailor Design Guidelines

## Color Palette
- **Primary**: Navy Blue `#1B2D5B` — trust, authority, professionalism
- **Secondary / Accent**: Emerald Green `#2ECC71` — action, success, growth
- **Background**: Off-white `#F8F9FA` — clean, open, breathable
- **Surface / Cards**: White `#FFFFFF` with subtle shadow
- **Text Primary**: Dark Charcoal `#2D2D2D`
- **Text Secondary**: Medium Gray `#6B7280`
- **Border / Divider**: Light Gray `#E5E7EB`
- **Error / Warning**: Warm Red `#EF4444`

## Typography
- **Display / Headings**: Inter (700 bold) — modern, geometric, legible at scale
- **Body**: Inter (400 regular) — consistent, clean reading experience
- **Mono / Code blocks**: JetBrains Mono — used for CV diff/highlight views
- **Scale**: 12 / 14 / 16 / 18 / 24 / 32 / 40 / 48px

## Elevation & Shadows
- **Level 0**: No shadow — flat surfaces (backgrounds)
- **Level 1**: `0 1px 3px rgba(0,0,0,0.08)` — cards, inputs
- **Level 2**: `0 4px 12px rgba(0,0,0,0.12)` — modals, dropdowns
- **Level 3**: `0 8px 24px rgba(0,0,0,0.16)` — overlays, side panels

## Spacing & Layout
- **Grid**: 12-column layout; max content width 1280px; gutter 24px
- **Spacing Scale**: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96px
- **Border Radius**: 4px (inputs), 8px (cards), 12px (modals), 9999px (pills/badges)

## Components
- **Buttons**: Primary (navy fill, white text, green hover); Secondary (outlined navy); Ghost (text only)
- **Input Fields**: Bordered, subtle focus ring in navy; clear placeholder text in gray
- **Progress Indicators**: Step-based progress bar with green fill for completed steps
- **Badges / Tags**: Pill-shaped, color-coded (green = match, yellow = partial, red = gap)
- **Cards**: White surface, Level-1 shadow, 8px radius, 24px internal padding
- **Upload Zone**: Dashed border, subtle green fill on hover/drag-over
- **Chat Bubbles (Mock Interview)**: User = right-aligned navy; AI = left-aligned gray with subtle border

## Tone & Copy
- Primarily Bahasa Indonesia (UI labels, CTAs, onboarding copy)
- English for technical terms and secondary labels
- Confident, direct CTAs: "Mulai Sekarang", "Analisis CV Saya", "Mulai Latihan"
- Supportive, coach-like feedback language in mock interview responses

## Key Screens
1. **Landing Page** — Hero with tagline, 3-step illustration, CTA "Mulai Sekarang"
2. **Onboarding / Input** — Two-panel: left CV upload, right job entry paste
3. **Analysis Loading** — Animated progress with step labels (Menganalisis, Menyesuaikan, Mempersiapkan)
4. **Tailored CV View** — Side-by-side original vs tailored with diff highlights; download button
5. **Prep Plan View** — Accordion checklist with categories, progress tracking
6. **Mock Interview** — Chat-style interface; question on top, text input below, score card after each answer
7. **Dashboard** — History of past sessions, quick re-run option
