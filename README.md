# Automated CRM - Lead Scoring & Analytics Platform

A modern, full-stack Customer Relationship Management (CRM) system with advanced lead scoring, analytics dashboards, and machine learning model comparison capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)

## 🎯 Overview

This CRM platform helps businesses manage leads, score them using multiple algorithms, and visualize key metrics through interactive dashboards. The system compares rule-based, machine learning, and random forest models to help you choose the best scoring approach.

**Key Capabilities:**
- Manage 1000+ leads with advanced pagination
- Real-time lead scoring using multiple algorithms
- Comprehensive analytics dashboard with KPIs and trends
- Model comparison interface for algorithm evaluation
- Sparsity experiment tracking for model accuracy
- Lead status tracking and interaction history

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│              Vite Dev Server (Port 5173)                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  NestJS Backend                          │
│                 (Port 3000)                              │
│    ┌─────────────────────────────────────────────┐      │
│    │ Leads Module      Analytics Module          │      │
│    │ Scoring Module    Prisma ORM                │      │
│    └─────────────────────────────────────────────┘      │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   ┌─────────┐           ┌──────────────┐
   │PostgreSQL│           │FastAPI Service│
   │ (Neon)   │           │(Port 8000)    │
   └──────────┘           └───────────────┘
       1001 Leads         ML Models
```

## 🛠️ Tech Stack

### Frontend
- **React 19.2.4** - UI library
- **TypeScript** - Type safety
- **Vite 8.0.1** - Build tool
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **NestJS 11.0.1** - Node.js framework
- **Prisma 7.5.0** - ORM
- **PostgreSQL** - Database (Neon)
- **TypeScript** - Type safety

### Scoring Service
- **FastAPI** - Python web framework
- **scikit-learn** - Machine learning
- **pandas** - Data processing
- **numpy** - Numerical computing

## ✨ Features

### 1. Lead Management
- **Pagination**: Browse 1001 leads with configurable page sizes (10, 20, 50, 100)
- **Search & Filter**: Find leads by name, email, company
- **Status Tracking**: NEW, CONTACTED, QUALIFIED, CONVERTED, LOST
- **Score Categories**: COLD, WARM, HOT classification
- **Lead Sources**: Track source (FORM, WEBHOOK, MANUAL, IMPORT)

### 2. Analytics Dashboard
- **KPI Cards**: Total leads, average score, conversion rate
- **Score Distribution**: Pie chart of COLD/WARM/HOT leads
- **Source Analysis**: Bar chart of leads by source
- **Status Funnel**: Funnel visualization of lead progression
- **Score Trends**: Line chart of 30-day average scores
- **Sparsity Experiment**: Model accuracy across dataset sizes
- **Feature Importance**: Scatter plot of top features

### 3. Model Comparison
- **Multiple Models**: Rule-based, Logistic Regression, Random Forest
- **Metrics Dashboard**: F1, Precision, Recall, AUC-ROC per model
- **Latency Tracking**: Processing time for each algorithm
- **Confusion Matrices**: Detailed classification breakdown
- **Feature Importance**: Top features ranked per model
- **Live Score Tester**: Ad-hoc scoring comparison tool

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Python 3.11+
- PostgreSQL (Neon account recommended)

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/agtrisha94/Automated-CRM.git
cd "Automated CRM"

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install Python dependencies
cd ../scoring-service
pip install -r requirements.txt
```

### 2. Environment Setup

Create `.env` in the backend directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host/dbname"

# Node environment
NODE_ENV=development

# Server
PORT=3000
```

### 3. Database Setup

```bash
cd backend

# Create Prisma migration
npx prisma migrate dev --name init

# Seed with sample data (optional)
node scripts/seed.js
```

### 4. Run All Services

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
# Opens at http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run start:dev
# Runs at http://localhost:3000
```

**Terminal 3 - Scoring Service:**
```bash
cd scoring-service
python main.py
# Runs at http://localhost:8000
```

### 5. Access Application

- **Frontend**: http://localhost:5173
- **Leads Page**: http://localhost:5173/leads
- **Analytics**: http://localhost:5173/analytics
- **Model Comparison**: http://localhost:5173/model-comparison

## 📁 Project Structure

```
Automated CRM/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── leads/         # Lead-related components
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   ├── scoring/       # Scoring components
│   │   │   ├── shell/         # Layout shells
│   │   │   └── ui/            # Base UI components
│   │   ├── pages/             # Page components
│   │   ├── store/             # Redux state management
│   │   │   ├── slices/        # Redux slices
│   │   │   └── selectors/     # Redux selectors
│   │   ├── hooks/             # Custom React hooks
│   │   ├── api/               # API services
│   │   ├── types/             # TypeScript types
│   │   ├── constants/         # App constants
│   │   └── mocks/             # Mock data
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # NestJS backend
│   ├── src/
│   │   ├── leads/             # Leads module
│   │   │   ├── leads.controller.ts
│   │   │   ├── leads.service.ts
│   │   │   ├── leads.module.ts
│   │   │   └── dto/
│   │   ├── analytics/         # Analytics module
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── analytics.module.ts
│   │   ├── scoring/           # Scoring module
│   │   ├── prisma/            # Prisma service
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── package.json
│   └── tsconfig.json
│
├── scoring-service/            # Python FastAPI service
│   ├── main.py                # FastAPI server
│   ├── train_models.py        # Model training
│   ├── models/                # Trained models
│   │   ├── logistic_regression.pkl
│   │   ├── random_forest.pkl
│   │   ├── encoders.pkl
│   │   └── metadata.json
│   ├── requirements.txt
│   └── Dockerfile
│
├── scripts/                     # Utility scripts
│   ├── generate_data.py        # Generate synthetic data
│   └── synthetic_leads_*.json
│
└── docker-compose.yml          # Docker configuration
```

