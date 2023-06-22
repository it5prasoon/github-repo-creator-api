import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS if needed
  app.enableCors({
    origin: [
      'http://localhost:8000',
      'https://github-repo-creator-frontend-de6m.vercel.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  });

  // Set the Referrer Policy in the response headers
  app.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
    next();
  });

  // Set up CORS middleware
  app.use(
    cors({
      origin: configService.get<string>('frontend.url'), // Replace with your frontend URL
      credentials: true, // Enable credentials (cookies, authorization headers) to be included in the request
    }),
  );

  // Apply validation to incoming requests
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
