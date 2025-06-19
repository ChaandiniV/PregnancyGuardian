# Pregnancy Health Risk Assessment App

An AI-powered web application that provides comprehensive pregnancy health risk assessments based on symptoms, gestational week, and medical history. The app evaluates user-reported symptoms and provides medically-informed recommendations with appropriate urgency levels.

## 🚀 Features

- **Comprehensive Symptom Assessment**: 30+ medically categorized pregnancy symptoms
- **Risk Stratification**: Emergency, high, moderate, and low risk classifications
- **Gestational Week Considerations**: Tailored recommendations based on pregnancy stage
- **Medical Recommendations**: Evidence-based guidance for each risk level
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Emergency Features**: Quick access to emergency contacts and disclaimers
- **Interactive Chat**: Optional conversational interface for symptom reporting

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **React Hook Form** with Zod validation
- **TanStack Query** for data fetching
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Zod** for request validation
- **In-memory storage** (configurable for PostgreSQL)

### Deployment
- **Netlify Functions** for serverless backend
- **Vercel**, **Railway**, **Render** configurations included
- **Docker** support for containerized deployment

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- Modern web browser

## 🏃‍♂️ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/pregnancy-health-assessment.git
cd pregnancy-health-assessment
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open in Browser
Navigate to `http://localhost:5000`

## 📁 Project Structure

```
pregnancy-health-assessment/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and types
│   │   └── hooks/          # Custom React hooks
├── server/                 # Backend Express server
│   ├── services/           # Business logic services
│   ├── routes.ts           # API route definitions
│   └── storage.ts          # Data persistence layer
├── shared/                 # Shared types and schemas
├── netlify/               # Netlify deployment functions
├── dist/                  # Built application (generated)
└── deployment configs     # Various platform configurations
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Development Tools
npm run check        # TypeScript type checking
npm run db:push      # Database schema sync (if using PostgreSQL)
```

## 🌐 Deployment Options

### Netlify (Recommended)
1. Push code to GitHub repository
2. Connect repository to Netlify
3. Build settings are configured in `netlify.toml`
4. Deploy automatically

### Vercel
1. Import repository to Vercel
2. Configuration in `vercel.json`
3. Deploy with zero configuration

### Railway
1. Connect GitHub repository
2. Configuration in `railway.json`
3. Automatic builds and deployment

### Render
1. Create new web service
2. Configuration in `render.yaml`
3. Auto-deploy from GitHub

### Docker
```bash
docker build -t pregnancy-app .
docker run -p 5000:5000 pregnancy-app
```

## 🏥 Medical Assessment Logic

### Risk Categories
- **Emergency**: Severe bleeding, chest pain, vision changes → Immediate medical attention
- **High Risk**: Bleeding, fever, contractions → Contact provider within 24 hours
- **Moderate**: Nausea, headaches, swelling → Schedule appointment within week
- **Low Risk**: Normal pregnancy symptoms → Continue routine care

### Assessment Factors
- Symptom severity and combination
- Gestational week considerations
- Previous pregnancy complications
- Additional reported symptoms

## 🔒 Privacy & Disclaimers

- No personal health information is permanently stored
- All assessments are for informational purposes only
- Users are directed to consult healthcare providers
- Comprehensive medical disclaimers included throughout app

## 🧪 Testing

The application includes:
- Form validation with Zod schemas
- Error boundary components
- Responsive design testing
- Cross-browser compatibility

## 📝 Environment Variables

For enhanced features (optional):
```bash
OPENAI_API_KEY=your_openai_key_here  # For AI-powered assessments
NODE_ENV=production                   # For production deployment
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is developed for educational and demonstration purposes. Not intended for actual medical diagnosis or treatment decisions.

## ⚠️ Medical Disclaimer

This application is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with questions about medical conditions or symptoms.

## 🆘 Support

For technical issues or questions:
- Create an issue on GitHub
- Check the deployment guides in the `/docs` folder
- Review the troubleshooting section below

## 🐛 Troubleshooting

### Common Issues

**Build Failures**
- Ensure Node.js 18+ is installed
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run check`

**API Connection Issues**
- Verify server is running on port 5000
- Check browser console for network errors
- Ensure CORS settings allow frontend domain

**Deployment Issues**
- Verify build command completes successfully
- Check platform-specific configuration files
- Review deployment logs for specific errors

---

Built with ❤️ for expectant mothers and healthcare accessibility