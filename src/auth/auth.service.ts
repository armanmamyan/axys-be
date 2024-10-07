import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcryptjs';
import { validate } from 'class-validator';
import { UsersService } from 'src/users/users.service';
import { SigninDto } from './dto/signin.dto';
import { User } from 'src/users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private template;
  constructor(
    @InjectRepository(Otp) private otpRepository: Repository<Otp>,
    private jwtService: JwtService,
    private userservice: UsersService,
    private mailerService: MailerService
  ) {
  }

  async generateToken(email: string): Promise<string> {
    const jwtPayload = { email };

    return this.jwtService.sign(jwtPayload);
  }

  async validateUserToken(token: string) {
    const decoded = this.jwtService.decode(token) as any;

    // Check if the token is decoded successfully and is an object
    if (!decoded || typeof decoded !== 'object') {
      return { isValid: false };
    }

    // Ensure the 'exp' field exists and is a number
    if (typeof decoded['exp'] !== 'number') {
      return { isValid: false };
    }

    const currentUnixTimestamp = Math.floor(Date.now() / 1000);

    if (currentUnixTimestamp > decoded.exp) {
      await this.userservice.updateData(decoded.email, { token: '' });
    }

    return { isValid: currentUnixTimestamp < decoded.exp };
  }

  async sendOtp(email: string): Promise<{ sent: boolean }> {
    try {
      const existingUser = await this.userservice.findUser(email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP

      // Store OTP with expiration (e.g., 10 minutes)
      const otpEntry = this.otpRepository.create({ email, otp });
      await this.otpRepository.save(otpEntry);

      // Send OTP via email
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your OTP Code',
        template: 'otp',
        context: {
          email,
          otp,
        },
      });

      return { sent: true };
    } catch (error) {
      console.error('Error During OTP Creation', { error });
    }
  }

  async verifyOtp(email: string, otp: string): Promise<{ verified: boolean }> {
    try {
      // Clean up expired OTPs
      const minuteAgo = new Date(Date.now() - 1 * 60 * 1000);
      await this.otpRepository.delete({ createdAt: LessThan(minuteAgo) });

      const otpEntry = await this.otpRepository.findOne({
        where: { email, otp },
      });
      if (!otpEntry) {
        throw new UnauthorizedException('Invalid or expired OTP');
      }

      return { verified: true };
    } catch (error) {
      return { verified: false };
    }
  }

  async login(signinDto: SigninDto): Promise<Partial<User>> {
    const { email, password } = signinDto;
    // Validation Flag
    let isOk = false;

    // Validate DTO against validate function from class-validator
    await validate(signinDto).then((errors) => {
      if (errors.length > 0) {
        this.logger.debug(`${errors}`);
      } else {
        isOk = true;
      }
    });

    if (isOk) {
      // Get user information
      const userDetails = await this.userservice.findOne(email);

      // Check if user exists
      if (userDetails == null) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if the given password match with saved password
      const isValid = compareSync(password, userDetails.password);
      if (isValid) {
        // Generate JWT token
        const accessToken = await this.jwtService.sign({ email });
        const { password, ...userInformation } = userDetails;
        return { ...userInformation, token: accessToken };
      } else {
        // Password or email does not match
        throw new UnauthorizedException('Please check your login credentials');
      }
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }
}
