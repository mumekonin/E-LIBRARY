import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: '*', // For development, you can use '*' or your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,}
  );
  // process.cwd() is the most reliable way to find 'uploads' in the project root
  const uploadsPath = join(process.cwd(), 'Uploads');
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  await app.listen(3000);
  console.log(`🚀 Server running on http://localhost:3000`);
  console.log(`📂 Serving static files from: ${uploadsPath}`);
}
bootstrap();