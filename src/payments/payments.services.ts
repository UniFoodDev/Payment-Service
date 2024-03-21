import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Payment } from '../gateways/gate.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PAYMENT_CREATED } from 'src/shards/events';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { PaymentEntity } from './payments.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentService implements OnApplicationBootstrap {
  private payments: Payment[] = [];
  private redis: Redis;
  constructor(
    private eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
  ) {
    this.redis = this.configService.get('redis');
  }

  async onApplicationBootstrap() {
    const payments = await this.redis.get('payments');
    if (payments) {
      this.payments = JSON.parse(payments).map((el) => ({
        ...el,
        date: new Date(el.date),
      }));
    }
  }

  async saveRedis() {
    await this.redis.set('payments', JSON.stringify(this.payments));
  }

  isExists(payment: Payment) {
    return this.payments.some(
      (el) => el.transaction_id == payment.transaction_id,
    );
  }
  async addPayments(payments: Payment[]) {
    const newPayments = payments.filter((payment) => !this.isExists(payment));

    if (newPayments.length == 0) return;

    this.eventEmitter.emit(PAYMENT_CREATED, newPayments);

    await this.paymentRepository.save(newPayments.map(payment => {
      const entity = new PaymentEntity();
      entity.transaction_id = payment.transaction_id;
      entity.amount = payment.amount;
      entity.date = payment.date;
      entity.content = payment.content;
      entity.account_receiver = payment.account_receiver;
      entity.gate = payment.gate;
      return entity;
    }));

    this.payments.push(...newPayments);

    this.payments = this.payments
      .slice(-500)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    this.saveRedis();
  }

  getPayments(): Payment[] {
    return this.payments;
  }
}
