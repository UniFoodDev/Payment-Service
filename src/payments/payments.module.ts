import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentService } from './payments.services';
import { GatesModule } from 'src/gateways/gates.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './payments.entity';

@Module({
  imports: [GatesModule,
    TypeOrmModule.forFeature([PaymentEntity])
  ],
  controllers: [PaymentsController],
  providers: [PaymentService],
})
export class PaymentsModule {}
