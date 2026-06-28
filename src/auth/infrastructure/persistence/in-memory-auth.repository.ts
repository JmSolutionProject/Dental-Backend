import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../../domain/repositories/auth.repository';

@Injectable()
export class InMemoryAuthRepository implements AuthRepository {}
