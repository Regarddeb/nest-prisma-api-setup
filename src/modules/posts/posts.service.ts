import { Injectable } from '@nestjs/common';

import { DatabaseService } from 'src/modules/database/database.service';
import { Post, Prisma } from 'generated/prisma';

@Injectable()
export class PostsService {
  constructor(private readonly databaseService: DatabaseService) {}
}
