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
}

const ChatWithPast = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [selectedMemory, setSelectedMemory] = useState<PastMemory | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 模拟过去的记忆
  const pastMemories: PastMemory[] = [
    {
      id: '1',
      title: '关于工作的思考',
      date: '2023-06-15',
      preview: '今天对职业发展有了新的想法...'
    },
    {
      id: '2',
      title: '人生感悟',
      date: '2023-03-20',
      preview: '最近一直在思考什么是真正的幸福...'
    },
    {
      id: '3',
      title: '学习心得',
      date: '2022-11-10',
      preview: '开始学习新技能，发现学习的乐趣...'
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const simulatePastSelfResponse = (userMessage: string): string => {
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
    setMessages([
      {
        id: '0',
        text: `你好！我是${memory.date}的你。当时我记录了"${memory.title}"，想和现在的你聊聊这个话题。`,
        sender: 'past-self',
        timestamp: new Date()
      }
    ])
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">与过去的自己对话</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* 记忆选择侧边栏 */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">选择一段记忆</h2>
            <div className="space-y-3">
              {pastMemories.map(memory => (
                <div
                  key={memory.id}
                  onClick={() => startConversation(memory)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedMemory?.id === memory.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium text-sm">{memory.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{memory.date}</p>
                  <p className="text-xs text-gray-600 mt-2 truncate">{memory.preview}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 对话区域 */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md h-96 flex flex-col">
            {/* 对话标题 */}
            <div className="px-4 py-3 border-b border-gray-200">
              {selectedMemory ? (
                <div>
                  <h3 className="font-medium">{selectedMemory.title}</h3>
                  <p className="text-sm text-gray-500">{selectedMemory.date}的你</p>
                </div>
              ) : (
                <p className="text-gray-500">选择一段记忆开始对话</p>
              )}
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!selectedMemory && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">选择左侧的一段记忆开始对话</p>
                </div>
              )}

              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.sender === 'past-self' && (
                      <p className="text-xs opacity-75 mb-1">
                        {selectedMemory?.date}的你
                      </p>
                    )}
                    <p>{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{selectedMemory?.date}的你</p>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!selectedMemory}
                  placeholder={selectedMemory ? "输入你想说的话..." : "请先选择一段记忆"}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || !selectedMemory || isTyping}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatWithPast