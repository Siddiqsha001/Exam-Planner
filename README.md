# Exam Preparation Timeline Planner

A full-stack web application to help students plan and track their exam preparation efficiently.

## Features

- **Authentication**: Simple login/signup system
- **Dashboard**: Overview of upcoming exams and study sessions
- **Exam Management**: Create, edit, and delete exams
- **Study Timeline**: Plan and manage study sessions
- **Pomodoro Timer**: Built-in timer for focused study sessions
- **Progress Tracking**: Visual representation of study progress

## Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form + Zod** - Form handling and validation
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Project Structure

```
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── lib/          # Utilities and API
├── server/                # Express.js backend
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── server.js         # Entry point
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "Exam Preparation Time Line Planner"
   ```

2. **Setup Backend**

   ```bash
   cd server
   npm install
   ```

3. **Setup Frontend**

   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration**

   Create `.env` file in the server directory:

   ```env
   MONGODB_URI=mongodb://localhost:27017/exam-planner
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

### Running the Application

1. **Start MongoDB** (if running locally)

2. **Start Backend Server**

   ```bash
   cd server
   npm run dev
   ```

3. **Start Frontend Development Server**

   ```bash
   cd client
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Exams

- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create new exam
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam

### Study Sessions

- `GET /api/study` - Get all study sessions
- `POST /api/study` - Create new study session
- `PUT /api/study/:id` - Update study session
- `DELETE /api/study/:id` - Delete study session

## Usage

1. **Register/Login**: Create an account or sign in
2. **Add Exams**: Use the Exams tab to add your upcoming exams
3. **Plan Study Sessions**: Use the Study Timeline to schedule study periods
4. **Use Pomodoro Timer**: Focus with the built-in 25-minute timer
5. **Track Progress**: Monitor your preparation from the dashboard

## Development

### Available Scripts

**Frontend (client/)**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

**Backend (server/)**

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Future Enhancements

- Calendar integration
- Email notifications
- Study material uploads
- Progress analytics
- Mobile app
- Study groups

## License

This project is licensed under the MIT License.
