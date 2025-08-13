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
    <nav className="bg-white shadow-lg relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            溯光
          </Link>
          
          <div className="hidden md:flex space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              首页
            </Link>
            
            {isAuthenticated && (
              <>
                <Link
                  to="/record"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/record') 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  记录想法
                </Link>
                <Link
                  to="/chat"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/chat') 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  对话过去
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : isAuthenticated && user ? (
              <>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    欢迎, {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    登出
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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