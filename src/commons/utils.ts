import* as jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import * as fs from 'fs';
export class commonUtils {
  //jwt token generation
   static generateJwtToken(jwtData: { userId: string; role: string }) {
    return jwt.sign(jwtData, process.env.JWT_SECRET!, { expiresIn: '15m' });
  }
  static generateFileHash(file: Express.Multer.File):string{
  // diskStorage case
  const fileBuffer = fs.readFileSync(file.path);
  return createHash('sha256')
    .update(fileBuffer)
    .digest('hex');
}
}
