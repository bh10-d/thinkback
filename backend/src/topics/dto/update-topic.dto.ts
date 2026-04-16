import { IsString, MinLength } from 'class-validator';

export class UpdateTopicDto {
  @IsString()
  @MinLength(1)
  name: string;
}
