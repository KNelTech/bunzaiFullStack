import { Bunzai, Logger } from 'bunzai'
import { writeJsonToFile } from './myMiddleware/jsonWriter'
import type { Context, Next, Middleware } from 'bunzai'

// Create app
const app = new Bunzai()

app.use(Logger())


app.static('/', '/static')

app.post('/myform', async (c) => {
  console.log('Content-Type:', c.reqHeader('content-type'))

  if (c.reqHeader('content-type') !== 'application/json') {
    return c.badRequest('Invalid type, expected application/json')
  }

  try {
    const jsonData = await c.reqJson()
    const { name, rating, comment } = jsonData

    if (!name || !rating || !comment) {
      return c.badRequest('Missing name, comment or rating')
    }

    console.log(`Received: Name - ${name}, rating - ${rating}, comment - ${comment}`)
    const filePath = './myData/theWorstWayToDoThis.json'
    await writeJsonToFile(filePath, jsonData)

    return c.json({
      message: 'fuck yea'
    })
  } catch (error) {
    console.error('Error parsing that json:', error)
    return c.badRequest('Invalid JSON')
  }
})

// Start server
app.listen().then(({ port, hostname }) => {
  console.log(`Server running at http://${hostname}:${port}`)
})

