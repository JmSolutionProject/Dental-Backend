import { Injectable } from '@nestjs/common';
import { AgendaRepository } from '../../domain/repositories/agenda.repository';

@Injectable()
export class InMemoryAgendaRepository implements AgendaRepository {}
