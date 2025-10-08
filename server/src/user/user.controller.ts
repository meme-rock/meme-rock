import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('loading/:_id')
  async loading(@Param('_id') _id: string, @Body() user: CreateUserDto) {
    try {
      return await this.userService.loading(_id, user);
    } catch (error) {
      throw error;
    }
  }
}
