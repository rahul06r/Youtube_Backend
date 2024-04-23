// require('dotenv').config({path:'./env'})
// old approach


import dotenv from "dotenv"
import connectDB from "./db/index.js"


dotenv.config({
    path:'./env'
})


connectDB()