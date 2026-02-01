import { Module } from "@nestjs/common";
import { UserController } from "./controllers/users.controller";
import { UserService } from "./services/users.services";
import { MongooseModule } from "@nestjs/mongoose";
import { userSchema, UsersSchema } from "./schema/users.schema";
import { commonUtils } from "src/commons/utils";

@Module({ 
  imports:[ MongooseModule.forFeature([
      { name: UsersSchema.name, schema: userSchema}
    ])],
  controllers: [UserController],
  providers: [UserService,commonUtils,],
})
export class UserModule {}