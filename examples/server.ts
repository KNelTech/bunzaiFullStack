// example/server.ts

import { Bunzai } from '../src/index'
import { Logger } from '../src/middleware/logger'
import { type Context, type Next, type Middleware } from '../src/core/types'
import health from './examples/health'

// Create app
const app = new Bunzai()

// Bunzai Basic Logger Middleware, default options.
app.use(Logger())
// Customize Logger Middleware
// app.use(
//   Logger({
//     logLevel: 'debug',
//     formatTimestamp: () => new Date().toLocaleString(),
//     formatLog: (timestamp, method, url, status, duration) =>
//       `${timestamp} - ${method} ${url} - Status: ${status}, Duration: ${duration.toFixed(2)}ms`
//   })
// )

app.get('/', (c: Context) => c.json({ message: 'Hello, Bunzai!' }))


app.use('/health', async (c: Context, next: Next) => {
  c.setHeader('X-Powered-By', 'Bunzai')
  await next()
})
app.route('/health', health)

app.get('/set-cookie', (c: Context) => {
  c.setCookie('X-Test', 'BunzaiCookie', { maxAge: 1000 * 60 * 60 * 1 })
  return c.json({ message: 'Cookie set' })
})

app.get('/cookie', (c: Context) => {
  const cookie = c.getCookie('X-Test')
  return c.json({ cookie })
})




// Start server
app
  .listen()
  .then(({ port, hostname }) => {
    console.log(`Server running at http://${hostname}:${port}`)
  })
  .catch((error) => {
    console.error('Failed to start server:', error)
  })
