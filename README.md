# GradePlanner

GradePlanner is a local-first mobile app for academic planning.
It centralizes courses, semesters, course units, assessments, activities, events, and deadlines in a single experience, with light/dark theme support and multiple languages.

## Overview

The project is designed to work well offline and keep strong visual consistency across screens.
Current product areas include:

- Home dashboard with semester summary, averages, and upcoming deadlines
- Course management (grading scale, minimum passing grade, period)
- Semester management (current, past, future)
- Course unit management by semester
- Item management (assessment, activity, event)
- Calendar with create/edit flows for commitments
- Profile with language, companion icon, theme, and week-start preferences
- Full onboarding setup flow

## Tech Stack

- Expo + React Native
- TypeScript (strict mode)
- React Navigation (stack + tabs)
- TanStack React Query (query/mutation/cache)
- SQLite (`expo-sqlite`) for local academic data
- AsyncStorage for app preferences
- Vitest for unit and integration testing
- Maestro for end-to-end testing

## Architecture (High-level)

The codebase is organized by layers and domain contexts:

```text
src/
  app/              # app container and navigation
  application/      # use cases and ports
  core/             # pure calculation/business rules
  db/               # schema, migrations, sqlite repository
  domain/           # entities, value objects, domain utilities
  features/         # feature hooks by module
  infrastructure/   # implementations of external dependencies
  presentation/     # app preferences, i18n, shared widgets
  ui/               # screens and visual components
  utils/            # shared utilities
```

## Design System and Styling

The project uses semantic tokens to enforce consistency:

- `colors` (primary/background/text/border/state colors)
- `spacing` (4, 8, 12, 16, 24, 32)
- `radius` (8, 12, 16, 20, pill)
- `typography` (h1/h2/h3/body/caption/overline)
- standard component and icon sizes

Key files:

- `src/ui/theme/tokens.tsx`
- `src/ui/theme/foundation.ts`
- `src/ui/components/primitives/*`

All components should consume tokens (no hardcoded hex values in screens).

## Languages and Localization

Supported languages:

- PT-PT
- PT-BR
- EN

Key files:

- `src/presentation/i18n/translations.ts`
- `src/presentation/i18n/calendarLocale.ts`
- `src/presentation/providers/AppPreferencesProvider.tsx`

## Companion Icon

Users can select a companion icon variant (dark purple, light purple, monochrome, green).
The selected variant is persisted and reflected in the global app header.

## Current Onboarding Flow

Current flow:

1. Welcome
2. User name
3. Course (name, institution, start date, expected completion date, scale, minimum grade)
4. Current semester (year/semester selection + calendar date pickers)
5. Course units (aligned with main app form structure)
6. Assessments/Activities/Events (per course unit, with type, date/time, and weight)

## Data and Persistence

- Academic data: local SQLite
- App preferences: AsyncStorage
- Mock-data mode available to validate UI and flows

Main data contexts:

- Profile
- Courses
- Semesters
- Course Units
- Activities/Deadlines
- Calendar
- Preferences

## Requirements

- Node.js 18+
- npm 9+
- Expo CLI (via `npx expo`)
- Android Studio (Android) or Xcode (iOS)

For E2E:

- Maestro CLI installed

## Installation

```bash
npm install
```

## Running the App

```bash
npm run start
```

Shortcuts:

```bash
npm run android
npm run ios
npm run web
```

## Important Scripts

```bash
npm run typecheck
npm run test
npm run test:core
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Testing

### Unit

Covers domain rules and use cases (for example grade calculations, validations, and application flows).

### Integration

Covers cross-layer flows (for example calendar create/update with in-memory repository contracts).

### End-to-end

Maestro flows are in `e2e/flows`.

Examples:

```bash
maestro test e2e/flows/onboarding_smoke.yaml
maestro test e2e/flows/calendar_create_item.yaml
```

## Troubleshooting

If bundler/assets cache causes stale behavior:

```bash
npx expo start -c
```

If `test:e2e` fails with `maestro: command not found`, install Maestro CLI first.

## Contribution Guidelines

- Keep components token-driven
- Avoid business logic inside screens; prefer hooks/use cases
- Route all user-facing text through i18n
- Add tests whenever relevant
- Validate with `typecheck` and `test` before opening a PR

## Project Status

The project is under active development.
It already has a functional foundation for real usage, with continuous focus on visual consistency, architecture quality, and test coverage.
