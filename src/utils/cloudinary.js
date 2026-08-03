import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });  // since cloudinary is an individual file means they not have access of .env file


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
    console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("API KEY:", process.env.CLOUDINARY_API_KEY);

const uploadOnCloudinary = async (localFilePath,folder_path) => {
    try{
        if(!localFilePath) return null

        // upload file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto",
            folder:folder_path  // data will be store in this folder
        })

        // file has been uploaded successfully
        // console.log("File has been uploaded on cloudinary", response.url) 
        fs.unlinkSync(localFilePath);
    
        return response;    // it returns the uploaded image link with details
    }
    catch(error) {
        console.log("Cloudinary upload error",error)
        fs.unlinkSync(localFilePath) // remove the file locally saves temp file from cloudinay
        return null;
    }
}

export {uploadOnCloudinary}