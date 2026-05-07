import express from 'express'
import cors from 'cors'
import compression from 'compression'
import dotenv from 'dotenv'
import connectDB from './config/db.js'

dotenv.config()
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import sellerRoutes from './routes/seller.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'
import deliveryRoutes from './routes/delivery.js'
import supportRoutes from './routes/support.js'
import adminRoutes from './routes/admin.js'
import userRoutes from './routes/users.js'
import walletRoutes from './routes/wallet.js'
import refundRoutes from './routes/refundRoutes.js'
import stripeRoutes from './routes/stripeRoutes.js'
import { errorHandler } from './middlewares/errorMiddleware.js'

import { createServer } from 'http'
import { initSocket } from './socket.js'

// ... existing imports ...
const app = express()
const httpServer = createServer(app)

// Initialize Socket.io
initSocket(httpServer)

app.use(compression())
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Request logging removed to reduce noise

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/seller', sellerRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/delivery', deliveryRoutes)
app.use('/api/support', supportRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/users', userRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/refunds', refundRoutes)
app.use('/api/stripe', stripeRoutes)

app.use(errorHandler)

console.log('Connecting to database...')

try {
    await connectDB()
    const port = process.env.PORT || 5000
    httpServer.listen(port, () => console.log(`server running on ${port}`))
} catch (error) {
    console.error('Failed to connect to database', error)
    process.exit(1)
}

