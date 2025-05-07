import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DocumentModule } from './documents/document.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [
    AuthModule,
    DocumentModule,
    CompanyModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Получаем порт из .env или используем значение по умолчанию '5432'
        const dbPort = configService.get<string>('DB_PORT');
        if (!dbPort) {
          // Можно выбросить ошибку, если порт обязателен и не должен иметь значения по умолчанию
          // throw new Error('DB_PORT is not defined in .env file');
          console.warn('DB_PORT not found in .env, using default 5432');
        }
        const port = parseInt(dbPort || '5432', 10);

        // Получаем хост из .env. Если он может быть undefined и это критично, добавьте проверку.
        const dbHost = configService.get<string>('DB_HOST');
        if (!dbHost) {
          throw new Error('DB_HOST is not defined in .env file');
        }

        // Получаем имя пользователя из .env. Если оно может быть undefined и это критично, добавьте проверку.
        const dbUsername = configService.get<string>('DB_USERNAME');
        if (!dbUsername) {
          throw new Error('DB_USERNAME is not defined in .env file');
        }

        // Получаем пароль из .env. Если он может быть undefined и это критично, добавьте проверку.
        const dbPassword = configService.get<string>('DB_PASSWORD');
        if (!dbPassword) {
          throw new Error('DB_PASSWORD is not defined in .env file');
        }

        // Получаем имя БД из .env. Если оно может быть undefined и это критично, добавьте проверку.
        const dbName = configService.get<string>('DB_NAME');
        if (!dbName) {
          throw new Error('DB_NAME is not defined in .env file');
        }

        return {
          type: 'postgres',
          host: dbHost,
          port: port,
          username: dbUsername,
          password: dbPassword,
          database: dbName,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
