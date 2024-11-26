# Oddly Focus

A scientifically-backed focus and productivity tracking application built with Next.js. Oddly Focus helps users maintain and improve their concentration through advanced tracking methods and insights.

## Features

- 🧠 Scientific focus tracking
- 📊 Real-time focus metrics
- 💾 Client-side data storage
- 🔄 Optional cloud sync
- 📱 Responsive design
- 🌙 Dark mode support
- 📈 Detailed analytics
- ⚡ Offline support

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide Icons
- **Local Storage:** IndexedDB
- **State Management:** React Context + Hooks
- **Form Handling:** React Hook Form
- **Dev Tools:** ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd oddly-focus
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Dashboard views
│   ├── focus/            # Focus tracking features
│   ├── analytics/        # Analytics features
│   └── settings/         # User settings
├── components/            # React components
│   ├── ui/              # Reusable UI components
│   ├── focus/           # Focus-related components
│   ├── analytics/       # Analytics components
│   └── shared/          # Shared components
├── lib/                  # Utilities
│   ├── db/              # Database operations
│   ├── hooks/           # Custom hooks
│   └── utils/           # Helper functions
├── types/                # TypeScript types
└── constants/            # App constants
```

## Core Features Implementation

### Focus Tracking
- Real-time activity monitoring
- Focus score calculation
- Flow state detection
- Interruption tracking
- Session management

### Data Storage
- IndexedDB for offline storage
- Optional cloud sync
- Data export/import
- Privacy-focused design

### Analytics
- Focus patterns visualization
- Productivity trends
- Personal insights
- Progress tracking

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Add other variables as needed
```

### ESLint Configuration
`.eslintrc.json`:
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }

## Component Library Usage

### Focus Tracker Component
The core component for tracking focus sessions:

```typescript
import { FocusTracker } from '@/components/focus/focus-tracker';

// Usage
<FocusTracker
  onSessionEnd={(sessionData) => {
    // Handle session data
  }}
/>
```

### Analytics Dashboard
Visualize focus patterns and productivity metrics:

```typescript
import { AnalyticsDashboard } from '@/components/analytics/dashboard';

// Usage
<AnalyticsDashboard 
  timeRange="week"
  metrics={['focus-score', 'flow-states', 'interruptions']}
/>
```

## Best Practices

### State Management
- Use React Context for global state
- Keep component state local when possible
- Implement proper data persistence strategy

### Performance
- Implement proper memoization
- Optimize re-renders
- Use proper loading states
- Implement code splitting

### Accessibility
- Proper ARIA labels
- Keyboard navigation
- Color contrast
- Screen reader support

## Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Import project to Vercel
3. Configure build settings
4. Deploy

### Manual Deployment
1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Scientific research on focus and productivity
- Next.js team for the amazing framework
- shadcn for the UI components
- Open source community

## Contact

For any queries or suggestions, please open an issue or contact the maintainers.

---

Made with ❤️ by Prixar

}
```