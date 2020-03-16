import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './app/common/config/config.service';
import { HttpExceptionFilter } from './app/common/error-manager/http-exception.filter';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService: ConfigService = app.get(ConfigService);
  app.setGlobalPrefix('/api/' + configService.get('APP_VERSION'));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(bodyParser.json({limit: '5mb'}));
  app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
  await app.listen(configService.get('APP_PORT'));
}
bootstrap();
