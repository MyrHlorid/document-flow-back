import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';  // Для подключения сущностей с TypeORM
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { Document } from './document.entity';  // Импортируем сущность документа
import { User } from '../auth/user.entity';
import { Approval } from "../approval/approvel.entity";  // Импортируем сущность пользователя, если нужно для связи
import { S3Service } from '../common/aws/s3.service';
import { SignatureService } from "../common/signature/signature.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, User, Approval]),  // Регистрируем сущности для работы с TypeORM
  ],
  controllers: [DocumentController],  // Регистрируем контроллер
  providers: [DocumentService, S3Service, SignatureService],  // Регистрируем сервис
})
export class DocumentModule {}
