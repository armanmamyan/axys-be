import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Gender } from '../enums';
import { IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

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

  @IsEnum(Gender)
  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column()
  placeOfBirth: string;

  // date-of-birth
  @Column({
    type: 'date',
    name: 'dob',
  })
  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return value;
  })
  dob: string;

  @Column({ type: 'jsonb' })
  address: any;

  @Column({ type: 'jsonb' })
  contact: any;

  @OneToOne(() => User, (user) => user.kyc)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column()
  basicPoaKycLevel: boolean;

  @Column({ type: 'jsonb', nullable: true })
  basicPoaDetails: any;

  @Column()
  date: Date;
}
