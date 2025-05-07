import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../company/company.entity';  // Lazy loading for Company
import { Exclude } from 'class-transformer';

export enum Role {
  ADMIN = 'admin',
  SUPER_MANAGER = 'super_manager',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Unique ID' })
  id: number;

  @Column()
  @ApiProperty({ example: '$2b$10$hashed_password...', description: 'Hashed Password' })
  password: string;

  @Column()
  @ApiProperty({ example: 'John', description: 'First Name' })
  firstName: string;

  @Column()
  @ApiProperty({ example: 'Doe', description: 'Last Name' })
  lastName: string;

  @Column({ unique: true })
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  email: string;

  @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE })
  @ApiProperty({ example: Role.EMPLOYEE, description: 'Role of the user' })
  role: Role;

  // One user can belong to one company (ManyToOne)
  @ManyToOne(() => Company, (company) => company.users)
  @ApiProperty({ type: () => Company, description: 'Company the user belongs to' })
  company: Company; // This is where the relationship is established

}