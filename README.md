# Blogx Vue

A modern blog platform built with Vue 3, featuring article management, user system, admin panel, and interactive features.

## Tech Stack

- **Frontend Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: SCSS
- **Markdown**: md-editor-v3, marked
- **HTTP Client**: Axios

## Features

### User Features
- User registration and login
- Article browsing and reading
- Article collection/favorites
- Comment system
- User profile and settings
- Browse history
- Follow/followers
- AI chat assistant
- Message notifications

### Admin Features
- Dashboard with statistics
- Article management (publish, edit, examine)
- User management
- Image management
- Site settings
- Operation logs

## Project Structure

```
src/
├── api/           # API requests
├── components/    # Reusable components
├── composables/   # Vue composables
├── plugins/       # Vue plugins
├── router/        # Routing configuration
├── stores/        # Pinia stores
├── styles/        # Global styles
├── types/         # TypeScript types
├── utils/         # Utility functions
└── views/         # Page components
    ├── admin/     # Admin panel pages
    ├── article/   # Article related pages
    ├── center/    # User center pages
    ├── chat/      # AI chat page
    ├── home/      # Home page
    ├── message/   # Message page
    ├── search/    # Search page
    ├── settings/  # Settings page
    └── user/      # User auth pages
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## License

MIT
