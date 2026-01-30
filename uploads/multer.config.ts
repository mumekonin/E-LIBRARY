import { diskStorage } from 'multer';
import { extname } from 'path';
// Multer configuration for file uploads
export const multerConfig = {
  storage: diskStorage({              // configure disk storage
    destination: './uploads/Uploads',         // folder where uploaded files will be saved
    filename: (req, file, cb) => {   // function to set the filename of each uploaded file
      const uniqueName =              // create a unique name
        Date.now() + '-' + Math.round(Math.random() * 1e9); // timestamp + random number
      cb(null, uniqueName + extname(file.originalname)); // call callback with the filename + original extension
    },
  }),
};