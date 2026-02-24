import* as jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import * as fs from 'fs';
export class commonUtils {
  //jwt token generation
   static generateJwtToken(jwtData: { userId: string; role: string }) {
    return jwt.sign(jwtData, process.env.JWT_SECRET!, { expiresIn: '15m' });
  }
static generateFileHash(file: Express.Multer.File): string {
  // Check if buffer exists (Memory Storage) or path exists (Disk Storage)
  const data = file.buffer || fs.readFileSync(file.path);

  if (!data) {
    throw new Error('File data is missing; cannot generate hash.');
  }
  return createHash('sha256')
    .update(data)
    .digest('hex');
}
}
