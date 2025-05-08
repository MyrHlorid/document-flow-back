import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../auth/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Approval } from "../approval/approvel.entity";

export enum DocumentStatus {
  CREATED = 'created',
  PENDING_SIGNATURE = 'pending_signature',
  SIGNED = 'signed',
  DELETED = 'deleted',
}

@Entity()
export class Document {
  @ApiProperty({ description: 'Unique identifier of the document', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Title of the document', example: 'Contract' })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Current status of the document',
    example: DocumentStatus.CREATED,
    enum: DocumentStatus
  })
  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.CREATED })
  status: DocumentStatus;

  @Column({ nullable: true })
  file_url: string;

  @Column({ nullable: true })
  signature: string;  // Добавлено поле для хранения подписи

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  @ApiProperty({ description: 'User who created the document', type: () => User })
  created_by: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  @ApiProperty({ description: 'User who updated or signed the document', type: () => User, nullable: true })
  updated_by: User;

  @CreateDateColumn()
  @ApiProperty({ description: 'Date when the document was created' })
  created_at: Date;

  @OneToMany(() => Approval, (approval) => approval.document)
  approvals: Approval[];

  send_for_approval() {
    if (this.status === DocumentStatus.CREATED) {
      console.log("SET NEW STATUS", DocumentStatus.PENDING_SIGNATURE)
      this.status = DocumentStatus.PENDING_SIGNATURE;
      return this;
    }
    throw new Error('Document cannot be sent for approval');
  }

  sign_document(user: User, signature: string) {
    if (this.status === DocumentStatus.PENDING_SIGNATURE) {
      this.status = DocumentStatus.SIGNED;
      this.updated_by = user;
      this.signature = signature;  // Сохраняем подпись
      return this;
    }
    throw new Error('Document cannot be signed');
  }
}
