import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Api funcionado';
  }

  getHealth(): string {
    return 'API funciona';
  }
}
