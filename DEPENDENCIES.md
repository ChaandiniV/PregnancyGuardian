# Project Dependencies Guide

This document outlines all dependencies and setup requirements for the Pregnancy Health Assessment App.

## Node.js Dependencies (package.json)

All dependencies are managed through npm. No additional installation files needed.

### Core Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1", 
  "typescript": "5.6.3",
  "express": "^4.21.2",
  "vite": "^5.4.19"
}
```

### UI & Styling
```json
{
  "@radix-ui/react-*": "Various versions",
  "tailwindcss": "^3.4.17",
  "tailwindcss-animate": "^1.0.7",
  "lucide-react": "^0.453.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1"
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.55.0",
  "@hookform/resolvers": "^3.10.0",
  "zod": "^3.24.2",
  "zod-validation-error": "^3.4.0"
}
```

### Data & State Management
```json
{
  "@tanstack/react-query": "^5.60.5",
  "drizzle-orm": "^0.39.1",
  "drizzle-zod": "^0.7.0"
}
```

## Installation Commands

### Local Development Setup
```bash
# Clone repository
git clone https://github.com/your-username/pregnancy-health-assessment.git
cd pregnancy-health-assessment

# Install all dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm run start
```

## System Requirements

### Minimum Requirements
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- 2GB RAM available
- Modern web browser

### Recommended Setup
- Node.js 20.x LTS
- npm 10.x
- 4GB RAM
- Chrome, Firefox, Safari, or Edge (latest versions)

## Platform-Specific Notes

### Windows
```bash
# Use Node.js installer from nodejs.org
# Run commands in PowerShell or Command Prompt
npm install
npm run dev
```

### macOS
```bash
# Install using Homebrew (recommended)
brew install node
npm install
npm run dev
```

### Linux
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install project dependencies
npm install
npm run dev
```

## Optional Dependencies

### Database (PostgreSQL)
If using PostgreSQL instead of in-memory storage:
```bash
# Install PostgreSQL locally
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from postgresql.org
```

### Development Tools
```bash
# Global tools (optional)
npm install -g typescript
npm install -g @types/node
```

## Environment Variables

Create `.env` file in project root:
```bash
# Optional - for AI features
OPENAI_API_KEY=your_key_here

# Database (if using PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/pregnancy_app

# Environment
NODE_ENV=development
```

## Verification Steps

### Check Node.js Installation
```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 8.0.0 or higher
```

### Verify Project Setup
```bash
# Install dependencies
npm install

# Check for errors
npm run check

# Test build
npm run build

# Start development server
npm run dev
```

### Test Application
1. Open http://localhost:5000
2. Navigate through assessment form
3. Submit test assessment
4. Verify results display correctly

## Troubleshooting

### Common Issues

**Node.js Version Error**
```bash
# Update Node.js to latest LTS
# Download from nodejs.org or use version manager
```

**npm Install Failures**
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Port 5000 Already in Use**
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9
# Or use different port
PORT=3001 npm run dev
```

**TypeScript Errors**
```bash
# Check for type errors
npm run check
# Rebuild if needed
npm run build
```

## No Additional Files Needed

This project only requires:
- Node.js runtime
- npm package manager
- Project dependencies (installed via npm)

No Python requirements.txt, Ruby Gemfile, or other language-specific dependency files are needed.