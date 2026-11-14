import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.category.findMany({ orderBy: { id: 'asc' } });
  }

  create(name: string) {
    return this.prisma.category.create({ data: { name } });
  }
}
