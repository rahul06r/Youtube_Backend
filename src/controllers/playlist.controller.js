import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"
import mongoose, { isValidObjectId } from "mongoose"

import { Playlist } from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        if (!name || name.trim() == "") {
            throw new ApiError(400, "Playlist Name is required!");
        }
        let playlistDescription = description.trim() || ""
        const nameExisted = await Playlist.findOne(
            {
                $and: [
                    { owner: req.user?._id },
                    { name }
                ]
            }
        );
        if (nameExisted) {
            throw new ApiError(400, "Playlist Name laready existed!");
        }
        const createPlaylist = await Playlist.create({
            name: name.trim(),
            description: playlistDescription,
            owner: req.user?._id,
            videos: [],
        });

        if (!createPlaylist) {
            throw new ApiError(500, "Something went wrong!");
        }
        return res.status(200)
            .json(new ApiResponse(200, createPlaylist, "Successfully Playlist Created ##"))
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong!");
    }

});

// 
const getUserPlaylists = asyncHandler(async (req, res) => {
    // const {userId}=req.params
    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        const getPlaylist = await Playlist.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(req.user?._id),
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "allVideos",
                }   
            }
        ])
        if (!getPlaylist) {
            throw new ApiResponse(201, {}, "No Playlist Found!!");
        }
        return res.status(200)
            .json(new ApiResponse(200, getPlaylist, `Playlist Found ${getPlaylist.length}`))
    } catch (error) {
        throw new ApiError(500, "Something went wrong")

    }
});

// 
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    try {
        if (!playlistId && !isValidObjectId(req.user?._id)) {
            throw new ApiError(401, "PlayList id is required");
        }
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        const playlistexisted = await Playlist.findById(playlistId);
        if (!playlistexisted) {
            throw new ApiError(404, "No Playlist Found!!");
        }
        const playList = await Playlist.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(playlistId)
                }
            },
            {
                $project: {
                    owner: 1,
                    name: 1,
                    description: 1,
                    videos: {
                        $cond: {
                            if: {
                                $eq: ["$owner", new mongoose.Types.ObjectId(req.user?._id)]
                            },
                            then: "$videos",
                            else: {
                                $filter: {
                                    input: "$videos",
                                    as: "videos",
                                    cond: {
                                        $eq: ["$videos.isPublished", true]
                                    }
                                }
                            }
                        },


                    },

                    createdAt: 1,
                    updatedAt: 1,

                }
            }
        ]);
        if (!playList) {
            throw new ApiError(400, "Not Found");
        }
        return res.status(200)
            .json(new ApiResponse(200, playList, `Fecthed Sucesfully ${playList.length}`))
    } catch (error) {
        throw new ApiError(500, "Something went wrong")
    }

});




// 
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    try {

        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "Unauthorized request!!");
        }


        if (!videoId && !isValidObjectId(videoId)) {
            throw new ApiError(401, "Video ID is required");
        }


        if (!playlistId && !isValidObjectId(playlistId)) {
            throw new ApiError(401, "Playlist ID is required");
        }


        const videoExisted = await Video.findById(videoId);
        if (!videoExisted) {
            throw new ApiError(401, "Video not found!!");
        }


        const playlistExisted = await Playlist.findOne({
            _id: new mongoose.Types.ObjectId(playlistId),
            owner: req.user._id
        });
        if (!playlistExisted) {
            throw new ApiError(404, "Playlist not found or Unauthorized!!");
        }


        if (playlistExisted.videos.includes(videoId)) {
            return res.status(200).json(new ApiResponse(200, {}, "Video already existed!!"));
        }


        const addVideoToPlaylist = await Playlist.updateOne(
            { _id: new mongoose.Types.ObjectId(playlistId) },
            { $push: { videos: videoExisted._id } }
        );

        return res.status(200).json(new ApiResponse(200, addVideoToPlaylist, "Video added!!"));
    } catch (error) {

        throw new ApiError(500, error.message || "Something went wrong")
    }
});

// 
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "Unauthorized request!!");
        }


        if (!videoId && !isValidObjectId(videoId)) {
            throw new ApiError(401, "Video ID is required");
        }


        if (!playlistId && !isValidObjectId(playlistId)) {
            throw new ApiError(401, "Playlist ID is required");
        }
        const videoExisted = await Video.findById(videoId);
        if (!videoExisted) {
            throw new ApiError(401, "Video not found!!");
        }
        const playlistExisted = await Playlist.findOne({
            _id: new mongoose.Types.ObjectId(playlistId),
            owner: new mongoose.Types.ObjectId(req.user?._id)
        })
        if (!playlistExisted) {
            throw new ApiError(404, "Playlist not found or Unauthorized!!");
        }
        if (!playlistExisted.videos.includes(videoId)) {
            return res.status(200).json(new ApiResponse(200, {}, "Video already removed!!"));
        }
        const removeVideoFromPlaylist = await Playlist.updateOne(
            { _id: new mongoose.Types.ObjectId(playlistId) },
            {
                $pull: { videos: videoExisted._id }
            }
        );

        return res.status(200).json(new ApiResponse(200, removeVideoFromPlaylist, "Video removed!!"));
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong")
    }
});

// 
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "Unauthorized request!!");
        }
        if (!playlistId && !isValidObjectId(playlistId)) {
            throw new ApiError(401, "Playlist ID is required");
        }
        const playListExisted = await Playlist.findOne({
            _id: new mongoose.Types.ObjectId(playlistId),
            owner: new mongoose.Types.ObjectId(req.user?._id)
        });
        if (!playListExisted) {
            throw new ApiError(400, "No playlist found!!")
        }
        const playlistdelete = await Playlist.findOneAndDelete({
            _id: new mongoose.Types.ObjectId(playlistId),
            owner: new mongoose.Types.ObjectId(req.user?._id)
        });


        return playlistdelete.status(200)
            .json(new ApiResponse(200, {}, "Playlist deleted!!"))
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong")
    }
});


// 
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "Unauthorized request!!");
        }
        if (!playlistId && !isValidObjectId(playlistId)) {
            throw new ApiError(401, "Playlist ID is required");
        }
        if (!playlistId && !isValidObjectId(playlistId)) {
            throw new ApiError(401, "Playlist ID is required");
        }
        if (!name || name.trim() == "") {
            throw new ApiError(401, "Playlist title required!!");
        }
        let playlistDescription = description || "";
        const updatePlaylist = await Playlist.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(playlistId),
                owner: new mongoose.Types.ObjectId(req.user?._id)
            }, {
            $set: {
                name: name.trim(),
                description: playlistDescription
            },
        });
        return res.status(200)
            .json(new ApiResponse(200, updatePlaylist, "Playlist Updated!!"))
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong")
    }

})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}