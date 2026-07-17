import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@shared/infrastructure/persistence/prisma/prisma.module';
import { DashboardController } from './presentation/controllers/dashboard.controller';
import { GetDashboardKpisUseCase } from './application/use-cases/get-dashboard-kpis.use-case';

const jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN ?? 86400);

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn: jwtExpiresIn },
    }),
  ],
  controllers: [DashboardController],
  providers: [GetDashboardKpisUseCase],
})
export class DashboardModule {}
