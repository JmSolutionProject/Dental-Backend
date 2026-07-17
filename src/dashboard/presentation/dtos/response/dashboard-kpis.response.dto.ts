import { ApiProperty } from '@nestjs/swagger';

class RevenueDto {
  @ApiProperty() today: number;
  @ApiProperty() month: number;
  @ApiProperty() outstanding: number;
}

class ClinicalDto {
  @ApiProperty() appointmentsToday: number;
  @ApiProperty() newPatientsThisMonth: number;
  @ApiProperty() activeTreatments: number;
  @ApiProperty() myAppointmentsToday: number;
}

class TotalsDto {
  @ApiProperty() patients: number;
  @ApiProperty() appointments: number;
}

class TopServiceDto {
  @ApiProperty() name: string;
  @ApiProperty() count: number;
}

class RevenueByMethodDto {
  @ApiProperty() method: string;
  @ApiProperty() total: number;
}

export class DashboardKpisResponseDto {
  @ApiProperty({ type: RevenueDto })
  revenue: RevenueDto;
  @ApiProperty({ type: ClinicalDto })
  clinical: ClinicalDto;
  @ApiProperty({ type: TotalsDto })
  totals: TotalsDto;
  @ApiProperty({ type: [TopServiceDto] })
  topServices: TopServiceDto[];
  @ApiProperty({ type: [RevenueByMethodDto] })
  revenueByMethod: RevenueByMethodDto[];
  @ApiProperty() myCommissions: number;
}
