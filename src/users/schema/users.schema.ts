import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from 'src/commons/enums/roles.enum';
@Schema({ timestamps: true })
export class UsersSchema {
  @Prop()
  firstName: string;
  @Prop()
  lastName: string;
  @Prop()
  username: string;
  @Prop()
  email: string;
  @Prop()
  password: string;
  @Prop({default:'student'})
  role:string;
 @Prop({default:null,type:String})
  refreshToken: string| null;
}
export const userSchema = SchemaFactory.createForClass(UsersSchema);
