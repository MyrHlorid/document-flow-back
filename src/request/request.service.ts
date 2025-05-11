// request.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, RequestType } from './request.entity';
import { User } from '../auth/user.entity';
import { Document, DocumentStatus } from '../documents/document.entity';

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  // Отправить запрос на подписание документа
  async sendRequest(senderId: number, receiverId: number, documentId: number): Promise<Request> {
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const receiver = await this.userRepository.findOne({ where: { id: receiverId } });
    const document = await this.documentRepository.findOne({ where: { id: documentId } });

    if (!sender || !receiver || !document) {
      throw new Error('Sender, Receiver, or Document not found');
    }

    const request = new Request();
    request.sender = sender;
    request.receiver = receiver;
    request.document = document;
    request.type = RequestType.OUTGOING;
    request.status = 'PENDING';

    return await this.requestRepository.save(request);
  }

  // Получить все входящие запросы для пользователя
  async getIncomingRequests(userId: number): Promise<Request[]> {
    return this.requestRepository.find({
      where: { receiver: { id: userId }, type: RequestType.INCOMING},
      relations: ['document', 'receiver', "sender"],
    });
  }

  async getRequestsByUserId(userId: number) {
    return this.requestRepository.find({
      where: [
        { sender: { id: userId } },
        { receiver: { id: userId } }
      ],
      relations: ['sender', 'receiver', 'document'],  // Здесь указываем связи для загрузки
    });
  }

  // Получить все исходящие запросы для пользователя
  async getOutgoingRequests(userId: number): Promise<Request[]> {
    return this.requestRepository.find({ where: { sender: { id: userId }, type: RequestType.OUTGOING } });
  }

  // Подписать документ (если запрос входящий)
  async signDocument(requestId: number, userId: number): Promise<Request> {
    const request = await this.requestRepository.findOne({ where: { id: requestId }, relations: ['document', 'receiver'] });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.receiver.id !== userId) {
      throw new Error('You are not authorized to sign this document');
    }

    if (request.status === 'SIGNED') {
      throw new Error('Document already signed');
    }

    // Изменяем статус документа
    request.document.status = DocumentStatus.SIGNED;
    await this.documentRepository.save(request.document);

    // Изменяем статус запроса на "SIGNED"
    request.status = 'SIGNED';
    return await this.requestRepository.save(request);
  }

  async declineRequest(requestId: number): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['receiver', 'document'],
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'PENDING') {
      throw new Error('Only pending requests can be declined');
    }

    request.status = 'DECLINED';
    return await this.requestRepository.save(request);
  }

}


