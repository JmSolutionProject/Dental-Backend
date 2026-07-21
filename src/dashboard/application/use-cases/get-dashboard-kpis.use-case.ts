import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/persistence/prisma/prisma.service';
import { DashboardKpis } from '../../domain/types/dashboard-kpis.type';

interface KpiQuery {
  userId: number;
  userRoles: string[];
}

@Injectable()
export class GetDashboardKpisUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: KpiQuery): Promise<DashboardKpis> {
    const { userId, userRoles } = query;
    const isMedico = userRoles.some((r) => r.toLowerCase() === 'medico');

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      revenueToday,
      revenueMonth,
      appointmentsToday,
      newPatientsThisMonth,
      myAppointmentsToday,
      totalPatients,
      totalAppointments,
      topServices,
      revenueByMethod,
    ] = await Promise.all([
      this.aggregateRevenue(startOfDay),
      this.aggregateRevenue(startOfMonth),
      this.countAppointmentsSince(startOfDay),
      this.countPatientsSince(startOfMonth),
      isMedico ? this.countMyAppointmentsToday(userId) : Promise.resolve(0),
      this.prisma.paciente.count({ where: { estado: true } }),
      this.prisma.cita.count(),
      this.getTopServices(startOfMonth),
      this.getRevenueByMethod(startOfMonth),
    ]);

    return {
      revenue: {
        today: revenueToday,
        month: revenueMonth,
        outstanding: 0,
      },
      clinical: {
        appointmentsToday,
        newPatientsThisMonth,
        activeTreatments: 0,
        myAppointmentsToday,
      },
      totals: {
        patients: totalPatients,
        appointments: totalAppointments,
      },
      topServices,
      revenueByMethod,
      myCommissions: 0,
    };
  }

  private async aggregateRevenue(since: Date): Promise<number> {
    const result = await this.prisma.pago.aggregate({
      where: { fechaPago: { gte: since }, estado: true },
      _sum: { montoPagado: true },
    });
    return Number(result._sum.montoPagado ?? 0);
  }

  private async countAppointmentsSince(date: Date): Promise<number> {
    return this.prisma.cita.count({
      where: { fechaHoraInicio: { gte: date } },
    });
  }

  private async countPatientsSince(date: Date): Promise<number> {
    return this.prisma.paciente.count({
      where: { fechaRegistro: { gte: date } },
    });
  }

  private async countMyAppointmentsToday(userId: number): Promise<number> {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    return this.prisma.cita.count({
      where: {
        medicoId: userId,
        fechaHoraInicio: { gte: startOfDay, lt: endOfDay },
      },
    });
  }

  private async getTopServices(
    since: Date,
  ): Promise<Array<{ name: string; count: number }>> {
    const results = await this.prisma.citaServicio.groupBy({
      by: ['servicioId'],
      where: { cita: { fechaHoraInicio: { gte: since } } },
      _count: { servicioId: true },
      orderBy: { _count: { servicioId: 'desc' } },
      take: 5,
    });

    if (results.length === 0) return [];

    const services = await this.prisma.servicio.findMany({
      where: { id: { in: results.map((r) => r.servicioId) } },
      select: { id: true, nombreServicio: true },
    });

    const serviceMap = new Map(services.map((s) => [s.id, s.nombreServicio]));

    return results.map((r) => ({
      name: serviceMap.get(r.servicioId) ?? 'Desconocido',
      count: r._count.servicioId,
    }));
  }

  private async getRevenueByMethod(
    since: Date,
  ): Promise<Array<{ method: string; total: number }>> {
    const results = await this.prisma.pago.groupBy({
      by: ['metodoPagoId'],
      where: { fechaPago: { gte: since }, estado: true },
      _sum: { montoPagado: true },
    });

    if (results.length === 0) return [];

    const methods = await this.prisma.metodoPago.findMany({
      where: { id: { in: results.map((r) => r.metodoPagoId) } },
      select: { id: true, nombreMetodo: true },
    });

    const methodMap = new Map(methods.map((m) => [m.id, m.nombreMetodo]));

    return results.map((r) => ({
      method: methodMap.get(r.metodoPagoId) ?? 'Desconocido',
      total: Number(r._sum.montoPagado ?? 0),
    }));
  }
}
