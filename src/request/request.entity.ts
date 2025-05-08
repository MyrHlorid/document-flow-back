// request.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/user.entity';
import { Document } from '../documents/document.entity';

export enum RequestType {
  OUTGOING = 'outgoing',  // Исходящий запрос (отправил)
  INCOMING = 'incoming',  // Входящий запрос (получил)
}

@Entity()
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RequestType })
  type: RequestType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User; // Отправитель

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User; // Получатель

  @ManyToOne(() => Document)
  @JoinColumn({ name: 'document_id' })
  document: Document; // Документ, прикрепленный к запросу

  @Column({ default: 'PENDING' })
  status: string; // Статус запроса (например, ожидает подписания)
}
