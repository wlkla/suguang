"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../lib/auth");
const router = (0, express_1.Router)();
// 生成思想分析
router.post('/generate', auth_1.authenticateToken, async (req, res) => {
    try {
        const { timeRange, analysisType } = req.body;
        const userId = req.user.id;
        // 根据时间范围获取记忆记录
        const dateFilter = getDateFilter(timeRange);
        const memoryRecords = await prisma_1.prisma.memoryRecord.findMany({
            where: {
                userId,
                ...dateFilter
            },
            orderBy: { createdAt: 'asc' }
        });
        if (memoryRecords.length === 0) {
            return res.status(400).json({ error: 'No memory records found for the specified time range' });
        }
        // 生成分析结果
        const analysisResult = await generateAnalysis(memoryRecords, analysisType, timeRange);
        // 保存分析结果
        const savedAnalysis = await prisma_1.prisma.thoughtAnalysis.create({
            data: {
                userId,
                analysisType,
                timeRange,
                analysisResult: JSON.stringify(analysisResult)
            }
        });
        res.json({
            message: 'Analysis generated successfully',
            analysis: {
                id: savedAnalysis.id,
                ...analysisResult,
                createdAt: savedAnalysis.createdAt
            }
        });
    }
    catch (error) {
        console.error('Generate analysis error:', error);
        res.status(500).json({ error: 'Failed to generate analysis' });
    }
});
// 获取分析历史
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const analyses = await prisma_1.prisma.thoughtAnalysis.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });
        const total = await prisma_1.prisma.thoughtAnalysis.count({
            where: { userId }
        });
        const analysesWithParsedResults = analyses.map(analysis => ({
            id: analysis.id,
            analysisType: analysis.analysisType,
            timeRange: analysis.timeRange,
            createdAt: analysis.createdAt,
            ...JSON.parse(analysis.analysisResult)
        }));
        res.json({
            analyses: analysesWithParsedResults,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Get analyses error:', error);
        res.status(500).json({ error: 'Failed to get analyses' });
    }
});
// 获取特定分析
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const analysisId = parseInt(req.params.id);
        const userId = req.user.id;
        const analysis = await prisma_1.prisma.thoughtAnalysis.findFirst({
            where: {
                id: analysisId,
                userId
            }
        });
        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }
        res.json({
            analysis: {
                id: analysis.id,
                analysisType: analysis.analysisType,
                timeRange: analysis.timeRange,
                createdAt: analysis.createdAt,
                ...JSON.parse(analysis.analysisResult)
            }
        });
    }
    catch (error) {
        console.error('Get analysis error:', error);
        res.status(500).json({ error: 'Failed to get analysis' });
    }
});
// 删除分析
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const analysisId = parseInt(req.params.id);
        const userId = req.user.id;
        const existingAnalysis = await prisma_1.prisma.thoughtAnalysis.findFirst({
            where: {
                id: analysisId,
                userId
            }
        });
        if (!existingAnalysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }
        await prisma_1.prisma.thoughtAnalysis.delete({
            where: { id: analysisId }
        });
        res.json({ message: 'Analysis deleted successfully' });
    }
    catch (error) {
        console.error('Delete analysis error:', error);
        res.status(500).json({ error: 'Failed to delete analysis' });
    }
});
// 工具函数：根据时间范围生成日期过滤器
function getDateFilter(timeRange) {
    const now = new Date();
    let startDate;
    switch (timeRange) {
        case '6months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            break;
        case '1year':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
        case '2years':
            startDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
            break;
        case 'all':
        default:
            return {}; // 不添加日期过滤器
    }
    return {
        createdAt: {
            gte: startDate
        }
    };
}
// 模拟分析生成函数 (实际应该集成AI分析)
async function generateAnalysis(memoryRecords, analysisType, timeRange) {
    // 计算情绪趋势
    const emotionalTrend = calculateEmotionalTrend(memoryRecords);
    // 识别关键时刻
    const keyMoments = identifyKeyMoments(memoryRecords);
    // 生成洞察
    const insights = generateInsights(memoryRecords);
    // 分析影响因素
    const influences = analyzeInfluences(memoryRecords);
    return {
        timeRange: getTimeRangeLabel(timeRange),
        recordsAnalyzed: memoryRecords.length,
        insights,
        keyMoments,
        emotionalTrend,
        influences,
        summary: `基于${memoryRecords.length}条记录的分析，发现了显著的个人成长轨迹。`
    };
}
function getTimeRangeLabel(timeRange) {
    const labels = {
        '6months': '过去6个月',
        '1year': '过去1年',
        '2years': '过去2年',
        'all': '全部记录'
    };
    return labels[timeRange] || '未知时间范围';
}
function calculateEmotionalTrend(records) {
    if (records.length === 0)
        return [];
    // 按季度分组计算平均心情
    const quarters = {};
    records.forEach(record => {
        if (record.mood) {
            const date = new Date(record.createdAt);
            const quarter = `${date.getFullYear()}年Q${Math.floor(date.getMonth() / 3) + 1}`;
            if (!quarters[quarter]) {
                quarters[quarter] = [];
            }
            quarters[quarter].push(record.mood);
        }
    });
    return Object.entries(quarters).map(([period, moods]) => ({
        period,
        avgMood: moods.reduce((sum, mood) => sum + mood, 0) / moods.length,
        description: getEmotionalDescription(moods.reduce((sum, mood) => sum + mood, 0) / moods.length)
    }));
}
function getEmotionalDescription(avgMood) {
    if (avgMood < 2.5)
        return '情绪波动较大，多焦虑';
    if (avgMood < 3.5)
        return '开始有所改善，更加稳定';
    if (avgMood < 4)
        return '明显提升，积极情绪增多';
    return '整体乐观，内心更加平和';
}
function identifyKeyMoments(records) {
    // 简单模拟：选择内容较长或心情变化较大的记录作为关键时刻
    return records
        .filter(record => record.content.length > 200 || record.mood)
        .slice(0, 3)
        .map(record => ({
        date: record.createdAt.toISOString().split('T')[0],
        title: record.title || '重要的思考',
        significance: '这是你思想变化的重要节点'
    }));
}
function generateInsights(records) {
    return {
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
    };
}
function analyzeInfluences(records) {
    return {
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
    };
}
exports.default = router;
//# sourceMappingURL=analysis.js.map