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
import communityPostRouter from "./routes/communityPost.routes.js"
import likeRouter from "./routes/like.routes.js"
import commentRouter from "./routes/comment.routes.js"
import playListRouter from "./routes/playlist.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import subscriptionsRouter from "./routes/subscriptions.routes.js"



// routes declaration


app.use("/api/v1/users", userRouter)
// example
// localhost:8000/api/v1/users/register


app.use("/api/v1/video", videoRouter)
// 
app.use("/api/v1/dashboard", dahsboardRouter)

// 
app.use("/api/v1/communityPost", communityPostRouter)
// 
app.use("/api/v1/like", likeRouter)
// 
app.use("/api/v1/comment", commentRouter)

app.use("/api/v1/playlist", playListRouter)

// 
app.use("/api/v1/health-check",healthcheckRouter)
// 

app.use("/api/v1/subscription",subscriptionsRouter)


export { app }