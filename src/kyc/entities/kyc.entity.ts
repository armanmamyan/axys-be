import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from '@/users/entities/user.entity';
  
  @Entity()
  export class KYC {
    @PrimaryGeneratedColumn()
    id: number;
  
    @OneToOne(() => User, (user) => user.kycInformation)
    @JoinColumn()
    user: User;

    @Column()
    userId: string;
  
    @Column()
    basicPoaKycLevel: boolean;

    @Column()
    additionalPoaKycLevel: boolean;


    @Column({ type: 'jsonb', nullable: true })
    basicPoaDetails: any

    @Column({ type: 'jsonb', nullable: true })
    additionalPoaDetails: any
  
    @Column()
    date: Date;
  
}
  