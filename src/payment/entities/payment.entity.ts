import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from '../types/payment.type';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PROCESSING,
  })
  status: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  payment_id: string;

  @Index()
  @Column({ type: 'varchar', nullable: false })
  sender: string;

  @Index()
  @Column({ type: 'varchar', nullable: false })
  receiver: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Index()
  @Column({ type: 'varchar', nullable: false })
  currency: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  convertAmountToLowerDenomination() {
    // Convert from Naira or Dollars to kobo or cents and store as number
    if (typeof this.amount === 'number') {
      this.amount = Math.round(this.amount * 100);
    }
  }
}
