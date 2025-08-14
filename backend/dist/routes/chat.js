"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../lib/auth");
const router = (0, express_1.Router)();
// 开始新对话
router.post('/start', auth_1.authenticateToken, async (req, res) => {
    try {
        const { memoryRecordId } = req.body;
        const userId = req.user.id;
        // 验证记忆记录是否存在且属于当前用户
        const memoryRecord = await prisma_1.prisma.memoryRecord.findFirst({
            where: {
                id: memoryRecordId,
                userId
            }
        });
        if (!memoryRecord) {
            return res.status(404).json({ error: 'Memory record not found' });
        }
        // 创建新对话
        const conversation = await prisma_1.prisma.conversation.create({
            data: {
                userId,
                memoryRecordId,
                conversationData: JSON.stringify([
                    {
                        id: Date.now().toString(),
                        text: `你好！我是${memoryRecord.createdAt.toLocaleDateString()}的你。当时我记录了"${memoryRecord.title || '一些想法'}"，想和现在的你聊聊这个话题。`,
                        sender: 'past-self',
                        timestamp: new Date().toISOString()
                    }
                ])
            }
        });
        res.status(201).json({
            message: 'Conversation started successfully',
            conversation: {
                id: conversation.id,
                memoryRecord: {
                    id: memoryRecord.id,
                    title: memoryRecord.title,
                    date: memoryRecord.createdAt,
                    content: memoryRecord.content
                },
                messages: JSON.parse(conversation.conversationData)
            }
        });
    }
    catch (error) {
        console.error('Start conversation error:', error);
        res.status(500).json({ error: 'Failed to start conversation' });
    }
});
// 发送消息
router.post('/:id/message', auth_1.authenticateToken, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id);
        const { message } = req.body;
        const userId = req.user.id;
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }
        // 获取对话
        const conversation = await prisma_1.prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId
            },
            include: {
                memoryRecord: true
            }
        });
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        // 解析现有消息
        const messages = JSON.parse(conversation.conversationData);
        // 添加用户消息
        const userMessage = {
            id: Date.now().toString(),
            text: message,
            sender: 'user',
            timestamp: new Date().toISOString()
        };
        messages.push(userMessage);
        // 生成AI回复 (这里是模拟，实际应该调用OpenAI API)
        const aiResponse = generatePastSelfResponse(message, conversation.memoryRecord);
        const aiMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponse,
            sender: 'past-self',
            timestamp: new Date().toISOString()
        };
        messages.push(aiMessage);
        // 更新对话
        const updatedConversation = await prisma_1.prisma.conversation.update({
            where: { id: conversationId },
            data: {
                conversationData: JSON.stringify(messages)
            }
        });
        res.json({
            message: 'Message sent successfully',
            newMessages: [userMessage, aiMessage]
        });
    }
    catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});
// 获取对话历史
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id);
        const userId = req.user.id;
        const conversation = await prisma_1.prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId
            },
            include: {
                memoryRecord: true
            }
        });
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        res.json({
            conversation: {
                id: conversation.id,
                memoryRecord: {
                    id: conversation.memoryRecord.id,
                    title: conversation.memoryRecord.title,
                    date: conversation.memoryRecord.createdAt,
                    content: conversation.memoryRecord.content
                },
                messages: JSON.parse(conversation.conversationData),
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ error: 'Failed to get conversation' });
    }
});
// 获取用户的对话列表
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const conversations = await prisma_1.prisma.conversation.findMany({
            where: { userId },
            include: {
                memoryRecord: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
            skip,
            take: limit
        });
        const total = await prisma_1.prisma.conversation.count({
            where: { userId }
        });
        const conversationsWithPreview = conversations.map(conv => {
            const messages = JSON.parse(conv.conversationData);
            const lastMessage = messages[messages.length - 1];
            return {
                id: conv.id,
                memoryRecord: conv.memoryRecord,
                lastMessage: lastMessage,
                messageCount: messages.length,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt
            };
        });
        res.json({
            conversations: conversationsWithPreview,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Failed to get conversations' });
    }
});
// 模拟AI回复生成函数
function generatePastSelfResponse(userMessage, memoryRecord) {
    const responses = [
        `那时候的我确实是这么想的。关于"${memoryRecord.title}"，我记得...`,
        `这个话题让我想起了当时的情况。你现在怎么看待这个问题呢？`,
        `有趣，现在的你和那时的我有什么不同的看法吗？`,
        `我记得那段时间我特别关注这件事，现在你还是这样想吗？`,
        `这让我想起了当时记录这些想法时的心情...`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}
exports.default = router;
//# sourceMappingURL=chat.js.map