import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  ValidationPipe,
} from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { AuthService } from "./auth.service";
import { SigninDto } from "./dto/signin.dto";
import { User } from "src/users/entities/user.entity";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post("/signin")
  signin(
    @Body() signinDto: SigninDto
  ): Promise<Partial<User>> {
    return this.authService.login(signinDto);
  }

  @Post("/send-otp")
  async sendOtp(@Body() body: any) {
    const { email } = body;
    const res = await this.authService.sendOtp(email);
    return res;
  }

  @Post("/verify-otp")
  async verifyOtp(@Body() body: any) {
    const { email, otp } = body;
    const verifyOTP = await this.authService.verifyOtp(email, otp);
    return verifyOTP;
  }
}
