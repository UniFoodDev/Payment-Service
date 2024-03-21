import { GateType } from 'src/gateways/gate.interface';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transaction_id: string;

  @Column()
  amount: number;

  @Column()
  content: string;

  @Column()
  date: Date;

  @Column()
  account_receiver: string;

  @Column()
  gate: GateType;
}
