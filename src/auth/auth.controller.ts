import { Body, Controller, Post, Req, Res, ValidationPipe } from '@nestjs/common';
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

  @Post('/verify-login')
  async verifyLogin(@Body() body: { email: string; otp: string }) {
    return await this.authService.verifyLoginOtp(body.email, body.otp);
  }

  @Post('/update-two-factor')
  async updateTwoFactor(@Body() body: { email: string; enabled: boolean }) {
    return await this.authService.updateEmailTwoFactor(body.email, body.enabled);
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
    return await this.authService.forgetPasswordOtp(email);
  }

  @Post('/update-password')
  async updatePassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password updated successfully.' };
  }

  @Post('/update-current-password')
  async updateCurrentPassword(
    @Body() body: { email: string; currentPassword: string; newPassword: string }
  ) {
    return await this.authService.updateCurrentPassword(
      body.email,
      body.currentPassword,
      body.newPassword
    );
  }

  @Post('/request-email-change')
  async requestEmailChange(@Body() body: { currentEmail: string; newEmail: string }) {
    return await this.authService.initiateEmailChange(body.currentEmail, body.newEmail);
  }

  @Post('/verify-email-change')
  async verifyEmailChange(@Body() body: { currentEmail: string; newEmail: string; otp: string }) {
    return await this.authService.verifyEmailChange(body.currentEmail, body.newEmail, body.otp);
  }

  @Post('/verify-otp')
  async verifyOtp(@Body() body: any) {
    const { email, otp } = body;
    const verifyOTP = await this.authService.verifyOtp(email, otp);
    return verifyOTP;
  }
}
