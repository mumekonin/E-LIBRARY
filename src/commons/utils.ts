import* as jwt from 'jsonwebtoken';
export class commonUtils {
  //jwt
  static generateJwtToken(jwtData){
    const generateJwtToken=jwt.sign(jwtData, "jkfjnksdfnsjkfnfsajfnabggfdgfnmmmmnnnsnjj",{expiresIn:'10m'});
    return generateJwtToken;
  }
}