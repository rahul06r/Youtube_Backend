import { asyncHandler } from "../utils/asynchandler.js";


import { ApiError } from "../utils/ApiError.js"

import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"



import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";




const publishvideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const userID = req.user?._id;

    if (!userID) {
        throw new ApiError(404, "User Id not found!!!")
    }

    if (!(title && description)) {
        throw new ApiError(400, "Title and Description is needed!!")
    }
    const videoLocalPath = req.files?.videoFile[0]?.path

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file not found()Locally!!")
    }
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file not found(Locally)!!")
    }

    try {
        const videoFile = await uploadOnCloudinary(videoLocalPath)

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        if (!videoFile.url) {
            throw new ApiError(400, "Upload failed (URL not found)")
        }

        if (!thumbnail.url) {
            throw new ApiError(400, "Upload failed (URL not found)")
        }

        const videoUploadData = await Video.create({
            videoFile: videoFile?.url,
            thumbnail: thumbnail?.url,
            title,
            description,
            duration: videoFile?.duration,
            views: 0,
            isPublished: false,
            owner: userID
        })
        console.log("video data", videoUploadData);


        return res.status(200)
            .json(
                new ApiResponse(200, videoUploadData, "Video uploaded Successfully")
            )
    } catch (error) {
        throw new ApiError(400, error.message || "Something went wrong")

    }


})
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    if (!userId) {
        throw new ApiError(404, "Unauthorized Request!!")
    }
    const sortOptions = {};
    if (sortBy) {
        sortOptions[sortBy] = sortType == "desc" ? -1 : 1;
    }



    try {
        const result = await Video.aggregate([
            {
                $match: {
                    // use below code only for getting specific title
                    // $or: [
                    //     { title: { $regex: query, $options: "i" } },
                    //     { description: { $regex: query, $options: "i" } },
                    // ],
                    owner: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $sort: sortOptions,
            },
            {
                $skip: (parseInt(page) - 1) * parseInt(limit),
            },
            {
                $limit: parseInt(limit),
            },
        ]);
        return res.status(200).json(new ApiResponse(200, result, "Success"));
    } catch (e) {
        throw new ApiError(500, e.message);
    }
})


// const getAllVideos = asyncHandler(async (req, res) => {
//     const { page = 1, limit, query, sortBy, sortType, userId } = req.query
//     // given flexiblity for user to chosse the limit for a page!!

//     if (!userId) {
//         throw new ApiError(404, "Unauthorized Request!!")
//     }
//     if (!isValidObjectId(userId)) {
//         console.log(`Logging ${isValidObjectId(userId)}`);
//         throw new ApiError(404, "Unauthorized Request!!")

//     }
//     const pipeline = [];
//     if (userId) {
//         await User.findById(userId)
//         pipeline.push(
//             {
//                 $match: {
//                     // owner: !isValidObjectId(userId)
//                     owner: new mongoose.Types.ObjectId(userId)
//                 }
//             }
//         )
//         console.log(query, typeof query);
//         if (query) {
//             pipeline.push({
//                 $match: {
//                     isPublished: false
//                 }
//             })
//         }
//         let createfield = {}
//         if (sortBy && sortType) {
//             createfield[sortBy] = sortType == "asc" ? 1 : -1
//             pipeline.push({
//                 $sort: createfield
//             })
//         }
//         else {
//             createfield["createdAt"] = -1
//             pipeline.push({
//                 $sort: createfield
//             })
//         }

//         pipeline.push({
//             $skip: (page - 1) * parseInt(limit)
//         })
//         pipeline.push({
//             $limit: parseInt(limit)
//         })

//         console.log("Pipeline\n", pipeline);

//         const allVideos = await Video.aggregate(pipeline)
//         if (!allVideos) {
//             throw new ApiError(400, "pipeline problem")
//         }
//         res.status(200)
//             .json(new ApiResponse(200, allVideos, `All videos are here count:${allVideos.length}`))

//     }

// })


