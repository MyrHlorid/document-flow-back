import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../auth/user.entity';
import { Invitation } from './invitation.entity'; // Import Invitation entity

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique ID of the company' })
  id: number;

  @Column()
  @ApiProperty({ description: 'Name of the company' })
  name: string;

  @Column()
  @ApiProperty({ description: 'Description of the company' })
  description: string;

  @Column({ unique: true, length: 8 })
  @ApiProperty({ description: 'The unique 8-character code for the company' })
  joinCode: string; // Unique join code

  // A user can create only one company (ManyToOne with lazy loading)
  @ManyToOne(() => User, (user) => user.company, { nullable: false })
  @ApiProperty({ type: () => User, description: 'Creator of the company' })
  createdBy: User;

  // A company can have many users (OneToMany with lazy loading)
  @OneToMany(() => User, (user) => user.company)
  @ApiProperty({ type: () => User, isArray: true, description: 'Users associated with the company' })
  users: User[];

  // A company can have many invitations (OneToMany with lazy loading)
  @OneToMany(() => Invitation, (invitation) => invitation.company)
  invitations: Invitation[];
}
