import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken, AuthRequest } from '../lib/auth'
import { aiService } from '../services/aiService'

const router = Router()

// 获取记忆的时间线分析
router.get('/analysis/:memoryId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const memoryId = parseInt(req.params.memoryId)
    const userId = req.user!.id

    // 验证记忆记录是否存在且属于当前用户
    const memoryRecord = await prisma.memoryRecord.findFirst({
      where: {
        id: memoryId,
        userId
      }
    })

    if (!memoryRecord) {
      return res.status(404).json({ error: 'Memory record not found' })
    }

    // 获取该记忆的所有时间线分析
    const timelineAnalyses = await prisma.timelineAnalysis.findMany({
      where: {
        memoryRecordId: memoryId,
        userId
      },
      orderBy: { createdAt: 'asc' },
      include: {
        conversation: true
      }
    })

    if (timelineAnalyses.length === 0) {
      // 如果没有分析，返回空状态，前端会提示用户开始对话
      return res.json({
        memoryTitle: memoryRecord.title,
        timeline: [],
        conversationsAnalyzed: 0
      })
    }

    // 转换为前端需要的格式
    const timeline = timelineAnalyses.map((analysis) => {
      let title = '首次记录'
      if (analysis.analysisStage !== 'initial') {
        // 从阶段字符串中提取对话次数，例如 "conversation_1" -> "第1次对话"
        const match = analysis.analysisStage.match(/conversation_(\d+)/)
        if (match) {
          title = `第${match[1]}次对话`
        }
      }
      
      return {
        stage: analysis.analysisStage,
        date: analysis.createdAt.toLocaleDateString('zh-CN'),
        title,
        insight: analysis.psychologicalInsight,
        emotionalState: analysis.emotionalState,
        growthIndicators: analysis.growthIndicators ? analysis.growthIndicators.split(',') : []
      }
    })

    // 计算实际的对话次数（排除初始记录）
    const actualConversations = timelineAnalyses.filter(analysis => 
      analysis.analysisStage !== 'initial'
    ).length

    res.json({
      memoryTitle: memoryRecord.title,
      timeline,
      conversationsAnalyzed: actualConversations
    })
  } catch (error) {
    console.error('Get timeline analysis error:', error)
    res.status(500).json({ error: 'Failed to get timeline analysis' })
  }
})

// 生成时间线分析
router.post('/generate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { memoryRecordId, conversationId, stage, conversationData } = req.body
    const userId = req.user!.id

    // 验证记忆记录是否存在且属于当前用户
    const memoryRecord = await prisma.memoryRecord.findFirst({
      where: {
        id: memoryRecordId,
        userId
      }
    })

    if (!memoryRecord) {
      return res.status(404).json({ error: 'Memory record not found' })
    }

    // 检查该记忆的现有分析数量，确定正确的阶段
    const existingAnalyses = await prisma.timelineAnalysis.findMany({
      where: {
        memoryRecordId,
        userId
      },
      orderBy: { createdAt: 'asc' }
    })

    // 确定当前阶段：如果已有分析，说明这是新的一次对话
    let actualStage = 'initial'
    if (existingAnalyses.length === 0) {
      actualStage = 'initial'
    } else {
      // 过滤掉初始分析，计算实际对话次数
      const conversationAnalyses = existingAnalyses.filter(analysis => 
        analysis.analysisStage !== 'initial'
      )
      actualStage = `conversation_${conversationAnalyses.length + 1}`
    }

    // 使用传入的对话数据，或从数据库获取
    let analysisConversationData = conversationData
    if (!analysisConversationData && conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
          memoryRecordId
        }
      })
      
      if (conversation) {
        analysisConversationData = JSON.parse(conversation.conversationData)
      }
    }

    // 检查是否已存在相同阶段的分析，避免重复
    const existingStageAnalysis = existingAnalyses.find(analysis => 
      analysis.analysisStage === actualStage
    )

    if (existingStageAnalysis) {
      // 如果已存在该阶段的分析，直接返回现有的
      return res.json({
        message: 'Timeline analysis already exists for this stage',
        analysis: {
          id: existingStageAnalysis.id,
          stage: existingStageAnalysis.analysisStage,
          insight: existingStageAnalysis.psychologicalInsight,
          emotionalState: existingStageAnalysis.emotionalState,
          growthIndicators: existingStageAnalysis.growthIndicators ? existingStageAnalysis.growthIndicators.split(',') : [],
          createdAt: existingStageAnalysis.createdAt
        }
      })
    }

    // 使用AI生成心理分析
    const analysis = await aiService.analyzePsychology(
      memoryRecord,
      analysisConversationData,
      actualStage
    )

    // 保存分析结果
    const timelineAnalysis = await prisma.timelineAnalysis.create({
      data: {
        userId,
        memoryRecordId,
        conversationId: conversationId || null,
        analysisStage: actualStage, // 使用计算出的正确阶段
        psychologicalInsight: analysis.insight,
        emotionalState: analysis.emotionalState,
        growthIndicators: analysis.growthIndicators.join(',')
      }
    })

    res.json({
      message: 'Timeline analysis generated successfully',
      analysis: {
        id: timelineAnalysis.id,
        stage: actualStage,
        insight: analysis.insight,
        emotionalState: analysis.emotionalState,
        growthIndicators: analysis.growthIndicators,
        createdAt: timelineAnalysis.createdAt
      }
    })
  } catch (error) {
    console.error('Generate timeline analysis error:', error)
    res.status(500).json({ error: 'Failed to generate timeline analysis' })
  }
})


// 清理记忆的重复分析记录
router.delete('/cleanup/:memoryId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const memoryId = parseInt(req.params.memoryId)
    const userId = req.user!.id

    // 验证记忆记录是否存在且属于当前用户
    const memoryRecord = await prisma.memoryRecord.findFirst({
      where: {
        id: memoryId,
        userId
      }
    })

    if (!memoryRecord) {
      return res.status(404).json({ error: 'Memory record not found' })
    }

    // 获取该记忆的所有分析，按创建时间排序
    const analyses = await prisma.timelineAnalysis.findMany({
      where: {
        memoryRecordId: memoryId,
        userId
      },
      orderBy: { createdAt: 'asc' }
    })

    if (analyses.length === 0) {
      return res.json({ message: 'No analysis records found', deleted: 0 })
    }

    // 保留每个阶段最早的一条记录，删除重复的
    const stageMap = new Map<string, number>()
    const toDelete: number[] = []

    analyses.forEach(analysis => {
      if (!stageMap.has(analysis.analysisStage)) {
        stageMap.set(analysis.analysisStage, analysis.id)
      } else {
        toDelete.push(analysis.id)
      }
    })

    if (toDelete.length > 0) {
      await prisma.timelineAnalysis.deleteMany({
        where: {
          id: { in: toDelete }
        }
      })
    }

    res.json({
      message: 'Duplicate analysis records cleaned up successfully',
      deleted: toDelete.length,
      remaining: stageMap.size
    })
  } catch (error) {
    console.error('Cleanup timeline analysis error:', error)
    res.status(500).json({ error: 'Failed to cleanup timeline analysis' })
  }
})

export default router