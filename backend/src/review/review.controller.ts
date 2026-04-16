import { Controller, Post, Body } from '@nestjs/common';
import { ReviewService } from './review.service';
import { SubmitReviewDto } from './dto/submit-review.dto';

@Controller('review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  submit(@Body() dto: SubmitReviewDto) {
    return this.reviewService.submit(dto);
  }
}
