import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT =3000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? PORT);
}
bootstrap().then(()=>{
   console.log(`nest is running on port ${process.env.PORT ?? PORT}`);
});
