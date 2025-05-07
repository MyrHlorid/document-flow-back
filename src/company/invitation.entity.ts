import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from '../auth/user.entity'; // Import User entity
import { Company } from './company.entity'; // Import Company entity
import { ApiProperty } from '@nestjs/swagger';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique ID of the invitation' })
  id: number;

  @ManyToOne(() => Company, (company) => company.invitations)
  @ApiProperty({ type: () => Company, description: 'Company the invitation is associated with' })
  company: Company;

  @ManyToOne(() => User, (user) => user.id)
  @ApiProperty({ type: () => User, description: 'User who the invitation is sent to' })
  user: User;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  @ApiProperty({ enum: InvitationStatus, description: 'The status of the invitation' })
  status: InvitationStatus;

  @CreateDateColumn()
  @ApiProperty({ description: 'Date when the invitation was created' })
  createdAt: Date;
}
