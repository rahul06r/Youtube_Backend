import express from 'express'


import cors from 'cors'

import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

// form data json
app.use(express.json({ limit: "16kb" }))


// url encoding 

app.use(express.urlencoded({ limit: "16kb", extended: true }))


// static file usage(public folder)

app.use(express.static("public"))



// cookie parser


app.use(cookieParser())



// routes   ##

// routes import
import userRouter from './routes/user.routes.js'
import videoRouter from "./routes/video.routes.js"
import dahsboardRouter from "./routes/dahsboard.routes.js"



// routes declaration


app.use("/api/v1/users", userRouter)
// example
// localhost:8000/api/v1/users/register


app.use("/api/v1/video", videoRouter)
// 
app.use("/api/v1/dashboard", dahsboardRouter)



export { app }