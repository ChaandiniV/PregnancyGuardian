# GraviLog - AI-Powered Pregnancy Health Assessment Platform

## Overview

GraviLog is a comprehensive web application designed to provide AI-powered pregnancy health risk assessment and guidance. The platform uses a modern full-stack architecture with React frontend, Express backend, and PostgreSQL database, integrated with OpenAI's GPT-4o model for intelligent symptom analysis and risk evaluation.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS for styling
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for symptom management and assessment processing
- **Session Management**: In-memory storage for development (designed for database scaling)

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database (serverless PostgreSQL)
- **Tables**: 
  - `assessments`: Stores user assessments with AI analysis
  - `symptoms`: Predefined symptom catalog with severity weights

## Key Components

### AI Integration
- **Model**: OpenAI GPT-4o for medical risk assessment
- **Service**: Dedicated OpenAI service module handling risk evaluation
- **Risk Levels**: Four-tier system (low, moderate, high) with urgency indicators
- **Output**: Structured JSON responses with confidence scores and recommendations

### Assessment Flow
1. **Symptom Selection**: Multi-step form with predefined symptom catalog
2. **Additional Information**: Gestational week, previous complications, additional symptoms
3. **AI Processing**: OpenAI analysis of combined symptom data
4. **Risk Assessment**: Structured output with recommendations and urgency levels
5. **Results Display**: User-friendly presentation of assessment results

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Shadcn/ui components for consistent design
- **Emergency Features**: Prominent emergency contact functionality
- **Medical Disclaimer**: Comprehensive legal disclaimers throughout the application

## Data Flow

1. **User Input**: Symptom selection and additional health information
2. **Validation**: Client-side validation with Zod schemas
3. **API Request**: Structured data sent to backend assessment endpoint
4. **AI Processing**: OpenAI service analyzes symptoms and generates risk assessment
5. **Database Storage**: Assessment results stored with unique session ID
6. **Response**: Structured assessment data returned to frontend
7. **Results Display**: User-friendly presentation with recommendations and next steps

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (PostgreSQL hosting)
- **AI Service**: OpenAI API for GPT-4o model access
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Forms**: React Hook Form with Hookform/resolvers

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Full TypeScript support across frontend and backend
- **Database Tools**: Drizzle ORM and Drizzle Kit for schema management

## Deployment Strategy

### Platform Configuration
- **Hosting**: Replit with autoscale deployment target
- **Build Process**: Vite frontend build + esbuild backend bundle
- **Port Configuration**: Internal port 5000, external port 80
- **Environment**: Node.js 20 with PostgreSQL 16 module

### Production Build
- **Frontend**: Static assets built to `dist/public`
- **Backend**: Bundled to `dist/index.js` with external packages
- **Static Serving**: Express serves built frontend in production mode
- **Environment Variables**: Database URL and OpenAI API key required

### Development Setup
- **Hot Reload**: Vite HMR for frontend changes
- **Backend Restart**: tsx with watch mode for backend changes
- **Database**: Drizzle push for schema synchronization
- **Type Safety**: Shared types between frontend and backend

## Changelog

```
Changelog:
- June 18, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```