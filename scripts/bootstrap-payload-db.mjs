import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { getPayload } from 'payload'

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(process.cwd(), process.env.PAYLOAD_CONFIG_PATH)
  : path.resolve(process.cwd(), 'payload.config.ts')

const configModule = await import(pathToFileURL(configPath).toString())
const config = configModule.default || configModule

const payload = await getPayload({ config })
await payload.destroy()