const getVideoId = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(401, "Video is is missing")
    }

    try {
        const video = await Video.findById(videoId)

        if (!video) {
            throw new ApiError(400, "Error while fetching the video")
        }

        console.log("video found", video);


        return res.status(200)
            .json(new ApiResponse(200, video, "video fetched successfully!!!"))
    } catch (error) {
        throw new ApiError(400, error.message || "Something went wrong")
    }

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body


    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(402, "Video not found!!")
    }
    if (!(req.user?._id.toString() === video.owner.toString())) {
        throw new ApiError(404, "Unauthorized Request!!")
    }

    if (!(title && description)) {
        throw new ApiError(401, "title and description is required")

    }
    const thumbnailLocalPath = req.file?.path
    if (!thumbnailLocalPath) {
        throw new ApiError(401, "Thumbnail not found (Locally)!!!")
    }

    try {
        const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        // delete previous thumbnail
        await deleteOnCloudinary(video.thumbnail)
    
        if (!newThumbnail) {
            throw new ApiError(500, "Thumbnail Uploading Failed!!!!")
        }
    
        // 
        const updatedVideoDeatils = await Video.findByIdAndUpdate(videoId, {
            $set: {
                thumbnail: newThumbnail.url,
                title,
                description
            }
        }, { new: true })
    
    
        return res.status(200)
            .json(
                new ApiResponse(200, updatedVideoDeatils, "Video updated successfully!!")
            )
    } catch (error) {
        throw new ApiError(400, error.message || "Something went wrong")
    }

})


const deleteVideoFile = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params

        if (!videoId) {
            throw new ApiError(400, "Video id not found Found")
        }
        const deleteVideo = await Video.findById(videoId);

        if (!deleteVideo) {
            throw new ApiError(400, "No video found")
        }
        if (!(req.user?._id.toString() === deleteVideo.owner.toString())) {
            throw new ApiError(404, "Unauthorized Request!!")
        }

        await Video.findByIdAndDelete(videoId)
        await deleteOnCloudinary(deleteVideo.videoFile)
        await deleteOnCloudinary(deleteVideo.thumbnail)


        return res.status(200)
            .json(new ApiResponse(200, {}, `Video deleted Successfully!!   ${deleteVideo.title}`))
    } catch (error) {
        throw new ApiError(400, error.message || "Something went wrong")

    }
})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        // console.log("error in 1st one");
        throw new ApiError(400, "No videoId found!!")
    }

    const toggleVideo = await Video.findById(videoId)
    if (!toggleVideo) {
        // console.log("error in 2nd one");
        throw new ApiError(404, "No video found!!")
    }

    if (!(toggleVideo.owner.toString() === req.user?._id.toString())) {
        // console.log("eror Unauthorized Request ");
        throw new ApiError(400, "Unauthorized Request!!")
    }
    try {
        toggleVideo.isPublished = !toggleVideo.isPublished
        await toggleVideo.save({
            validateBeforeSave: false
        })
    
        return res.status(200)
            .json(new ApiResponse(200, toggleVideo.isPublished, "toggling Done"))
    } catch (error) {
        throw new ApiError(400, error.message || "Something went wrong")
    }
    // depends on frontend if he needs for video deatils send the res data as toggleVideo or just send toggleVideo.ispublished
})


// search Video by Title
const searchTitleVideo = asyncHandler(async (req, res) => {
    const { title } = req.query;
    // ! add this if u need for authentication
    // if (!req.user?._id) {
    //     throw new ApiError(404, "Unauthorized Request!!")
    // }
    if (!title || title.trim() == "") {
        throw new ApiError(404, "Title is Empty!!##")
    }
    try {
        // const searchQuery = await Video.find(
        //     // {
        //     //     $text: {
        //     //         $search: title.trim(),
        //     //         // $caseSensitive: true
        //     //     }
        //     // },


        // );

        let searchQuery = await Video.find(
            {
                $text: { $search: title.trim().toString() }
            },
            {
                score: { $meta: "textScore" }
            }
        ).sort({ score: { $meta: "textScore" } });

        // result ==0 then
        if (searchQuery.length === 0) {
            searchQuery = await Video.find({
                title: { $regex: new RegExp(title.trim(),) }
            }).limit(10);
        }

        if (searchQuery.length == 0) {
            return res.status(200)
                .json(new ApiResponse(200, {}, `No Video Found for ${title}`));
        }
        return res.status(200)
            .json(new ApiResponse(200, searchQuery, ` Video Found for ${title}`))
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong")
    }
})



export {
    publishvideo,
    getVideoId,
    updateVideo,
    deleteVideoFile,
    togglePublishStatus,
    getAllVideos,
    searchTitleVideo
}