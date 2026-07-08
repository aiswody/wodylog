import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { GoogleCalendarSyncProvider } from './context/GoogleCalendarSyncContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './routes/LoginPage'
import { DashboardPage } from './routes/DashboardPage'
import { CalendarPage } from './routes/CalendarPage'
import { ApplicationsPage } from './routes/ApplicationsPage'
import { ApplicationDetailPage } from './routes/ApplicationDetailPage'
import { ResumeVersionsPage } from './routes/ResumeVersionsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GoogleCalendarSyncProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/applications/:id" element={<ApplicationDetailPage />} />
              <Route path="/resumes" element={<ResumeVersionsPage />} />
            </Route>
          </Routes>
        </GoogleCalendarSyncProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
