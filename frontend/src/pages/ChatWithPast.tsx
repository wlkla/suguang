import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'past-self'
  timestamp: Date
}

interface PastMemory {
  id: string
  title: string
  date: string
  preview: string
  tags?: string[]
}

interface SavedConversation {
  id: string
  name: string
  tags: string[]
  messages: {
    role: 'user' | 'ai'
    content: string
    timestamp: Date
  }[]
  date: string
}

const ChatWithPast = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [selectedMemory, setSelectedMemory] = useState<PastMemory | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [pastMemories, setPastMemories] = useState<PastMemory[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load saved conversations from localStorage
  const loadMemories = () => {
    const savedConversations: SavedConversation[] = JSON.parse(localStorage.getItem('savedConversations') || '[]')
    
    // Convert saved conversations to PastMemory format
    const convertedMemories: PastMemory[] = savedConversations.map(conv => ({
      id: conv.id,
      title: conv.name,
      date: conv.date,
      preview: conv.messages.length > 0 ? conv.messages[0].content.substring(0, 50) + '...' : '无内容',
      tags: conv.tags
    }))

    setPastMemories(convertedMemories)
  }

  useEffect(() => {
    loadMemories()
  }, [])

  const deleteMemory = (memoryId: string) => {
    // Remove from localStorage if it's a saved conversation
    const savedConversations: SavedConversation[] = JSON.parse(localStorage.getItem('savedConversations') || '[]')
    const updatedConversations = savedConversations.filter(conv => conv.id !== memoryId)
    localStorage.setItem('savedConversations', JSON.stringify(updatedConversations))
    
    // Update local state
    setPastMemories(prev => prev.filter(memory => memory.id !== memoryId))
    
    // Close any open conversation if it was the deleted one
    if (selectedMemory?.id === memoryId) {
      setSelectedMemory(null)
      setMessages([])
    }
    
    setShowDeleteConfirm(null)
  }

  const confirmDelete = (memoryId: string) => {
    setShowDeleteConfirm(memoryId)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(null)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const simulatePastSelfResponse = (_userMessage: string): string => {
    // 模拟过去自己的回复逻辑
    const responses = [
      "那时候的我确实是这么想的，但现在回想起来...",
      "这个想法我记得很清楚，当时我觉得...",
      "有趣，你现在怎么看待这个问题呢？",
      "我记得那段时间我特别关注这件事...",
      "现在的你和那时的我有什么不同的看法吗？"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedMemory) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputText('')
    setIsTyping(true)

    // 模拟过去自己的回复
    setTimeout(() => {
      const pastSelfMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: simulatePastSelfResponse(inputText),
        sender: 'past-self',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, pastSelfMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startConversation = (memory: PastMemory) => {
    setSelectedMemory(memory)
    
    // Check if this is a saved conversation
    const savedConversations: SavedConversation[] = JSON.parse(localStorage.getItem('savedConversations') || '[]')
    const savedConversation = savedConversations.find(conv => conv.id === memory.id)
    
    if (savedConversation) {
      // Load the saved conversation
      const convertedMessages: Message[] = savedConversation.messages.map((msg, index) => ({
        id: index.toString(),
        text: msg.content,
        sender: msg.role === 'user' ? 'user' : 'past-self',
        timestamp: new Date(msg.timestamp)
      }))
      
      setMessages([
        ...convertedMessages,
        {
          id: (convertedMessages.length).toString(),
          text: `这是我们之前的对话记录。现在的你想聊什么？`,
          sender: 'past-self',
          timestamp: new Date()
        }
      ])
    } else {
      // Default conversation start
      setMessages([
        {
          id: '0',
          text: `你好！我是${memory.date}的你。当时我记录了"${memory.title}"，想和现在的你聊聊这个话题。`,
          sender: 'past-self',
          timestamp: new Date()
        }
      ])
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-8 h-full overflow-y-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              与过去的自己对话
            </h1>
            <p className="text-gray-600">
              选择一段记忆，开启跨越时空的心灵对话
            </p>
          </div>
      
      <div className="grid md:grid-cols-3 gap-6">
          {/* 记忆选择侧边栏 */}
          <div className="md:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">记忆时光</h2>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pastMemories.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-2 font-medium">还没有记忆</p>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      去"记录想法"页面<br/>创建第一段记忆吧
                    </p>
                  </div>
                ) : (
                  pastMemories.map(memory => (
                    <div
                      key={memory.id}
                      className={`group p-4 rounded-xl border transition-all duration-300 relative cursor-pointer transform hover:-translate-y-1 ${
                        selectedMemory?.id === memory.id
                          ? 'border-blue-300 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-lg'
                      }`}
                      onClick={() => startConversation(memory)}
                    >
                      <h3 className="font-semibold text-gray-800 pr-8 mb-2">{memory.title}</h3>
                      <p className="text-xs text-blue-600 mb-2 font-medium">{memory.date}</p>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{memory.preview}</p>
                      
                      {memory.tags && memory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {memory.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          confirmDelete(memory.id)
                        }}
                        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 rounded-lg"
                        title="删除记忆"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 对话区域 */}
          <div className="md:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 h-[32rem] flex flex-col">
              {/* 对话标题 */}
              <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                {selectedMemory ? (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{selectedMemory.title}</h3>
                      <p className="text-sm text-blue-600 font-medium">{selectedMemory.date} 的你</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">选择一段记忆开始对话</p>
                  </div>
                )}
              </div>

              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {!selectedMemory && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">开始一段对话</h3>
                    <p className="text-gray-500">选择左侧的一段记忆，与过去的自己进行深度对话</p>
                  </div>
                )}

                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                          : 'bg-gradient-to-r from-gray-400 to-gray-500'
                      }`}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      
                      {/* Message bubble */}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-md'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        {message.sender === 'past-self' && (
                          <p className="text-xs mb-1 text-blue-600">
                            {selectedMemory?.date} 的你
                          </p>
                        )}
                        <p className="leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-2 ${
                          message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-end space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                        <p className="text-xs text-blue-600 mb-1">{selectedMemory?.date} 的你</p>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="px-6 py-4 border-t border-blue-100 bg-gray-50/50 rounded-b-2xl">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!selectedMemory}
                    placeholder={selectedMemory ? "输入你想说的话..." : "请先选择一段记忆"}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || !selectedMemory || isTyping}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
          </div>
        </div>
      </div>
      </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">确认删除记忆</h3>
                <p className="text-gray-600 leading-relaxed">
                  你确定要删除这段珍贵的记忆吗？<br/>
                  删除后将无法恢复。
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  保留记忆
                </button>
                <button
                  onClick={() => deleteMemory(showDeleteConfirm)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium transform hover:scale-105 shadow-lg"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ChatWithPast