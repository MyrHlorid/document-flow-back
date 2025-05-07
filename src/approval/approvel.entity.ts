import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Document } from '../documents/document.entity';
import { User } from '../auth/user.entity';

export enum ApprovalDecision {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class Approval {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Document, (document) => document.approvals)
  document: Document;

  @ManyToOne(() => User)
  approver: User;

  @ManyToOne(() => User)
  requester: User;

  @Column({ type: 'enum', enum: ApprovalDecision, default: ApprovalDecision.PENDING })
  decision: ApprovalDecision;

  // Метод для утверждения документа
  async approve(): Promise<void> {
    this.decision = ApprovalDecision.APPROVED;
  }

  // Метод для отклонения документа
  async reject(): Promise<void> {
    this.decision = ApprovalDecision.REJECTED;
    // Возможно, нужно вернуться в исходное состояние или отменить процесс подписания
  }
}
