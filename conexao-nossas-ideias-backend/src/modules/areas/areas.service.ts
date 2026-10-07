import { Injectable } from '@nestjs/common';
import { AreasRepository } from 'src/shared/database/repositories/areas.repository';

@Injectable()
export class AreasService {
  constructor(private readonly areasRepo: AreasRepository) {}

  findAll() {
    return this.areasRepo.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });
  }
}
