import { Injectable } from '@nestjs/common';

import { DatabaseService } from 'src/modules/database/database.service';

@Injectable()
export class PostsService {
  constructor(private readonly databaseService: DatabaseService) {}
}
