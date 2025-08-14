import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navigation = () => {
  const location = useLocation()
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  
  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="bg-gradient-to-r from-violet-50/95 via-purple-50/95 to-indigo-50/95 backdrop-blur-xl border-b border-violet-200/50 shadow-xl relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center group transition-all duration-300 hover:scale-105">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-12">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              溯光
            </span>
          </Link>
          
          <div className="hidden md:flex space-x-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                isActive('/') 
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-700 hover:text-violet-600 hover:bg-violet-50 hover:shadow-md'
              }`}
            >
              首页
            </Link>
            
            {isAuthenticated && (
              <>
                <Link
                  to="/record"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive('/record') 
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:text-violet-600 hover:bg-violet-50 hover:shadow-md'
                  }`}
                >
                  记录想法
                </Link>
                <Link
                  to="/chat"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive('/chat') 
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:text-violet-600 hover:bg-violet-50 hover:shadow-md'
                  }`}
                >
                  对话过去
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            ) : isAuthenticated && user ? (
              <>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      欢迎, {user.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border-2 border-gray-300 rounded-xl hover:bg-white/80 hover:border-violet-300 hover:shadow-md transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                  >
                    登出
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-violet-600 hover:text-violet-800 font-medium transition-all duration-300 hover:bg-violet-50 rounded-xl transform hover:scale-105"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation