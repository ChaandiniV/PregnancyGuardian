# Local Development Setup Guide

Complete instructions for running the Pregnancy Health Assessment App locally on your machine.

## Prerequisites

Before starting, ensure you have:
- **Node.js 18 or higher** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Code editor** (VS Code recommended)

## Installation Steps

### 1. Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/your-username/pregnancy-health-assessment.git

# Navigate to project directory
cd pregnancy-health-assessment
```

### 2. Install Dependencies

```bash
# Install all required packages
npm install
```

This will install all dependencies listed in `package.json` including:
- React, TypeScript, Vite for frontend
- Express, Drizzle ORM for backend
- UI components and styling libraries

### 3. Start Development Server

```bash
# Start both frontend and backend
npm run dev
```

The application will be available at: `http://localhost:5000`

## Project Structure Overview

```
your-project/
├── client/src/           # React frontend
│   ├── components/       # UI components
│   ├── pages/           # Route pages
│   └── lib/             # Utilities
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   └── storage.ts       # Data layer
├── shared/              # Common types
└── netlify/            # Deployment functions
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run check
```

## Making Changes

### Frontend Development
- Edit files in `client/src/`
- Changes auto-reload in browser
- Components use Tailwind CSS for styling

### Backend Development
- Edit files in `server/`
- API routes defined in `server/routes.ts`
- Server restarts automatically on changes

### Adding New Features
1. Create components in `client/src/components/`
2. Add pages in `client/src/pages/`
3. Update API routes in `server/routes.ts`
4. Add types in `shared/schema.ts`

## Testing Locally

### Frontend Testing
- Open `http://localhost:5000`
- Test responsive design using browser dev tools
- Check all form validations work

### Backend Testing
- API endpoints available at `http://localhost:5000/api/`
- Test endpoints:
  - `GET /api/health` - Server status
  - `GET /api/symptoms` - Available symptoms
  - `POST /api/assessments` - Submit assessment

### Manual Testing Workflow
1. Navigate through all pages
2. Submit symptom assessment form
3. Verify risk calculation results
4. Test emergency contact features
5. Check mobile responsiveness

## Environment Configuration

### Optional Environment Variables
Create `.env` file in root directory:

```bash
# Optional - for enhanced AI features
OPENAI_API_KEY=your_key_here

# Development environment
NODE_ENV=development
```

### Database Configuration (Optional)
By default, the app uses in-memory storage. To use PostgreSQL:

1. Install PostgreSQL locally
2. Create database
3. Add connection string to `.env`:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/pregnancy_app
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check for type errors
npm run check

# Most errors resolve after rebuilding
npm run build
```

### Build Failures
```bash
# Clear build cache
rm -rf dist/
npm run build
```

## Making Your First Change

### Add a New Symptom
1. Edit `server/storage.ts`
2. Add symptom to initialization array
3. Restart server with `npm run dev`

### Customize Styling
1. Edit `client/src/index.css` for global styles
2. Use Tailwind classes in components
3. Changes appear immediately

### Modify Risk Assessment
1. Edit `server/routes.ts`
2. Update assessment logic in `/api/assessments` endpoint
3. Test with form submission

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add your feature description"

# Push to GitHub
git push origin feature/your-feature-name
```

## Preparing for Deployment

### Build Production Version
```bash
npm run build
```

### Test Production Build
```bash
npm run start
```

### Deploy to Platform
- Push changes to GitHub
- Platform (Netlify/Vercel) auto-deploys
- Check live URL for functionality

## Getting Help

### Common Resources
- React Documentation: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/
- TypeScript: https://www.typescriptlang.org/

### Debugging Tips
- Use browser dev tools console
- Check Network tab for API errors
- Review server logs in terminal
- Use React Developer Tools extension

Your local development environment is now ready for building and testing the pregnancy health assessment application.