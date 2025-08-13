import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import memoryRoutes from './routes/memory'
import chatRoutes from './routes/chat'
import analysisRoutes from './routes/analysis'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(helmet())
app.use(cors({
  origin: [
    'https://wlkla.github.io',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/memory', memoryRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/analysis', analysisRoutes)

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  })
})

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})