import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/infrastructure/guards/roles.guard';
import { Roles } from '@auth/presentation/decorators/roles.decorator';
import { ManageUsersUseCase } from '../../application/use-cases/manage-users.use-case';
import { CreateUserRequestDto } from '../dtos/request/create-user.request.dto';
import { UpdateUserRequestDto } from '../dtos/request/update-user.request.dto';
import { UserResponseDto } from '../dtos/response/user.response.dto';

@ApiTags('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly manageUsers: ManageUsersUseCase) {}

  @Get()
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los usuarios con sus roles' })
  @ApiOkResponse({ type: [UserResponseDto] })
  findAll(@Query('role') role?: string) {
    return this.manageUsers.findAll(role);
  }

  @Get(':id')
  @Roles('ADMIN', 'SECRETARIA', 'MEDICO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiOkResponse({ type: UserResponseDto })
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.manageUsers.findById(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo usuario con roles' })
  @ApiCreatedResponse({ type: UserResponseDto })
  create(@Body() payload: CreateUserRequestDto) {
    return this.manageUsers.create({
      nombreCompleto: payload.nombreCompleto,
      email: payload.email,
      password: payload.password,
      roleIds: payload.roleIds,
    });
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiOkResponse({ type: UserResponseDto })
  update(@Param('id') id: string, @Body() payload: UpdateUserRequestDto) {
    return this.manageUsers.update(Number(id), {
      nombreCompleto: payload.nombreCompleto,
      email: payload.email,
      password: payload.password,
      roleIds: payload.roleIds,
      estado: payload.estado,
    });
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar usuario (soft delete)' })
  @ApiOkResponse({ type: UserResponseDto })
  remove(@Param('id') id: string) {
    return this.manageUsers.remove(Number(id));
  }
}
