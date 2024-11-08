import { Bunzai } from 'bunzai'

const convertMS = (ms: number): string => {
  const MS_IN_SECOND = 1000 as const
  const MS_IN_MINUTE = 60 * MS_IN_SECOND
  const MS_IN_HOUR = 60 * MS_IN_MINUTE
  const MS_IN_DAY = 24 * MS_IN_HOUR

  const days = (ms / MS_IN_DAY) | 0
  const hours = ((ms % MS_IN_DAY) / MS_IN_HOUR) | 0
  const minutes = ((ms % MS_IN_HOUR) / MS_IN_MINUTE) | 0
  const seconds = ((ms % MS_IN_MINUTE) / MS_IN_SECOND) | 0

  const timeStrings: string[] = []
  if (days) timeStrings.push(`${days} day${days > 1 ? 's' : ''}`)
  if (hours) timeStrings.push(`${hours} hour${hours > 1 ? 's' : ''}`)
  if (minutes) timeStrings.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
  if (seconds) timeStrings.push(`${seconds} second${seconds > 1 ? 's' : ''}`)

  return timeStrings.join(' ') || 'less than 1 second'
}

const formatDataSize = (bytes: number): string => {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'] as const
  let i = 0
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(2)} ${units[i]}`
}

interface HealthResponse {
  status: 'OK' | 'ERROR'
  uptime: string
  memory: {
    total: string
    used: string
    rss: string
  }
  timestamp: string
  responseTime: string
  message?: string
  error?: string
}

class HealthCheckService {
  static getUptime(): string {
    return convertMS(process.uptime() * 1000)
  }

  static getMemoryUsage(): { total: string; used: string; rss: string } {
    const { heapTotal, heapUsed, rss } = process.memoryUsage()
    return {
      total: formatDataSize(heapTotal),
      used: formatDataSize(heapUsed),
      rss: formatDataSize(rss)
    }
  }

  static getResponseTime(startTime: [number, number]): string {
    const [seconds, nanoseconds] = process.hrtime(startTime)
    return `${(seconds * 1000 + nanoseconds / 1e6).toFixed(3)} ms`
  }

  static buildResponse(
    status: 'OK' | 'ERROR',
    responseTime: string,
    uptime: string,
    memory: { total: string; used: string; rss: string },
    message?: string,
    error?: string
  ): HealthResponse {
    return {
      status,
      uptime,
      memory,
      timestamp: new Date().toLocaleString(),
      responseTime,
      message,
      error
    }
  }
}

const health = new Bunzai()

health.get('/', async (c) => {
  const startTime = process.hrtime()

  try {
    const healthStatus = 'OK'
    const uptime = HealthCheckService.getUptime()
    const memory = HealthCheckService.getMemoryUsage()

    const responseTime = HealthCheckService.getResponseTime(startTime)

    const response = HealthCheckService.buildResponse(healthStatus, responseTime, uptime, memory)

    c.setHeader('Server-Timing', `total;dur=${responseTime}`)

    return c.json(response, { status: 200 })
  } catch (error: any) {
    const responseTime = HealthCheckService.getResponseTime(startTime)
    const errorResponse = HealthCheckService.buildResponse(
      'ERROR',
      responseTime,
      'Health check failed',
      error.message
    )

    return c.json(errorResponse, { status: 500 })
  }
})

export default health
