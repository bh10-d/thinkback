import { IsString, IsArray, IsOptional, MinLength } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questions?: string[];

  @IsOptional()
  @IsString()
  @MinLength(1)
  coreIdea?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  mistake?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  example?: string;

  @IsOptional()
  @IsString()
  topicId?: string;
}
