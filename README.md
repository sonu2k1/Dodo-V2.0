# DoDo v2.0 🚀

A comprehensive internal operating system for creative agencies - Full-stack SaaS application for project management, client relationships, and team collaboration.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-3FCF8E?logo=supabase&logoColor=white)

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Google OAuth 2.0 integration
- Role-based access control (Super Admin, Manager, Employee, Client)
- Session management with auto-logout on inactivity

### 📊 Role-Based Dashboards
- **Super Admin**: Master dashboard with financial pulse, team load heatmap
- **Employee**: Work cockpit with task management and activity feed
- **Client**: Project portal with progress tracking and approvals

### 💬 Real-Time Collaboration
- Socket.io powered chat system
- Direct messages and group chats
- File sharing capabilities

### 🤖 AI-Powered Features
- Vertex AI integration for task summarization
- Smart task suggestions
- Automated insights and reporting

### 📁 Project & Task Management
- Kanban-style task boards
- Time tracking and logging
- Project milestones and deadlines
- Client approval workflows

### 💰 Financial Management
- Lead/opportunity tracking (CRM)
- Invoice generation and management
- Payment tracking

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **TailwindCSS** for styling
- **TanStack Query** for data fetching
- **React Router** for navigation
- **Recharts** for data visualization

### Backend
- **Node.js** with Express
- **PostgreSQL** via Supabase
- **JWT** for authentication
- **Passport.js** for OAuth
- **Winston** for logging

### Infrastructure
- **Supabase** - Database & Auth
- **Google Cloud** - Vertex AI
- **Docker** - Containerization (coming soon)

## 📁 Project Structure

```
DoDo v2.0/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API service layer
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utilities & configuration
│   └── package.json
│
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── config/           # Environment & app config
│   │   ├── controllers/      # Route controllers
│   │   ├── middlewares/      # Express middlewares
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── database/         # SQL schemas & seeds
│   └── package.json
│
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for database)
- Google Cloud account (for Vertex AI & OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sonu2k1/Dodo-V2.0.git
   cd Dodo-V2.0
   ```

2. **Setup Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your credentials
   npm install
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your credentials
   npm install
   npm run dev
   ```

4. **Initialize Database**
   - Run the SQL schemas in `backend/src/database/schema.sql`
   - Seed demo data with `backend/src/database/seed.sql`

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_APP_NAME=DoDo v2.0
```

## 📝 API Documentation

Base URL: `http://localhost:3000/api/v1`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User login |
| `/auth/google` | GET | Google OAuth |
| `/users` | GET | List users |
| `/projects` | GET/POST | Manage projects |
| `/tasks` | GET/POST | Manage tasks |
| `/leads` | GET/POST | Manage leads |
| `/chat/messages` | GET/POST | Chat messages |

## 🗺️ Roadmap

- [x] Core authentication system
- [x] Role-based dashboards
- [x] Project & task management
- [x] Real-time chat
- [x] AI integration (Vertex AI)
- [ ] Production deployment (Cloud Run)
- [ ] Multi-agency SaaS support
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Sonu Kumar**
- GitHub: [@sonu2k1](https://github.com/sonu2k1)

---

<p align="center">Built with ❤️ for KUAVA</p>