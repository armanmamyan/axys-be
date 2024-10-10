import { Body, Controller, Post, Req, Res, ValidationPipe } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { User } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-in')
  signin(@Body() signinDto: SigninDto): Promise<Partial<User>> {
    return this.authService.login(signinDto);
  }

  @Post('/send-otp')
  async sendOtp(@Body() body: any) {
    const { email } = body;
    const res = await this.authService.sendOtp(email);
    return res;
  }

  @Post('/forget-password')
  async forgetPassword(@Body() body: any) {
    const { email } = body;
    await this.authService.forgetPasswordOtp(email);
    return {
      message:
        'If your email is registered, you will receive a password reset link.',
    };
  }

  @Post('/update-password')
  async updatePassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password updated successfully.' };
  }

  @Post('/verify-otp')
  async verifyOtp(@Body() body: any) {
    const { email, otp } = body;
    const verifyOTP = await this.authService.verifyOtp(email, otp);
    return verifyOTP;
  }
}
