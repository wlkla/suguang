import { useState } from 'react'

interface AnalysisData {
  timeRange: string
  insights: {
    growth: string[]
    changes: string[]
    patterns: string[]
  }
  keyMoments: {
    date: string
    title: string
    significance: string
  }[]
  emotionalTrend: {
    period: string
    avgMood: number
    description: string
  }[]
  influences: {
    internal: string[]
    external: string[]
  }
}

const Analysis = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1year')
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 模拟分析数据
  const mockAnalysisData: AnalysisData = {
    timeRange: '过去一年',
    insights: {
      growth: [
        '对工作的态度从焦虑转向更加平和和理性',
        '在人际关系中学会了更好的边界设定',
        '对自我价值的认知更加成熟和稳定'
      ],
      changes: [
        '从完美主义者逐渐接受不完美',
        '价值观从追求外在认可转向内在满足',
        '生活重心从工作转向工作与生活的平衡'
      ],
      patterns: [
        '每当面临重大决策时，你倾向于寻求他人意见',
        '情绪低落时常通过写作和反思来调节',
        '对新事物保持开放态度，但需要时间适应变化'
      ]
    },
    keyMoments: [
      {
        date: '2023-03-15',
        title: '职业转换的思考',
        significance: '这是你思想转变的重要节点，开始重新审视职业价值'
      },
      {
        date: '2023-07-20',
        title: '关于友情的感悟',
        significance: '学会了在关系中保持自我，这标志着人际边界的建立'
      },
      {
        date: '2023-11-10',
        title: '接受不完美的自己',
        significance: '自我接纳的重大突破，心理健康状态明显改善'
      }
    ],
    emotionalTrend: [
      { period: '2023年1-3月', avgMood: 2.8, description: '情绪波动较大，多焦虑' },
      { period: '2023年4-6月', avgMood: 3.2, description: '开始有所改善，更加稳定' },
      { period: '2023年7-9月', avgMood: 3.7, description: '明显提升，积极情绪增多' },
      { period: '2023年10-12月', avgMood: 4.1, description: '整体乐观，内心更加平和' }
    ],
    influences: {
      internal: [
        '自我反思能力的提升',
        '对心理健康的重视',
        '学习新知识带来的成长感',
        '价值观的重新审视和确立'
      ],
      external: [
        '工作环境的变化和挑战',
        '重要人际关系的影响',
        '社会环境和时代背景',
        '阅读和学习资源的获得'
      ]
    }
  }

  const generateAnalysis = async () => {
    setIsLoading(true)
    // 模拟API调用
    setTimeout(() => {
      setAnalysisData(mockAnalysisData)
      setIsLoading(false)
    }, 2000)
  }

  const getMoodColor = (mood: number) => {
    if (mood < 2.5) return 'bg-red-500'
    if (mood < 3.5) return 'bg-yellow-500'
    if (mood < 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getMoodLabel = (mood: number) => {
    if (mood < 2.5) return '较低'
    if (mood < 3.5) return '一般'
    if (mood < 4) return '良好'
    return '很好'
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">思想变化分析</h1>

      {/* 时间范围选择 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">选择分析时间范围</h2>
        <div className="flex space-x-4 mb-4">
          {[
            { value: '6months', label: '过去6个月' },
            { value: '1year', label: '过去1年' },
            { value: '2years', label: '过去2年' },
            { value: 'all', label: '全部记录' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedTimeRange(option.value)}
              className={`px-4 py-2 rounded-lg border ${
                selectedTimeRange === option.value
                  ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          onClick={generateAnalysis}
          disabled={isLoading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
        >
          {isLoading ? '分析中...' : '生成分析报告'}
        </button>
      </div>

      {/* 分析结果 */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">AI正在分析你的思想变化轨迹...</p>
        </div>
      )}

      {analysisData && !isLoading && (
        <div className="space-y-6">
          {/* 核心洞察 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">核心洞察</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-green-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  成长轨迹
                </h3>
                <ul className="space-y-2">
                  {analysisData.insights.growth.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-blue-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  重要变化
                </h3>
                <ul className="space-y-2">
                  {analysisData.insights.changes.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-purple-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  思维模式
                </h3>
                <ul className="space-y-2">
                  {analysisData.insights.patterns.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 情绪趋势 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">情绪变化趋势</h2>
            <div className="space-y-4">
              {analysisData.emotionalTrend.map((trend, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-24 text-sm text-gray-600">{trend.period}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div
                      className={`h-4 rounded-full ${getMoodColor(trend.avgMood)}`}
                      style={{ width: `${(trend.avgMood / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm font-medium">{trend.avgMood.toFixed(1)}</div>
                  <div className="w-16 text-sm text-gray-600">{getMoodLabel(trend.avgMood)}</div>
                  <div className="flex-1 text-sm text-gray-600">{trend.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 关键时刻 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">关键转折点</h2>
            <div className="space-y-4">
              {analysisData.keyMoments.map((moment, index) => (
                <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{moment.title}</h3>
                    <span className="text-sm text-gray-500">{moment.date}</span>
                  </div>
                  <p className="text-sm text-gray-600">{moment.significance}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 影响因素分析 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">影响因素分析</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-orange-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  内在因素
                </h3>
                <ul className="space-y-2">
                  {analysisData.influences.internal.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-teal-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  外在因素
                </h3>
                <ul className="space-y-2">
                  {analysisData.influences.external.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-teal-500 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 建议与展望 */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-indigo-900">AI的建议与展望</h2>
            <div className="prose text-gray-700">
              <p className="mb-4">
                基于对你{analysisData.timeRange}思想变化的分析，你展现出了显著的个人成长。
                从情绪管理到价值观重塑，从人际边界到自我接纳，这些变化都表明你在朝着更成熟、
                更健康的心理状态发展。
              </p>
              <p className="mb-4">
                特别值得注意的是，你的内在驱动力正在从外部认可转向内在满足，
                这是心理成熟的重要标志。继续保持这种自我反思的习惯，
                将有助于你在未来的人生道路上做出更符合内心的选择。
              </p>
              <p>
                建议你定期回顾这些分析，观察自己的持续成长，
                同时也要关注那些可能阻碍发展的模式，适时寻求调整和改进。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analysis