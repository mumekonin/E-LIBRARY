import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from './commons/guards/jwt.strategy';
import { BookManagementModule } from './bookManagement/bookManagement.module';

@Module({
  imports: [UserModule, BookManagementModule, MongooseModule.forRoot("mongodb+srv://mumekonin:347548@cluster0.d3ahpuk.mongodb.net/e-library?retryWrites=true&w=majority")],
  controllers: [AppController],
  providers: [AppService,JwtStrategy],
})
export class AppModule {}
