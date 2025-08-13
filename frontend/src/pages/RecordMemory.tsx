import { useState } from 'react'
import { aiService, type AIMessage } from '../services/aiService'
import { memoryApi } from '../utils/api'

interface Message {
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface SavedConversation {
  id: string
  name: string
  tags: string[]
  messages: Message[]
  date: string
}

const RecordMemory = () => {
  const [isConversationMode, setIsConversationMode] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [conversationName, setConversationName] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')

  const predefinedTags = ['开心', '迷茫', '焦虑', '兴奋', '平静', '思考', '困惑', '满足']

  const startConversation = async () => {
    setIsConversationMode(true)
    setIsLoading(true)
    
    try {
      // Get initial AI response
      const aiResponse = await aiService.startConversation()
      const initialMessage: Message = {
        role: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }
      setMessages([initialMessage])
    } catch (error) {
      console.error('Failed to start conversation:', error)
      // Fallback message
      const fallbackMessage: Message = {
        role: 'ai',
        content: '你好，很高兴见到你。你想从哪里开始说起今天的心情呢？',
        timestamp: new Date()
      }
      setMessages([fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setUserInput('')
    setIsLoading(true)

    try {
      // Convert messages to AIMessage format for context
      const conversationHistory: AIMessage[] = messages.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : msg.role,
        content: msg.content
      }))

      // Get AI response
      const aiResponse = await aiService.continueConversation(userMessage.content, conversationHistory)
      
      const aiMessage: Message = {
        role: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to get AI response:', error)
      // Add error message
      const errorMessage: Message = {
        role: 'ai',
        content: '很抱歉，我现在遇到了一些技术问题。不过没关系，我在认真听，你可以继续和我分享你的想法。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const exitConversation = () => {
    setIsConversationMode(false)
    setMessages([])
  }

  const saveConversation = () => {
    setShowSaveDialog(true)
  }

  const handleSaveConfirm = async () => {
    if (!conversationName.trim()) {
      alert('请输入对话名称')
      return
    }

    try {
      // Convert messages to content format for display
      const content = messages.map(msg => `${msg.role === 'user' ? '我' : 'AI心理引导师'}: ${msg.content}`).join('\n\n')
      
      // Also save the structured conversation data for history viewing
      const conversationData = {
        messages: messages,
        savedAt: new Date().toISOString()
      }
      
      await memoryApi.create({
        title: conversationName,
        content,
        tags: selectedTags.join(','),
        // Store conversation data as a stringified JSON in a custom field if backend supports it
        // For now, we'll store it separately in localStorage
      })
      
      // Store structured conversation data for history viewing
      // Use a hash of the title and content to create a unique but deterministic key
      const memoryKey = `conversation_${conversationName.replace(/\s+/g, '_')}_${Date.now()}`
      localStorage.setItem(memoryKey, JSON.stringify({
        title: conversationName,
        tags: selectedTags,
        ...conversationData
      }))

      console.log('Memory saved successfully')
      
      // Reset state
      setShowSaveDialog(false)
      setConversationName('')
      setSelectedTags([])
      setCustomTag('')
      setIsConversationMode(false)
      setMessages([])
    } catch (error) {
      console.error('Failed to save memory:', error)
      alert('保存失败，请重试')
    }
  }

  const handleCancelSave = () => {
    setShowSaveDialog(false)
    setConversationName('')
    setSelectedTags([])
    setCustomTag('')
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()])
      setCustomTag('')
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  if (isConversationMode) {
    return (
      <div className="fixed inset-0 overflow-hidden">
        {/* Background gradient - same as main page */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-blue-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-indigo-200 rounded-full opacity-25"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-pink-200 rounded-full opacity-20"></div>

        <div className="relative z-10 max-w-6xl mx-auto h-screen flex flex-col pt-20 px-4 pb-8">
          {/* Header with buttons */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">AI 心理引导</h2>
                <p className="text-sm text-gray-600">在安全的氛围中，表达真实的自己</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={exitConversation}
                className="px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white hover:border-gray-400 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  退出
                </span>
              </button>
              <button
                onClick={saveConversation}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-xl font-medium"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  保存对话
                </span>
              </button>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                          : 'bg-gradient-to-r from-blue-400 to-purple-400'
                      }`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {message.role === 'user' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          )}
                        </svg>
                      </div>
                      
                      {/* Message bubble */}
                      <div
                        className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-sm ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-br-md'
                            : 'bg-white border border-purple-100 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        {message.role === 'ai' && (
                          <p className="text-xs text-purple-600 mb-1 font-medium">AI 助手</p>
                        )}
                        <p className="leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-purple-200' : 'text-gray-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* AI Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-end space-x-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      
                      {/* Loading bubble */}
                      <div className="max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-sm bg-white border border-purple-100 text-gray-900 rounded-bl-md">
                        <p className="text-xs text-purple-600 mb-1 font-medium">AI 助手</p>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input area */}
            <div className="p-6 border-t border-purple-100 bg-gradient-to-r from-purple-50/50 to-blue-50/50 rounded-b-2xl">
              <div className="flex space-x-4">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isLoading ? "正在倾听中..." : "请告诉我你现在的感受..."}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
                  rows={2}
                />
                <button
                  onClick={sendMessage}
                  disabled={!userInput.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg flex items-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Dialog - moved inside conversation mode */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">保存对话记录</h3>
              
              {/* Conversation Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  对话名称 *
                </label>
                <input
                  type="text"
                  value={conversationName}
                  onChange={(e) => setConversationName(e.target.value)}
                  placeholder="为这次对话起个名字..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Predefined Tags */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择标签
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {predefinedTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Tag Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自定义标签
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="输入自定义标签..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomTag()
                      }
                    }}
                  />
                  <button
                    onClick={addCustomTag}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    添加
                  </button>
                </div>
              </div>

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    已选标签
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dialog Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelSave}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveConfirm}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-blue-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-indigo-200 rounded-full opacity-25"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-pink-200 rounded-full opacity-20"></div>
        
        {/* Main content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-16 flex items-center justify-center h-screen overflow-y-auto">
          <div className="text-center">
            {/* Icon */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              开启内心对话
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              让AI心理引导师陪伴你，在温暖安全的环境中，真实地表达内心的感受与想法
            </p>
            
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">温暖倾听</h3>
                <p className="text-sm text-gray-600">心理引导师用温柔无评判的方式引导你表达</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">情感安全</h3>
                <p className="text-sm text-gray-600">提供安全的氛围让你愿意真实地表达感受</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">深度觉察</h3>
                <p className="text-sm text-gray-600">帮助你更清晰地觉察内心的情绪与想法</p>
              </div>
            </div>
            
            {/* Main CTA Button */}
            <div className="relative">
              <button
                onClick={startConversation}
                disabled={isLoading}
                className="group relative px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-medium rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="relative z-10 flex items-center">
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      正在连接AI...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      开始心理引导
                    </>
                  )}
                </span>
                
                {/* Button glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
              </button>
              
              {/* Floating hint */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <p className="text-sm text-gray-500 animate-pulse">✨ 点击开始你的思想之旅</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RecordMemory