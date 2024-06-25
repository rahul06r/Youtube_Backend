import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asynchandler.js"


const healthCheck=asyncHandler(async(req,res)=>{
    try {
        return res.status(200)
        .json(new ApiResponse(200,{},"Server is healthy"));
    } catch (error) {
        throw new ApiError(400, error.message || "Something went wrong")
    }
})

export default  healthCheck;