import { useState, useRef, useEffect } from 'react'
import { memoryApi, chatApi } from '../utils/api'
import { aiService } from '../services/aiService'

interface Message {
  id: string
  text: string
  sender: 'user' | 'past-self'
  timestamp: Date
}

interface PastMemory {
  id: number
  title: string
  date: string
  preview: string
  tags?: string[]
  content?: string // Full content for AI context
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

interface ChatHistory {
  id: number
  memoryRecord: {
    id: number
    title: string
    createdAt: string
  }
  lastMessage: any
  messageCount: number
  createdAt: string
  updatedAt: string
}

interface ConversationDetail {
  id: number
  memoryRecord: {
    id: number
    title: string
    date: string
    content: string
  }
  messages: Array<{
    id: string
    text: string
    sender: 'user' | 'past-self'
    timestamp: string
  }>
  createdAt: string
  updatedAt: string
}

const ChatWithPast = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [selectedMemory, setSelectedMemory] = useState<PastMemory | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [pastMemories, setPastMemories] = useState<PastMemory[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([])
  const [showHistoryDialog, setShowHistoryDialog] = useState<number | null>(null)
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load memories from API
  const loadMemories = async () => {
    try {
      const response = await memoryApi.getList()
      
      // Convert memory records to PastMemory format
      const convertedMemories: PastMemory[] = response.records.map((record: any) => ({
        id: record.id,
        title: record.title || '未命名记忆',
        date: new Date(record.createdAt).toLocaleDateString(),
        preview: record.content.length > 50 ? record.content.substring(0, 50) + '...' : record.content,
        tags: record.tags ? record.tags.split(',') : [],
        content: record.content // Store full content for AI context
      }))

      setPastMemories(convertedMemories)
    } catch (error) {
      console.error('Failed to load memories:', error)
      setPastMemories([])
    }
  }

  // Load chat histories from API
  const loadChatHistories = async () => {
    try {
      const response = await chatApi.getList()
      setChatHistories(response.conversations || [])
    } catch (error) {
      console.error('Failed to load chat histories:', error)
      setChatHistories([])
    }
  }

  useEffect(() => {
    loadMemories()
    loadChatHistories()
  }, [])

  const deleteMemory = async (memoryId: number) => {
    try {
      await memoryApi.delete(memoryId)
      
      // Update local state
      setPastMemories(prev => prev.filter(memory => memory.id !== memoryId))
      
      // Close any open conversation if it was the deleted one
      if (selectedMemory?.id === memoryId) {
        setSelectedMemory(null)
        setMessages([])
      }
      
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete memory:', error)
      // You might want to show an error message to the user
    }
  }

  const confirmDelete = (memoryId: number) => {
    setShowDeleteConfirm(memoryId)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(null)
  }

  // View conversation history for a memory (original counselor conversation)
  const viewConversationHistory = async (memoryId: number) => {
    setShowHistoryDialog(memoryId)
    setIsLoadingHistory(true)
    setConversationDetail(null)

    try {
      const memory = pastMemories.find(m => m.id === memoryId)
      if (!memory) return

      // Look for the original counselor conversation in localStorage
      // Search all localStorage keys for conversation history matching this memory title
      let foundConversation = null
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('conversation_')) {
          try {
            const conversationData = JSON.parse(localStorage.getItem(key) || '{}')
            if (conversationData.title === memory.title) {
              foundConversation = conversationData
              break
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }

      if (foundConversation) {
        // Convert the counselor conversation to the expected format
        const counselorMessages = foundConversation.messages.map((msg: any, index: number) => ({
          id: index.toString(),
          text: msg.content,
          sender: msg.role === 'user' ? 'user' : 'counselor', // Use 'counselor' instead of 'past-self'
          timestamp: msg.timestamp || new Date().toISOString()
        }))

        setConversationDetail({
          id: memoryId,
          memoryRecord: {
            id: memoryId,
            title: memory.title,
            date: memory.date,
            content: memory.content || memory.preview || ''
          },
          messages: counselorMessages,
          createdAt: foundConversation.savedAt || new Date().toISOString(),
          updatedAt: foundConversation.savedAt || new Date().toISOString()
        })
      }
      // If no history found, conversationDetail remains null and will show "no history" message
    } catch (error) {
      console.error('Failed to load conversation history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const closeHistoryDialog = () => {
    setShowHistoryDialog(null)
    setConversationDetail(null)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedMemory) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    const currentInput = inputText
    setInputText('')
    setIsTyping(true)

    try {
      // Use AI service to simulate past self
      const pastSelfResponse = await aiService.chatWithPastSelf(
        currentInput,
        selectedMemory.content || selectedMemory.preview,
        messages
      )

      const pastSelfMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: pastSelfResponse,
        sender: 'past-self',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, pastSelfMessage])
    } catch (error) {
      console.error('Failed to get past self response:', error)
      // Fallback message
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "很抱歉，我现在想不起来当时的想法了...不过那时候的我一定很想和现在的你聊聊。",
        sender: 'past-self',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startConversation = (memory: PastMemory) => {
    setSelectedMemory(memory)
    
    // Format tags for display
    const tagsText = memory.tags && memory.tags.length > 0 
      ? memory.tags.join('、') 
      : '复杂的'
    
    // Start with time travel greeting
    const initialMessages = [
      {
        id: '0',
        text: `嘿，这么多年过去了，你现在是什么样子了？我还是当时的我。那时候我记录了"${memory.title}"，我记得当时的心情是${tagsText}。`,
        sender: 'past-self',
        timestamp: new Date()
      }
    ]
    setMessages(initialMessages)
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
              选择一段记忆，让AI模拟当时的你，体验真实的时空对话
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
                      
                      {/* Action buttons */}
                      <div className="absolute top-3 right-3 flex space-x-1">
                        {/* View history button - show for all memories for now */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            viewConversationHistory(memory.id)
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-50 rounded-lg"
                          title="查看心理引导记录"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            confirmDelete(memory.id)
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 rounded-lg"
                          title="删除记忆"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">开始时空对话</h3>
                    <p className="text-gray-500">选择左侧的一段记忆，AI将模拟当时的你与现在对话</p>
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
                    placeholder={selectedMemory ? "对过去的自己说些什么..." : "请先选择一段记忆"}
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

        {/* Conversation History Dialog */}
        {showHistoryDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] mx-4 shadow-2xl border border-gray-100 flex flex-col">
              {/* Dialog Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">心理引导记录</h3>
                    <p className="text-sm text-gray-500">
                      {conversationDetail ? `与心理引导师的原始对话记录` : '加载中...'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeHistoryDialog}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Dialog Content */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {isLoadingHistory ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-500">加载对话历史中...</p>
                    </div>
                  </div>
                ) : conversationDetail ? (
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                      {conversationDetail.messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end space-x-2 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.sender === 'user' 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                                : message.sender === 'counselor'
                                ? 'bg-gradient-to-r from-purple-500 to-violet-500'
                                : 'bg-gradient-to-r from-gray-400 to-gray-500'
                            }`}>
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {message.sender === 'counselor' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                )}
                              </svg>
                            </div>
                            
                            {/* Message bubble */}
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                                message.sender === 'user'
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-md'
                                  : message.sender === 'counselor'
                                  ? 'bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 text-gray-900 rounded-bl-md'
                                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                              }`}
                            >
                              {message.sender === 'counselor' && (
                                <p className="text-xs mb-1 text-purple-600 font-medium">
                                  AI心理引导师
                                </p>
                              )}
                              {message.sender === 'past-self' && (
                                <p className="text-xs mb-1 text-blue-600">
                                  {conversationDetail?.memoryRecord.date} 的你
                                </p>
                              )}
                              <p className="leading-relaxed">{message.text}</p>
                              <p className={`text-xs mt-2 ${
                                message.sender === 'user' ? 'text-blue-200' : 
                                message.sender === 'counselor' ? 'text-purple-400' : 'text-gray-400'
                              }`}>
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">暂无心理引导记录</h4>
                      <p className="text-gray-500">这段记忆没有保存与心理引导师的对话记录</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dialog Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-end">
                  <button
                    onClick={closeHistoryDialog}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ChatWithPast