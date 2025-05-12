import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email } });

    if (existing) {
      throw new HttpException(
        { message: 'Пользователь с таким email уже существует' },
        400,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    return this.userRepository.save(newUser);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  // Генерация access токена (короткоживущий)
  async generateAccessToken(user: User): Promise<string> {
    return this.jwtService.sign(
      { userId: user.id, email: user.email },
      { expiresIn: '15m' }, // Access token будет действителен 15 минут
    );
  }

  // Генерация refresh токена (длинноживущий)
  async generateRefreshToken(user: User): Promise<string> {
    return this.jwtService.sign(
      { userId: user.id, email: user.email },
      { expiresIn: '7d' }, // Refresh token будет действителен 7 дней
    );
  }

  // Валидация refresh токена и генерация новой пары токенов
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({ where: { id: payload.userId } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      // Можно добавить проверку на соответствие refresh токена, если сохраняете его в БД
      const newAccessToken = await this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyToken(token: string): Promise<User> {
    try {
      console.log("TOKEN", token)
      const decoded = this.jwtService.verify(token); // Verify the token
      const user = await this.userRepository.findOne({ where: { id: decoded.userId } });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
