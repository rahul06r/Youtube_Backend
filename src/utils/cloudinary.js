import { v2 as cloudinary } from 'cloudinary'

import fs from 'fs'



// 


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});




const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })

        console.log("File is uploaded on CLOUDINARY", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log("Uploading failed!!## ", error);
        // remove the loaclly saved temporary file as the upload operation failed
        return null;

    }

}
const deleteOnCloudinary = async (localPath) => {
    try {
        const fileExtension = localPath.split('.').pop();
        const resourceType = ['mp4', 'avi', 'mov', 'mkv'].includes(fileExtension) ? 'video' : 'image';

        const publicId = localPath.split('/').pop().replace(/\.(jpg|png|gif|jpeg|mp4|avi|mov|mkv)$/, '');

        console.log(publicId);

        if (!publicId) {
            throw new ApiError(400, "Local path of deleted file missing");
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        console.log(result);

        return result;
    } catch (error) {
        console.error(error);
        throw new ApiError(400, error.message || "Cannot delete");
    }
}



export { uploadOnCloudinary, deleteOnCloudinary }





