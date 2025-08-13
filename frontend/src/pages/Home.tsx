import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100"></div>
      
      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-20 h-20 bg-indigo-200 rounded-full opacity-15 animate-bounce"></div>
      <div className="absolute bottom-40 left-1/3 w-16 h-16 bg-violet-200 rounded-full opacity-20"></div>
      <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-blue-200 rounded-full opacity-10"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 h-screen overflow-y-auto">
        <div className="text-center mb-16 pt-20">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-6">
            溯光
          </h1>
          <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            记录当下的想法，与过去的自己进行对话，探索思想的变化轨迹
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <Link
              to="/record"
              className="group relative bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <span className="flex items-center text-lg font-medium">
                <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                开始记录想法
              </span>
            </Link>
            <Link
              to="/chat"
              className="group relative bg-white/80 backdrop-blur-sm border-2 border-violet-300 text-violet-600 px-8 py-4 rounded-2xl hover:bg-violet-50 hover:border-violet-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center text-lg font-medium">
                <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                与过去对话
              </span>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-violet-100">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">AI引导记录</h3>
            <p className="text-gray-600 leading-relaxed">
              AI会智能引导你记录当下的想法、情感和生活感悟，帮你更好地整理思绪，捕捉每一个珍贵的瞬间
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-violet-100">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">对话过去</h3>
            <p className="text-gray-600 leading-relaxed">
              基于过往记录，AI会模拟过去的你，让你能够跨越时间与过去的自己进行深度对话，探索成长轨迹
            </p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-violet-100 max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">
              开始你的思想之旅
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              每个人的思想都在不断发展变化。通过记录和对话，探索内心世界的无限可能
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="group flex items-center p-4 rounded-xl hover:bg-violet-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">理解思想演变</h3>
                <p className="text-sm text-gray-600">追踪思维轨迹，发现成长足迹</p>
              </div>
            </div>
            
            <div className="group flex items-center p-4 rounded-xl hover:bg-violet-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">发现成长因素</h3>
                <p className="text-sm text-gray-600">识别影响你的关键时刻和决定</p>
              </div>
            </div>
            
            <div className="group flex items-center p-4 rounded-xl hover:bg-violet-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-violet-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">深度自我对话</h3>
                <p className="text-sm text-gray-600">与过去的自己进行跨时空交流</p>
              </div>
            </div>
            
            <div className="group flex items-center p-4 rounded-xl hover:bg-violet-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">洞察未来发展</h3>
                <p className="text-sm text-gray-600">从过往经历中获取前进指引</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home