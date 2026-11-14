import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { PostInputDto, PostQueryDto } from './dto/post.dto';
import { PostService } from './post.service';

type Req_ = { user: { userId: string } };

@ApiTags('post')
@Controller('post')
export class PostController {
  constructor(private readonly posts: PostService) {}

  @Get()
  @ApiOperation({ summary: '글 목록' })
  list(@Query() q: PostQueryDto) {
    return this.posts.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: '글 상세' })
  get(@Param('id', ParseIntPipe) id: number) {
    return this.posts.get(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: '글 작성' })
  create(@Req() req: Req_, @Body() body: PostInputDto) {
    return this.posts.create(req.user.userId, body);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: '글 수정' })
  update(
    @Req() req: Req_,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PostInputDto,
  ) {
    return this.posts.update(req.user.userId, id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: '글 삭제' })
  remove(@Req() req: Req_, @Param('id', ParseIntPipe) id: number) {
    return this.posts.remove(req.user.userId, id);
  }
}
