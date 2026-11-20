# Reptilr mobile UI plan

## Design direction

Reptilr is a local care journal for reptile keepers. Its interface should make it easy to identify an animal, review recent care, and record a feeding or measurement without implying health advice that the app cannot provide.

The visual signature is a quiet charcoal workspace with a baby blue active-state spine. The animal and current task lead each page. Records use readable rows and purposeful grouping rather than a dashboard of interchangeable cards.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| Charcoal | `#252525` | App foundation and primary text on light controls |
| Baby blue | `#89CFF0` | Primary actions, active navigation, and keyboard focus |
| Raised charcoal | `#303030` | Dialogs and raised form surfaces |
| Divider | `#515151` | Grouping and separators |
| Primary text | `#F7F7F7` | Headings and key values |
| Secondary text | `#C2C2C2` | Dates and supporting information |

Use the existing system sans-serif stack so the Android app works offline and loads without a remote font. Use 30–36 px page titles, 20–24 px section titles, 16 px body text, and 14 px supporting text. Keep page content left aligned, mobile gutters at 16–20 px, and text lines under 80 characters where practical. Controls need at least 44 px touch targets.

## Shared shell

On reptile pages, keep the animal name visible with an obvious route back to the collection. Use a fixed, safe-area-aware bottom navigation bar on mobile with text labels for **Overview**, **Feedings**, and **Growth**. Mark the current destination with baby blue and a non-color cue. On wider screens, place the same destinations in a compact side rail. Reserve enough page padding so fixed navigation never hides content.

```text
Mobile
┌────────────────────────────┐
│ ‹ Your reptiles            │
│ Noodle · Ball python       │
│                            │
│ Page content               │
│                            │
│ Overview Feedings Growth   │
└────────────────────────────┘

Wide screen
┌──────────────┬─────────────────────────────┐
│ Noodle       │ Page title                   │
│ Overview     │                              │
│ Feedings     │ Page content                 │
│ Growth       │                              │
└──────────────┴─────────────────────────────┘
```

## Page specifications

### Collection: `/`

**Primary task:** Open an existing reptile or start a new care record.

Show the Reptilr name, “Your reptiles,” collection count, and a prominent **Add reptile** action. Use readable full-width rows with name, species, and birthday when available. Keep the row itself easy to tap. In the empty state, explain that adding a reptile starts its care record and keep the add action visible. Keep loading and failure feedback clear and local; do not imply a backend connection is required.

```text
┌────────────────────────────┐
│ Reptilr                    │
│ Your reptiles        2     │
│ [ Add reptile            ] │
│                            │
│ Noodle                  ›  │
│ Ball python · Born May 2020│
│ ────────────────────────── │
│ Mango                   ›  │
│ Leopard gecko             │
└────────────────────────────┘
```

### Overview: `/reptile/:id`

**Primary task:** Understand the animal’s latest recorded care at a glance.

Lead with the reptile name and species, then show age, latest weight, latest length, and last shed. Follow with the newest measurements and feeding record, with links to their histories. Distinguish missing values from zero and give each empty history a direct next step.

```text
┌────────────────────────────┐
│ ‹ Your reptiles            │
│ Noodle                     │
│ Ball python                │
│                            │
│ Age       Weight   Length  │
│ 4 years   412 g    91 cm   │
│ Last shed · Not recorded   │
│                            │
│ Recent measurements   All  │
│ 10 Nov · 412 g · 91 cm     │
│ Recent feeding        All  │
│ 16 Nov · Large mouse       │
└────────────────────────────┘
```

### Feedings: `/reptile/:id/feedings`

**Primary task:** Record a meal or review past meals.

Make feeding history the primary content, with a prominent **Add feeding entry** action that opens a responsive sheet on mobile and dialog on desktop. Keep the history above the recent-versus-prior frequency comparison, label its date ranges, and describe the result without framing it as a recommendation. Show each meal’s date, food type, amount, and supplement state. Reuse the same form for editing, provide a clear cancel action, and retain entries when a save or delete fails.

```text
┌────────────────────────────┐
│ Noodle · Feedings          │
│ Feedings                   │
│ [ Add feeding entry         ] │
│ Feeding history            │
│ 16 Nov · Large mouse       │
│ 1 item · Supplemented      │
│ Edit                       │
│                            │
│ Eating pattern             │
│ Recent 3 · Previous 2      │
└────────────────────────────┘
```

### Growth: `/reptile/:id/stats`

**Primary task:** Record and compare dated measurements.

Call the page **Growth** in navigation and headings. Make newest-first measurement history the primary content, above the latest weight and length summary. A prominent **Add weight entry** action opens a responsive sheet on mobile and dialog on desktop. Do not add a chart or infer a trend from the available records. Explain the empty state and keep save or delete errors visible.

```text
┌────────────────────────────┐
│ Noodle · Growth            │
│ Growth                     │
│ [ Add weight entry    ]  │
│ Measurement history        │
│ 10 Nov · 412 g · 91 cm     │
│ Edit                  Delete│
│                            │
│ Latest · 10 Nov            │
│ 412 g · 91 cm              │
└────────────────────────────┘
```

## Review against the brief

The plan keeps charcoal as the foundation and baby blue as the interactive accent. It does not introduce the light-paper palette or decorative serif typography from one alternative because those choices would replace rather than refine the existing brand. It also avoids generic metric cards and an unsupported growth chart. Instead, a labeled bottom navigation pattern and a clear animal identity make the mobile workflow specific to a multi-page care log.

## Accessibility and responsive behavior

- Preserve readable contrast, visible keyboard focus, semantic headings, and accessible action names.
- Keep controls comfortably tappable and forms usable with the on-screen keyboard.
- Respect safe areas and reduced-motion preferences.
- Keep the mobile layout single-column. Add a side rail and wider content measure only when space permits.
- Preserve loading, error, empty, editing, and saving states.
