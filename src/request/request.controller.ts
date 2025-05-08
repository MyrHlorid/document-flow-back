// request.controller.ts
import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { RequestService } from './request.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request as RequestEntity } from './request.entity';

@ApiTags('Requests')
@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  // Отправить запрос на подписание
  @Post('send')
  @ApiOperation({ summary: 'Send a request to sign a document' })
  @ApiResponse({ status: 201, description: 'Request sent successfully', type: RequestEntity })
  @UseGuards(JwtAuthGuard)
  async sendRequest(
    @Body() body: { senderId: number; receiverId: number; documentId: number }
  ) {
    return this.requestService.sendRequest(body.senderId, body.receiverId, body.documentId);
  }

  // Получить все входящие запросы пользователя
  @Get('incoming/:userId')
  @ApiOperation({ summary: 'Get incoming requests for a user' })
  @ApiResponse({ status: 200, description: 'List of incoming requests', type: [RequestEntity] })
  @UseGuards(JwtAuthGuard)
  async getIncomingRequests(@Param('userId') userId: number) {
    const response = await this.requestService.getIncomingRequests(userId);
    console.log(response)
    return response
  }

  // Получить все исходящие запросы пользователя
  @Get('outgoing/:userId')
  @ApiOperation({ summary: 'Get outgoing requests for a user' })
  @ApiResponse({ status: 200, description: 'List of outgoing requests', type: [RequestEntity] })
  @UseGuards(JwtAuthGuard)
  async getOutgoingRequests(@Param('userId') userId: number) {
    const response = await this.requestService.getOutgoingRequests(userId);
    console.log(response)
    return response;
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getRequestsForUser(@Param('userId') userId: number) {
    return this.requestService.getRequestsByUserId(userId);
  }

  // Подписать документ на основе запроса
  @Post('sign/:requestId')
  @ApiOperation({ summary: 'Sign a document from an incoming request' })
  @ApiResponse({ status: 200, description: 'Document signed', type: RequestEntity })
  @UseGuards(JwtAuthGuard)
  async signDocument(@Param('requestId') requestId: number, @Body() body: { userId: number }) {
    return this.requestService.signDocument(requestId, body.userId);
  }
}
