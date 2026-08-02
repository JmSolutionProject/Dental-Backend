import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { FilesController } from './presentation/files.controller';
import { FilesService } from './infrastructure/files.service';
import { R2Service } from './infrastructure/r2.service';

const jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN ?? 86400);

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn: jwtExpiresIn },
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, R2Service, JwtAuthGuard],
  exports: [FilesService],
})
export class FilesModule {}
