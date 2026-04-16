import { Controller, Get, Param } from '@nestjs/common';
import { BlogsService } from '../blogs/blogs.service';

@Controller('public')
export class PublicController {
  constructor(private blogsService: BlogsService) {}

  @Get('blogs/:slug')
  getBlogBySlug(@Param('slug') slug: string) {
    return this.blogsService.findBySlug(slug);
  }
}
