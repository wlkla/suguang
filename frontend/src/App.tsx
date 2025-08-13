import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import RecordMemory from './pages/RecordMemory'
import ChatWithPast from './pages/ChatWithPast'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={
              <main className="container mx-auto px-4 py-8">
                <Login />
              </main>
            } />
            <Route path="/register" element={
              <main className="container mx-auto px-4 py-8">
                <Register />
              </main>
            } />
            <Route path="/record" element={
              <ProtectedRoute>
                <RecordMemory />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <ChatWithPast />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
