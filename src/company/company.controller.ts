import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { InvitationStatus } from './invitation.entity';
import { User } from '../auth/user.entity';
import { CompanyCreateDto } from "./dto/companyCreateDto";

@ApiTags('Company')
@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Create a new company',
    description: 'This endpoint allows authenticated users to create a new company by providing its name and description.',
  })
  @ApiBody({
    description: 'Company details including name and description to create a new company.',
    type: CompanyCreateDto, // This will link to your DTO
  })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully.',
  })
  @UseGuards(JwtAuthGuard) // Ensuring only authenticated users can create a company
  async createCompany(
    @Body() body: CompanyCreateDto, // Using DTO for validation
    @CurrentUser() user: User,
  ) {
    const company = await this.companyService.createCompany(body.name, body.description, user);
    await this.companyService.addUserToCompany(company.id, user.id)
    return company;
  }

  @Post(':companyId/leave')
  @ApiOperation({
    summary: 'User leave company',
    description: 'This endpoint allows a user to leave a company using the company ID and user ID.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'ID of the company',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully left the company.',
  })
  @UseGuards(JwtAuthGuard) // Ensuring that only authenticated users can access this endpoint
  async leaveCompany(
    @Param('companyId') companyId: number,
    @CurrentUser('userId') user: User,
  ) {
    return this.companyService.leaveCompany(companyId, user.id);
  }

  @Post(':joinCode/join')
  @ApiOperation({
    summary: 'Join company using 8-character code',
    description: 'This endpoint allows a user to join a company using an 8-character code.',
  })
  @ApiParam({
    name: 'joinCode',
    description: 'The 8-character code to join the company',
    type: String,
    example: 'abc12345', // Example of a join code
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully joined the company.',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found for the given join code.',
  })
  @UseGuards(JwtAuthGuard) // Ensuring only authenticated users can join a company
  async joinCompany(
    @Param('joinCode') joinCode: string,
    @CurrentUser() user: User,
  ) {
    return this.companyService.joinCompanyWithCode(joinCode.toLowerCase(), user);
  }

  @Post(':companyId/invite/:userId')
  @ApiOperation({
    summary: 'Send invitation to a user to join the company',
  })
  @ApiParam({
    name: 'companyId',
    description: 'The ID of the company',
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user to invite',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation sent successfully.',
  })
  @UseGuards(JwtAuthGuard)
  async sendInvitation(
    @Param('companyId') companyId: number,
    @Param('userId') userId: number,
    @CurrentUser() currentUser: User,
  ) {
    return this.companyService.sendInvitation(companyId, userId, currentUser);
  }

  @Post('invitation/:invitationId/respond')
  @ApiOperation({
    summary: 'Respond to an invitation (accept or reject)',
  })
  @ApiParam({
    name: 'invitationId',
    description: 'The ID of the invitation',
    type: Number,
  })
  @ApiBody({
    description: 'Invitation response (accept or reject)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation status updated.',
  })
  @UseGuards(JwtAuthGuard)
  async respondToInvitation(
    @Param('invitationId') invitationId: number,
    @Body() body: { status: InvitationStatus },
    @CurrentUser() user: User,
  ) {
    return this.companyService.respondToInvitation(invitationId, body.status, user);
  }

  @Get('profile/invitations')
  @ApiOperation({
    summary: 'Get all invitations for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of invitations for the user.',
  })
  @UseGuards(JwtAuthGuard)
  async getUserInvitations(@CurrentUser() user: User) {
    return this.companyService.getUserInvitations(user);
  }
}
