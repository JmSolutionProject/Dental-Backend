import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@shared/infrastructure/persistence/prisma/prisma.module';
import { TreatmentPlansController } from './presentation/controllers/treatment-plans.controller';
import { ManagePlansUseCase } from './application/use-cases/manage-plans.use-case';

const jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN ?? 86400);

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn: jwtExpiresIn },
    }),
  ],
  controllers: [TreatmentPlansController],
  providers: [ManagePlansUseCase],
})
export class TreatmentPlansModule {}
