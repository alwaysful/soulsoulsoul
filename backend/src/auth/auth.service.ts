import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { TokenResponseDto } from './dto/token-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { EnvironmentVariables } from '../config/env.validation';
import { ConfigService } from '@nestjs/config';

function toInt(value: unknown, name: string): number {
  const n = Number(value);
  if (!Number.isInteger(n)) {
    throw new Error(`환경변수 ${name} 는 정수여야 합니다: ${String(value)}`);
  }
  return n;
}

// 유저가 없을 때도 bcrypt 비교를 수행해 응답 시간 차이를 줄이기 위한 더미 해시
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10);

function isUniqueViolation(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002'
  );
}

@Injectable()
export class AuthService {
  private readonly saltRounds: number;

  constructor(
    private authRepository: AuthRepository,
    private jwt: JwtService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.saltRounds = toInt(
      this.config.get('BCRYPT_SALT_ROUNDS', { infer: true }),
      'BCRYPT_SALT_ROUNDS',
    );
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  // 로컬 회원가입
  async signup(
    email: string,
    password: string,
    username?: string,
  ): Promise<UserResponseDto> {
    const hashed = await bcrypt.hash(password, this.saltRounds);

    try {
      const user = await this.authRepository.create({
        email: this.normalizeEmail(email),
        username,
        password: hashed,
        provider: 'local',
      });
      return UserResponseDto.from(user);
    } catch (e) {
      if (isUniqueViolation(e)) {
        throw new ConflictException('이미 사용 중인 이메일입니다.');
      }
      throw e;
    }
  }

  // 로컬 로그인
  async login(email: string, password: string): Promise<TokenResponseDto> {
    const user = await this.authRepository.findByEmail(
      this.normalizeEmail(email),
    );

    // 유저 없음 / OAuth 계정(비밀번호 없음) / 비밀번호 불일치를 구분하지 않는다
    const hashToCompare = user?.password ?? DUMMY_HASH;
    const isMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !user.password || !isMatch) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    return this.generateJwt(user);
  }

  // 우리 서버의 JWT 발급
  private generateJwt(user: User): TokenResponseDto {
    return {
      accessToken: this.jwt.sign({
        userId: user.id,
        email: user.email,
      }),
    };
  }
}
