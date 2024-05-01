// promises

const asyncHandler = (requestHandler) => {
   return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
    }

}



export { asyncHandler }


// try catch block



// const ayncHandler = (fn) => aysnc(req, res, next)=> {
//     try {
//         await (req, res, next);

//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }

// }