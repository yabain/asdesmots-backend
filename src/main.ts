import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { MongoExceptionFilter } from './shared/exceptions';
import { AddSwaggerDoc } from './shared/docs/swagger';
import { AllHttpExceptionsFilter } from './shared/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,
    {
     bufferLogs:true 
    }
    );
    // app.useLogger(app.get(ActivityLoggerService))
  const port = process.env.PORT || 3000;

  app.useGlobalPipes(new ValidationPipe({
    whitelist:true,
    forbidNonWhitelisted:true,
    transform:true
  }));


  app.enableCors();
  app.useGlobalFilters(new MongoExceptionFilter());
  app.useGlobalFilters(new AllHttpExceptionsFilter());
  useContainer(app.select(AppModule),{fallbackOnErrors:true});
  // await CommandFactory.run(UpdatePermsScript);

  AddSwaggerDoc(app);

  await app.listen(port);

}
bootstrap();
