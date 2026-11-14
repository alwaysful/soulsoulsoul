import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PostInputDto, PostQueryDto } from './dto/post.dto';

const INCLUDE = {
  category: true,
  author: { select: { id: true, email: true, username: true } },
} as const;

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q: PostQueryDto) {
    const where = q.categoryId ? { categoryId: q.categoryId } : {};
    const [items, totalCount] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      this.prisma.post.count({ where }),
    ]);
    return {
      items,
      pagination: {
        page: q.page,
        limit: q.limit,
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / q.limit)),
      },
    };
  }

  async get(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!post) throw new NotFoundException('글을 찾을 수 없습니다.');
    return post;
  }

  create(userId: string, dto: PostInputDto) {
    return this.prisma.post.create({
      data: { ...dto, authorId: userId },
      include: INCLUDE,
    });
  }

  async update(userId: string, id: number, dto: PostInputDto) {
    await this.own(userId, id);
    return this.prisma.post.update({
      where: { id },
      data: { title: dto.title, content: dto.content, categoryId: dto.categoryId ?? null },
      include: INCLUDE,
    });
  }

  async remove(userId: string, id: number): Promise<void> {
    await this.own(userId, id);
    await this.prisma.post.delete({ where: { id } });
  }

  private async own(userId: string, id: number): Promise<void> {
    const post = await this.get(id);
    if (post.authorId && post.authorId !== userId) {
      throw new ForbiddenException('권한이 없습니다.');
    }
  }
}
