// Existing Vercel endpoint. Credentials and delivery coordination stay on the server.
import { waitUntil } from '@vercel/functions'
import { createContactHandler } from '../server/contact-handler.js'

export default createContactHandler({ schedule: (task) => waitUntil(task) })
