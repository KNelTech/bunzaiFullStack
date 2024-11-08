import { write } from 'bun'

export async function writeJsonToFile(filePath: string, data: object) {
  try {
    const jsonString = JSON.stringify(data, null, 2)
    await write(filePath, jsonString)
    console.log(`Data written to ${filePath}`)
  } catch (error) {
    console.error('Error writing JSON to file:', error)
    throw error
  }
}
