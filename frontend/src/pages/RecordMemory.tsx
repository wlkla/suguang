import { useState } from 'react'

const RecordMemory = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 3,
    tags: ''
  })

  const [isAiMode, setIsAiMode] = useState(false)
  const [aiQuestions, setAiQuestions] = useState<string[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMoodChange = (mood: number) => {
    setFormData(prev => ({
      ...prev,
      mood
    }))
  }

  const startAiGuided = () => {
    setIsAiMode(true)
    // 模拟AI引导问题
    setAiQuestions([
      "今天发生了什么特别的事情吗？",
      "你现在的心情如何？是什么让你有这样的感受？",
      "最近有什么想法或观点发生了变化吗？",
      "你对未来有什么期待或担忧吗？",
      "有什么想对未来的自己说的话吗？"
    ])
    setCurrentQuestionIndex(0)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < aiQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      setIsAiMode(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting memory record:', formData)
    // 这里会调用API保存记录
  }

  const moodLabels = ['很糟糕', '不好', '一般', '不错', '很好']
  const moodEmojis = ['😢', '😕', '😐', '😊', '😄']

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">记录你的想法</h1>
        
        {!isAiMode && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
            <h3 className="text-lg font-medium text-indigo-900 mb-2">AI引导模式</h3>
            <p className="text-indigo-700 mb-3">
              让AI通过一系列问题引导你更深入地记录当下的想法和感受
            </p>
            <button
              onClick={startAiGuided}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              开始AI引导记录
            </button>
          </div>
        )}

        {isAiMode && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-blue-900">AI助手</h3>
            </div>
            <p className="text-blue-800 mb-4">{aiQuestions[currentQuestionIndex]}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-600">
                问题 {currentQuestionIndex + 1} / {aiQuestions.length}
              </span>
              <button
                onClick={handleNextQuestion}
                className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                {currentQuestionIndex < aiQuestions.length - 1 ? '下一个问题' : '完成引导'}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              标题 (可选)
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="给这次记录起个标题..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              内容 *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={8}
              placeholder="写下你当前的想法、感受、观点..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              当前心情
            </label>
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleMoodChange(rating)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                    formData.mood === rating
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-1">{moodEmojis[rating - 1]}</span>
                  <span className="text-xs text-gray-600">{moodLabels[rating - 1]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              标签 (可选)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="用逗号分隔，如：工作,家庭,成长"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              保存草稿
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              完成记录
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RecordMemory