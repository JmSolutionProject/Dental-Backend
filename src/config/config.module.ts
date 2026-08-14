import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfiguracionService } from './configuracion.service';
import { ConfigController } from './config.controller';

const jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN ?? 86400);

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn: jwtExpiresIn },
    }),
  ],
  controllers: [ConfigController],
  providers: [ConfiguracionService],
  exports: [ConfiguracionService],
})
export class ConfigModule {}
