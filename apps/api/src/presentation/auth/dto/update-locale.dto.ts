import { IsIn } from 'class-validator';

const SUPPORTED_LOCALES = ['en', 'es', 'pt-BR'] as const;

export class UpdateLocaleDto {
  @IsIn(SUPPORTED_LOCALES)
  locale!: 'en' | 'es' | 'pt-BR';
}
