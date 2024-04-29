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

app.use(express.urlencoded({limit:"16kb",extended:true}))


// static file usage(public folder)

app.use(express.static("public"))



// cookie parser


app.use(cookieParser())




export { app }