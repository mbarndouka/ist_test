# Procure-to-Pay Management System

A modern, AI-powered Procure-to-Pay system built with Django REST Framework and React. The system automates purchase request workflows with intelligent document processing, automatic Purchase Order generation, and AI-based receipt validation.

## Features

- **Multi-level Approval Workflow**: Staff → Management → Finance
- **AI-Powered Document Processing**:
  - Automatic Purchase Order generation from proforma invoices
  - AI-based receipt validation against Purchase Orders
  - Intelligent data extraction using OpenAI GPT-4o-mini
- **Role-Based Access Control**: STAFF, MANAGEMENT, FINANCE
- **Real-time Status Tracking**: PENDING → APPROVED → REJECTED
- **Document Management**: Proforma invoices, Purchase Orders, Receipts
- **Professional PDF Generation**: Automated PO creation with reportlab

## Tech Stack

### Backend
- **Framework**: Django 5.2.8
- **API**: Django REST Framework 3.16.1
- **Database**: PostgreSQL
- **Authentication**: JWT (djangorestframework_simplejwt)
- **AI/ML**: OpenAI GPT-4o-mini API
- **Document Processing**: pdfplumber, PyPDF2, pytesseract
- **PDF Generation**: reportlab 4.2.5

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: TailwindCSS
- **Icons**: Lucide React

## Quick Start with Docker (Recommended)

The easiest way to run the entire application locally is using Docker Compose.

### Prerequisites

- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **OpenAI API Key** - [Get yours here](https://platform.openai.com/api-keys)

### Setup Steps

1. **Clone the Repository**
```bash
git clone <git@github.com:mbarndouka/ist_test.git>
cd ist_test
```

2. **Configure Environment Variables**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

3. **Start All Services**
```bash
# Build and start all containers (database, backend, frontend)
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

4. **Create a Superuser** (in a new terminal)
```bash
docker-compose exec backend python manage.py createsuperuser
```

5. **Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/docs
- **Django Admin**: http://localhost:8000/admin

6. **View Logs** (if running in detached mode)
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

7. **Stop All Services**
```bash
docker-compose down

# Stop and remove volumes (this will delete the database)
docker-compose down -v
```

## API Endpoints

### Authentication
- `POST /api/accounts/login/` - User login

### Purchase Requests
- `GET /api/requests/` - List all requests
- `GET /api/requests/{id}/` - Get request details
- `POST /api/requests/` - Create new request
- `PUT /api/requests/{id}/` - Update request
- `PATCH /api/requests/{id}/approve/` - Approve request (generates PO)
- `PATCH /api/requests/{id}/reject/` - Reject request
- `POST /api/requests/{id}/submit-receipt/` - Upload receipt (validates with AI)


## Deployment

### Backend (Render)
🔗 **Live API**: https://ist-test.onrender.com/api/docs
https://ist-test.onrender.com/dashboard to create your own users
### Frontend (Vercel)
🔗 **Live App**: https://ist-test-beta.vercel.app/login

