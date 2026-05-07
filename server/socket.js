import { Server } from 'socket.io'

let io

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:5174'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    })

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        socket.on('join_ticket', (ticketId) => {
            socket.join(`ticket_${ticketId}`)
            console.log(`User ${socket.id} joined ticket_${ticketId}`)
        })

        socket.on('join_user_room', (userId) => {
            socket.join(`user_${userId}`)
            console.log(`User ${socket.id} joined user_${userId}`)
        })

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id)
        })
    })

    return io
}

export function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized!')
    }
    return io
}
