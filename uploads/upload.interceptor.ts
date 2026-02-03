import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './multer.config';

//This function returns a pre-configured file upload interceptor that can be used in controllers to handle file uploads.
export const UploadFileInterceptor = () =>
  FileInterceptor('file', multerConfig);

