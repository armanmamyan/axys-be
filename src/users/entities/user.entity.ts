import { Matches, MaxLength, MinLength } from 'class-validator'
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  name: string

  @Column({ nullable: true })
  surName: string

  @Column({ nullable: true })
  avatar: string

  @Matches('^[a-zA-Z0-9]*$')
  @MaxLength(15)
  @MinLength(5)
  @Column({ nullable: true })
  username: string

  @Column()
  email: string

  @Column()
  password: string

  @Column({ default: 'Not Passed' })
  kycStatus: string

  @Column({ nullable: true })
  referral: string

  @Column({ nullable: true })
  token: string

  @Column({ nullable: true })
  onBoarding: boolean

  constructor(user?: Partial<User>) {
    Object.assign(this, user)
  }
}
