import { IsString, IsArray, ArrayMinSize, MinLength, IsOptional } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  questions: string[];

  @IsString()
  @MinLength(1)
  coreIdea: string;

  @IsString()
  @MinLength(1)
  mistake: string;

  @IsString()
  @MinLength(1)
  example: string;

  @IsOptional()
  @IsString()
  topicId?: string;
}
