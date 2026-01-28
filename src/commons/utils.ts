import* as jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import * as fs from 'fs';
export class commonUtils {
  //jwt
  static generateJwtToken(jwtData){
    const generateJwtToken=jwt.sign(jwtData, "jkfjnksdfnsjkfnfsajfnabggfdgfnmmmmnnnsnjj",{expiresIn:'10m'});
    return generateJwtToken;
  }
  static generateFileHash(file: Express.Multer.File):string{
  // diskStorage case
  const fileBuffer = fs.readFileSync(file.path);
  return createHash('sha256')
    .update(fileBuffer)
    .digest('hex');
}
}
