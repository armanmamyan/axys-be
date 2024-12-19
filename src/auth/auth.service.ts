import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync, hashSync } from 'bcryptjs';
import { validate } from 'class-validator';
import { UsersService } from 'src/users/users.service';
import { SigninDto } from './dto/signin.dto';
import { User } from 'src/users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { LessThan, Repository } from 'typeorm';
import { PasswordReset } from './entities/passwordReset.entity';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { FireblocksService } from '@/third-parties/fireblocks/fireblocks.service';
import { generateOtp } from '@/utils/generateOtp';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(Otp) private otpRepository: Repository<Otp>,
    @InjectRepository(PasswordReset) private passwordResetRepository: Repository<PasswordReset>,
    @InjectRepository(User) private userRepository: Repository<User>,

    private jwtService: JwtService,
    private userservice: UsersService,
    private mailerService: MailerService,
    private configService: ConfigService,
    private fireblocksService: FireblocksService
  ) {}

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

      const otp = generateOtp(); // Generate 6-digit OTP

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
      throw error;
    }
  }

  async forgetPasswordOtp(email: string): Promise<any> {
    try {
      const existingUser = await this.userservice.findUser(email);
      if (!existingUser) {
        throw new NotFoundException('User Not Found');
      }

      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

      const passwordReset = this.passwordResetRepository.create({
        user: existingUser,
        token,
        expiresAt,
      });

      await this.passwordResetRepository.save(passwordReset);

      // Send OTP via email
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Password',
        template: 'reset-password',
        context: {
          customerEmail: email,
          resetLink: `${this.configService.get<string>('CLIENT_URL')}/reset-password?token=${token}`,
        },
      });

      return {
        message: 'If your email is registered, you will receive a password reset link.',
      };
    } catch (error) {
      console.error('Error During Password Reset Creation', { error });
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const passwordReset = await this.passwordResetRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired token.');
    }

    if (passwordReset.expiresAt < new Date()) {
      throw new BadRequestException('Token has expired.');
    }

    // Hash the new password
    const hashedPassword = await hashSync(newPassword, 10);
    passwordReset.user.password = hashedPassword;

    await this.userRepository.save(passwordReset.user);

    // Delete token
    await this.passwordResetRepository.delete(passwordReset.id);
  }

  async updateCurrentPassword(
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = compareSync(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = hashSync(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Password updated successfully.' };
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
      throw error;
    }
  }
  
  async initiateEmailChange(currentEmail: string, newEmail: string): Promise<{ sent: boolean }> {
    const existingUser = await this.userservice.findUser(currentEmail);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const emailExists = await this.userservice.findUser(newEmail);
    if (emailExists) {
      throw new ConflictException('Email already registered');
    }

    const otp = generateOtp();
    const otpEntry = this.otpRepository.create({
      email: newEmail,
      otp,
    });
    await this.otpRepository.save(otpEntry);

    await this.mailerService.sendMail({
      to: newEmail,
      subject: 'Email Change Verification',
      template: 'email-change',
      context: {
        otp,
        newEmail,
      },
    });

    return { sent: true };
  }

  async requestTxVerification(id: string): Promise<{ sent: boolean }> {
    const existingUser = await this.userservice.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const otp = generateOtp();
    const otpEntry = this.otpRepository.create({
      email: existingUser.email,
      otp,
    });
    await this.otpRepository.save(otpEntry);

    await this.mailerService.sendMail({
      to: existingUser.email,
      subject: 'Withdraw Verification',
      template: 'withdraw-verification',
      context: {
        otp,
        newEmail: existingUser.email,
      },
    });

    return { sent: true };
  }
  
  async verifyTxOtp(email: string, otp: string): Promise<{ success: boolean; }> {
    const minuteAgo = new Date(Date.now() - 1 * 60 * 1000);
    await this.otpRepository.delete({ createdAt: LessThan(minuteAgo) });

    const otpEntry = await this.otpRepository.findOne({
      where: { email, otp },
    });

    if (!otpEntry) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.otpRepository.remove(otpEntry);

    return {success: true };
  }

  async verifyEmailChange(
    currentEmail: string,
    newEmail: string,
    otp: string
  ): Promise<{ success: boolean; token: string }> {
    const minuteAgo = new Date(Date.now() - 1 * 60 * 1000);
    await this.otpRepository.delete({ createdAt: LessThan(minuteAgo) });

    const otpEntry = await this.otpRepository.findOne({
      where: {
        email: newEmail,
        otp,
      },
    });

    if (!otpEntry) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.userRepository.update({ email: currentEmail }, { email: newEmail });
    const newToken = await this.generateToken(newEmail);

    await this.otpRepository.remove(otpEntry);

    return {
      success: true,
      token: newToken,
    };
  }

  async login(signinDto: SigninDto): Promise<any> {
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
      const username = userDetails.username;

      // Check if user exists
      if (userDetails == null) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if the given password match with saved password
      const isValid = compareSync(password, userDetails.password);
      if (isValid) {
        // Check if 2FA is enabled
        if (userDetails.emailTwoFactorEnabled && process.env.STAGE !== 'local') {
          const otp = generateOtp();
          const otpEntry = this.otpRepository.create({ email, otp });
          await this.otpRepository.save(otpEntry);

          await this.mailerService.sendMail({
            to: email,
            subject: '2FA Login Verification',
            template: 'login-2fa',
            context: {
              username,
              otp,
            },
          });

          return { requiresTwoFactor: true, email };
        }

        // Generate JWT token
        const accessToken = await this.jwtService.sign({ email });
        const { password, ...userInformation } = userDetails;
        if (userInformation.fireblocksVaultId) {
          const getAssetList = await this.fireblocksService.getVaultAccountDetails(
            userInformation.fireblocksVaultId
          );
          return { ...userInformation, token: accessToken, assets: getAssetList.data.assets };
        }

        return { ...userInformation, token: accessToken };
      } else {
        // Password or email does not match
        throw new UnauthorizedException('Please check your login credentials');
      }
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async verifyLoginOtp(email: string, otp: string): Promise<any> {
    const minuteAgo = new Date(Date.now() - 1 * 60 * 1000);
    await this.otpRepository.delete({ createdAt: LessThan(minuteAgo) });

    const otpEntry = await this.otpRepository.findOne({
      where: { email, otp },
    });

    if (!otpEntry) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const userDetails = await this.userservice.findOne(email);
    await this.otpRepository.remove(otpEntry);

    const accessToken = await this.jwtService.sign({ email });
    const { password, ...userInformation } = userDetails;

    if (userInformation.fireblocksVaultId) {
      const getAssetList = await this.fireblocksService.getVaultAccountDetails(
        userInformation.fireblocksVaultId
      );
      return { ...userInformation, token: accessToken, assets: getAssetList.data.assets };
    }

    return { ...userInformation, token: accessToken };
  }

  async updateEmailTwoFactor(email: string, enabled: boolean): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.emailTwoFactorEnabled = enabled;
    await this.userRepository.save(user);

    return {
      message: `Two factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
    };
  }
}
