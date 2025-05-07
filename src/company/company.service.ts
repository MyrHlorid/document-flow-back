import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { User } from '../auth/user.entity';
import { Invitation, InvitationStatus } from './invitation.entity';
import { randomBytes } from 'crypto'; // To generate the 8-character code

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
  ) {}


  async createCompany(name: string, description: string, currentUser: User): Promise<Company> {
    const company = new Company();
    company.name = name;
    company.description = description;
    company.createdBy = currentUser;
    company.joinCode = randomBytes(3).toString('hex'); // Generate 8-character code

    // Save the company first
    return await this.companyRepository.save(company); // Return the saved company
  }

  async addUserToCompany(companyId: number, userId: number): Promise<Company> {
    // Fetch the company by its ID
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['users'], // Ensure users are loaded with the company
    });

    // Fetch the user by their ID
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Check if the company and user exist
    if (!company) {
      throw new Error('Company not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Check if the user is already a member of the company
    if (company.users.some((existingUser) => existingUser.id === userId)) {
      throw new Error('User is already a member of the company');
    }

    // Add the user to the company
    company.users.push(user);

    // Save the updated company
    return this.companyRepository.save(company);
  }

  async leaveCompany(companyId: number, userId: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['users'], // Ensure users are loaded with the company
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!company) {
      throw new Error('Company not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Check if the user is a member of the company
    const userIndex = company.users.findIndex((existingUser) => existingUser.id === userId);
    if (userIndex === -1) {
      throw new Error('User is not a member of the company');
    }

    // Remove the user from the company's users list
    company.users.splice(userIndex, 1);
    await this.companyRepository.save(company); // Save the updated company

    return company;
  }


  // Request to join the company using the join code
  async joinCompanyWithCode(joinCode: string, user: User): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { joinCode } });
    console.log(company)
    if (!company) {
      throw new Error('Company not found');
    }

    if (company.users) {
      company.users.push(user);
    } else {
      company.users = [user]
    }
    return this.companyRepository.save(company);
  }

  // Send invitation to a user
  async sendInvitation(companyId: number, userId: number, currentUser: User): Promise<Invitation> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['createdBy'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!company || !user) {
      throw new Error('Company or User not found');
    }

    if (company.createdBy.id !== currentUser.id) {
      throw new ForbiddenException('Only the company creator can send invitations');
    }

    const invitation = new Invitation();
    invitation.company = company;
    invitation.user = user;
    invitation.status = InvitationStatus.PENDING;

    return this.invitationRepository.save(invitation);
  }

  // Accept or reject an invitation
  async respondToInvitation(invitationId: number, status: InvitationStatus, user: User): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
      relations: ['company', 'user'],
    });

    if (!invitation || invitation.user.id !== user.id) {
      throw new Error('Invitation not found or you are not the recipient');
    }

    invitation.status = status;

    if (status === InvitationStatus.ACCEPTED) {
      // Add user to company
      const company = invitation.company;
      company.users.push(user);
      await this.companyRepository.save(company);
    }

    return this.invitationRepository.save(invitation);
  }

  // Get all invitations for a user
  async getUserInvitations(user: User): Promise<Invitation[]> {
    return this.invitationRepository.find({
      where: { user },
      relations: ['company'],
    });
  }
}
