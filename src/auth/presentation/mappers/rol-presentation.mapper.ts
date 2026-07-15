import { Injectable } from '@nestjs/common';
import { CreateRolCommand } from '@auth/application/commands/create-rol.command';
import { RolOutput } from '@auth/application/outputs/rol.output';
import { CreateRolRequestDto } from '@auth/presentation/dtos/request/create-rol.request.dto';
import { RolResponseDto } from '@auth/presentation/dtos/response/rol.response.dto';

@Injectable()
export class RolPresentationMapper {
  toCommand(payload: CreateRolRequestDto): CreateRolCommand {
    return {
      nombreRol: payload.nombreRol,
      estado: payload.estado,
    };
  }

  toResponse(output: RolOutput): RolResponseDto {
    return {
      id: output.id,
      nombreRol: output.nombreRol,
      estado: output.estado,
    };
  }
}
