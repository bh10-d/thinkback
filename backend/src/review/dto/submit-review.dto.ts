import { IsString, IsIn } from 'class-validator';

export type ReviewResult = 'remembered' | 'partially' | 'forgot';

export class SubmitReviewDto {
  @IsString()
  noteId: string;

  @IsIn(['remembered', 'partially', 'forgot'])
  result: ReviewResult;
}
