# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

**Stardew Library** is a personal productivity dashboard application built with Vue 3, TypeScript, and Vite. It features a pomodoro timer, and sticky notes (memos) functionality, all themed around the Stardew Valley aesthetic.

## Architecture & Key Technologies

### Core Stack
- **Vue 3** (v3.5.31) with TypeScript
- **Vite** (v8.0.3) for fast development and building
- **Pinia** for state management
- **Vue I18n** for internationalization (English & Chinese)
- **UnoCSS** for utility-first CSS styling

### State Management Structure
- `theme.ts`: Manages UI theme (spring/summer/autumn/winter), language, music/sound effects settings
- `memo.ts`: Manages sticky notes with drag-and-drop positioning
- `pomodoro.ts`: Pomodoro timer state and settings

### Key Components
- **Pomodoro**: Focus timer with customizable intervals
- **Memos**: Sticky notes system with visual positioning
- **Settings**: User preferences management

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server with hot reload
pnpm dev

# Type checking
pnpm type-check

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Key Implementation Details

### Responsive Design
- Mobile: Single module view (only one panel visible at a time)
- Tablet/Desktop: Multiple modules can be visible simultaneously
- Adaptive button states showing active/inactive modules

### Theme System
- Four seasonal themes (spring, summer, autumn, winter)
- Dynamic background image loading
- CSS custom properties for theme-specific styling

### Data Persistence
- All user data stored in localStorage:
  - User settings (theme, language, preferences)
  - Memo notes and positions
  - Pomodoro timer state

## File Structure Patterns

### Vue Components
- Use `<script setup lang="ts">` syntax
- Components in `src/components/` are organized by feature
- Common/shared components in `src/components/common/`

### Stores
- Pinia stores in `src/stores/` with computed properties for derived state
- Heavy use of `useLocalStorage` from VueUse for automatic persistence

### Internationalization
- Translation files in `src/locales/` (en.ts, zh.ts)
- Use `useI18n()` composable for translations
- Available locales: 'zh', 'en'

## Recent Development Focus
Based on recent commits, the project has focused on:
- Memos component redesign and sorting fixes
- UI/UX enhancements with better visual feedback