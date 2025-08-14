"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../lib/auth");
const router = (0, express_1.Router)();
// 创建记忆记录
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { title, content, mood, tags } = req.body;
        const userId = req.user.id;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const memoryRecord = await prisma_1.prisma.memoryRecord.create({
            data: {
                userId,
                title: title || null,
                content,
                mood: mood ? parseInt(mood) : null,
                tags: tags || null
            }
        });
        res.status(201).json({
            message: 'Memory record created successfully',
            record: memoryRecord
        });
    }
    catch (error) {
        console.error('Create memory record error:', error);
        res.status(500).json({ error: 'Failed to create memory record' });
    }
});
// 获取用户的记忆记录列表
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const records = await prisma_1.prisma.memoryRecord.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: {
                id: true,
                title: true,
                content: true,
                mood: true,
                tags: true,
                createdAt: true
            }
        });
        const total = await prisma_1.prisma.memoryRecord.count({
            where: { userId }
        });
        res.json({
            records,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Get memory records error:', error);
        res.status(500).json({ error: 'Failed to get memory records' });
    }
});
// 获取单个记忆记录
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const recordId = parseInt(req.params.id);
        const userId = req.user.id;
        const record = await prisma_1.prisma.memoryRecord.findFirst({
            where: {
                id: recordId,
                userId
            }
        });
        if (!record) {
            return res.status(404).json({ error: 'Memory record not found' });
        }
        res.json({ record });
    }
    catch (error) {
        console.error('Get memory record error:', error);
        res.status(500).json({ error: 'Failed to get memory record' });
    }
});
// 更新记忆记录
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const recordId = parseInt(req.params.id);
        const userId = req.user.id;
        const { title, content, mood, tags } = req.body;
        const existingRecord = await prisma_1.prisma.memoryRecord.findFirst({
            where: {
                id: recordId,
                userId
            }
        });
        if (!existingRecord) {
            return res.status(404).json({ error: 'Memory record not found' });
        }
        const updatedRecord = await prisma_1.prisma.memoryRecord.update({
            where: { id: recordId },
            data: {
                title: title !== undefined ? title : existingRecord.title,
                content: content !== undefined ? content : existingRecord.content,
                mood: mood !== undefined ? parseInt(mood) : existingRecord.mood,
                tags: tags !== undefined ? tags : existingRecord.tags
            }
        });
        res.json({
            message: 'Memory record updated successfully',
            record: updatedRecord
        });
    }
    catch (error) {
        console.error('Update memory record error:', error);
        res.status(500).json({ error: 'Failed to update memory record' });
    }
});
// 删除记忆记录
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const recordId = parseInt(req.params.id);
        const userId = req.user.id;
        const existingRecord = await prisma_1.prisma.memoryRecord.findFirst({
            where: {
                id: recordId,
                userId
            }
        });
        if (!existingRecord) {
            return res.status(404).json({ error: 'Memory record not found' });
        }
        await prisma_1.prisma.memoryRecord.delete({
            where: { id: recordId }
        });
        res.json({ message: 'Memory record deleted successfully' });
    }
    catch (error) {
        console.error('Delete memory record error:', error);
        res.status(500).json({ error: 'Failed to delete memory record' });
    }
});
// 搜索记忆记录
router.get('/search', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const query = req.query.q;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        const records = await prisma_1.prisma.memoryRecord.findMany({
            where: {
                userId,
                OR: [
                    { title: { contains: query } },
                    { content: { contains: query } },
                    { tags: { contains: query } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: {
                id: true,
                title: true,
                content: true,
                mood: true,
                tags: true,
                createdAt: true
            }
        });
        res.json({ records });
    }
    catch (error) {
        console.error('Search memory records error:', error);
        res.status(500).json({ error: 'Failed to search memory records' });
    }
});
exports.default = router;
//# sourceMappingURL=memory.js.map