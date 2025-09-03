import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import job from './lib/cron.js'

import authRoutes from "./routes/AuthRoutes.js";
import bookRoutes from './routes/BookRoutes.js'
import { connectDB } from './lib/db.js';

const app = express()

const PORT = process.env.PORT || 3000

job.start()

app.use(express.json())
app.use(cors())
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)

app.listen(PORT, () => {
    console.log(`Serrver is running on port ${PORT}`)
    connectDB()
})