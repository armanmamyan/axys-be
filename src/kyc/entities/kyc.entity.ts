import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '@/users/entities/user.entity';

@Entity()
export class KYC {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  applicantId: string;

  @Column({ default: 'basic-poa-kyc-level' })
  currentLevel: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  middleName: string;

  @Column({ type: 'jsonb', nullable: true })
  address: any;

  @OneToOne(() => User, (user) => user.kyc)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column()
  basicPoaKycLevel: boolean;

  @Column()
  additionalPoaKycLevel: boolean;

  @Column({ type: 'jsonb', nullable: true })
  basicPoaDetails: any;

  @Column({ type: 'jsonb', nullable: true })
  additionalPoaDetails: any;

  @Column()
  date: Date;
}
