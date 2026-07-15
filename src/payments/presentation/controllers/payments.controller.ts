import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { CreatePaymentRequestDto } from '../dtos/request/create-payment.request.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly createPaymentUseCase: CreatePaymentUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un pago' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  create(@Body() payload: CreatePaymentRequestDto) {
    return this.createPaymentUseCase.execute(payload);
  }
}
