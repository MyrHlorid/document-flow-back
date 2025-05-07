// src/auth/jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service'; // Импортируем AuthService для валидации JWT

@Injectable()  // Make sure the guard is marked as injectable
export class JwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log("AUTH HEADER: " + request.headers.authorization)
    const token = request.headers.authorization?.split(' ')[1].trim(); // Extract token from Authorization header
    console.log("TOKEN: ", token)
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify the token and attach the user to the request object
      request.user = await this.authService.verifyToken(token); // Attach the user to the request object
      return true;
    } catch (error) {
      console.log(error)
      throw new UnauthorizedException(error.message);
    }
  }
}