## ⚙️ Configuration

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCKS=false
```

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://user:password@host/dbname
NODE_ENV=development
PORT=3000
```

### Scoring Service (`scoring-service/.env`)
```env
PORT=8000
DEBUG=true
```

## 📚 API Documentation

### Leads Endpoints

```
GET    /leads                    # Get paginated leads
GET    /leads/:id                # Get single lead
POST   /leads                    # Create new lead
PATCH  /leads/:id                # Update lead
PATCH  /leads/:id/status         # Update lead status
GET    /leads/:id/score-compare  # Compare scores for lead
```

### Analytics Endpoints

```
GET    /analytics/overview       # Get dashboard data
  Response:
  {
    totalLeads: number
    avgScore: number
    conversionRate: number
    byScoreCategory: { COLD, WARM, HOT }
    bySource: { FORM, WEBHOOK, MANUAL, IMPORT }
    byStatus: { NEW, CONTACTED, QUALIFIED, CONVERTED, LOST }
    scoreTrend: Array<{ date, avgScore }>
    sparsity: Array<{ datasetSize, ruleMean, lrMean, rfMean }>
  }
```

### Scoring Endpoints

```
POST   /scoring/:leadId/compare  # Compare scores for a lead
```

## 🔄 State Management (Redux)

### Slices
- **leadsSlice**: Lead list, pagination, selected lead
- **filtersSlice**: Search, status, category, source, date range filters
- **analyticsSlice**: Dashboard data, loading states
- **scoringSlice**: Score comparison data

### Key Selectors
- `selectAllLeads`: All leads from state
- `selectPagedLeads`: Current page leads (50 per page default)
- `selectPagination`: Page, limit, total info
- `selectFilteredLeads`: Leads matching current filters

## 🎨 UI Components

### Pagination Component
- Configurable page sizes: 10, 20, 50, 100
- Navigation: Previous/Next buttons
- Shows: "Showing X to Y of Z results"

### Data Tables
- Sortable columns
- Inline actions
- Row selection
- Responsive design

### Charts (Recharts)
- Pie Chart: Score distribution
- Bar Chart: Source breakdown
- Line Chart: Score trends
- Funnel Chart: Lead progression
- Scatter Plot: Feature importance

## 📊 Data Models

### Lead
```typescript
interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  companySize?: string
  industry?: string
  source: 'FORM' | 'WEBHOOK' | 'MANUAL' | 'IMPORT'
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'
  ruleScore: number
  mlScore: number
  scoreCategory: 'COLD' | 'WARM' | 'HOT'
  emailOpens: number
  websiteVisits: number
  formFills: number
  createdAt: string
  updatedAt: string
}
```

### Analytics Payload
```typescript
interface AnalyticsPayload {
  totalLeads: number
  conversionRate: number
  avgScore: number
  byScoreCategory: { HOT, WARM, COLD }
  bySource: { FORM, WEBHOOK, MANUAL, IMPORT }
  byStatus: { NEW, CONTACTED, QUALIFIED, CONVERTED, LOST }
  scoreTrend: Array<{ date, avgScore }>
  sparsity: Array<{ datasetSize, ruleMean, lrMean, rfMean }>
}
```

## 🔧 Development

### Frontend Development
```bash
cd frontend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview build
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

### Backend Development
```bash
cd backend

# Development with auto-reload
npm run start:dev

# Build
npm run build

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate migrations
npx prisma migrate dev --name migration_name

# Inspect database
npx prisma studio
```

### Python Service Development
```bash
cd scoring-service

# Install dependencies
pip install -r requirements.txt

# Run server
python main.py

# Train models
python train_models.py
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:coverage
```

### Backend Tests
```bash
cd backend
npm run test
npm run test:e2e
npm run test:cov
```

## 🐳 Docker & Deployment

### Docker Compose
```bash
# Start all services
docker-compose up

# Rebuild images
docker-compose up --build

# Stop services
docker-compose down
```

### Production Build
```bash
# Frontend
cd frontend
npm run build
# Outputs to dist/

# Backend
cd backend
npm run build
npm run start:prod
# Set NODE_ENV=production

# Scoring Service
cd scoring-service
# See Dockerfile for production setup
```

## 📈 Performance

### Pagination
- Default: 50 leads per page
- Options: 10, 20, 50, 100
- Handles 1001 leads efficiently

### Database
- Indexed on: id, email, status, source, scoreCategory, createdAt
- Connection pooling via Prisma

### Caching
- Mock data for development
- Redux state for frontend caching
- Lazy loading of routes

## 🚨 Troubleshooting

### Frontend won't load
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend connection error
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test Prisma connection
npx prisma db push
```

### Scoring service not responding
```bash
# Check if running on port 8000
lsof -i :8000

# Verify Python installation
python --version
pip list | grep scikit-learn
```

### TypeScript errors in VS Code
```bash
# Restart TypeScript server
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

## 📝 License

This project is part of an automated CRM research initiative.

## 👥 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open Pull Request

## 📧 Support

For issues, questions, or feedback, please open an issue on GitHub.

---

**Last Updated**: April 6, 2026
**Version**: 1.0.0
