import { IsEnum } from "class-validator";
import { OrderStatus } from "../enums";

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus)
    status: OrderStatus;
  }
  