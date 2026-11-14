import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

// ConfigService.getOrThrow()로 읽는 환경변수는 모두 여기에 선언한다.
// 기본값이 있는 항목은 미설정 시 기본값이 적용되고, 나머지는 기동 시 즉시 실패한다.
export class EnvironmentVariables {
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  // 예: 1h, 30m, 7d
  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN: string = '1h';

  @IsInt()
  @Min(4)
  @Max(31)
  BCRYPT_SALT_ROUNDS: number = 10;

  @IsUrl({ require_tld: false })
  PUSH_SERVER_URL!: string;

  // 프론트엔드 Origin (CORS 허용)
  @IsUrl({ require_tld: false })
  CORS_ORIGIN: string = 'http://localhost:5173';

  // 화면 분석: 로컬 Ollama (Qwen3-VL 4B)
  @IsUrl({ require_tld: false })
  OLLAMA_URL: string = 'http://localhost:11434';

  @IsString()
  @IsNotEmpty()
  OLLAMA_MODEL: string = 'qwen3-vl:4b';
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });

  const errors = validateSync(validated);
  if (errors.length > 0) {
    const details = errors
      .map(
        ({ property, constraints }) =>
          `- ${property}: ${Object.values(constraints ?? {}).join(', ')}`,
      )
      .join('\n');
    throw new Error(`환경변수 검증 실패:\n${details}`);
  }

  return validated;
}
