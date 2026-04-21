import express from 'express'
import { createServer } from 'http'
import { WebSocketServer, type WebSocket } from 'ws'

const app = express()
app.use(express.json())

const server = createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })

const clients = new Set<WebSocket>()

wss.on('connection', (ws) => {
  clients.add(ws)
  ws.send(JSON.stringify({ type: 'connected', clientCount: clients.size }))

  ws.on('message', (data) => {
    // Broadcast to all other clients
    const msg = data.toString()
    clients.forEach(client => {
      if (client !== ws && client.readyState === 1) {
        client.send(msg)
      }
    })
  })

  ws.on('close', () => { clients.delete(ws) })
})

app.get('/health', (_req, res) => res.json({ ok: true, clients: clients.size }))

const PORT = 3001
server.listen(PORT, () => {
  console.log(`TaskFlow WS server on :${PORT}`)
})
