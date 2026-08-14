import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';

export interface RecordatorioConfig {
  enabled: boolean;
  horasAntes: number;
  plantilla: string;
}

const DEFAULT_PLANTILLA =
  'Hola {{nombre}}, te recordamos tu cita del {{fecha}} a las {{hora}} con {{doctor}}. Clínica Dental Omaya.';

const KEYS = {
  enabled: 'recordatorio_enabled',
  horasAntes: 'recordatorio_horas_antes',
  plantilla: 'recordatorio_plantilla',
} as const;

@Injectable()
export class ConfiguracionService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecordatorio(): Promise<RecordatorioConfig> {
    const [enabled, horasAntes, plantilla] = await Promise.all([
      this.prisma.configuracion.findUnique({
        where: { clave: KEYS.enabled },
      }),
      this.prisma.configuracion.findUnique({
        where: { clave: KEYS.horasAntes },
      }),
      this.prisma.configuracion.findUnique({
        where: { clave: KEYS.plantilla },
      }),
    ]);

    return {
      enabled: enabled?.valor !== 'false',
      horasAntes: Number(horasAntes?.valor ?? 24) || 24,
      plantilla: plantilla?.valor || DEFAULT_PLANTILLA,
    };
  }

  async updateRecordatorio(
    config: Partial<RecordatorioConfig>,
  ): Promise<RecordatorioConfig> {
    if (config.enabled !== undefined) {
      await this.prisma.configuracion.upsert({
        where: { clave: KEYS.enabled },
        update: { valor: String(config.enabled) },
        create: { clave: KEYS.enabled, valor: String(config.enabled) },
      });
    }

    if (config.horasAntes !== undefined) {
      await this.prisma.configuracion.upsert({
        where: { clave: KEYS.horasAntes },
        update: { valor: String(config.horasAntes) },
        create: { clave: KEYS.horasAntes, valor: String(config.horasAntes) },
      });
    }

    if (config.plantilla !== undefined) {
      await this.prisma.configuracion.upsert({
        where: { clave: KEYS.plantilla },
        update: { valor: config.plantilla },
        create: { clave: KEYS.plantilla, valor: config.plantilla },
      });
    }

    return this.getRecordatorio();
  }
}
