import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId')
  getProfile(@Param('userId') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put(':userId')
  updateProfile(@Param('userId') userId: string, @Body() body: Record<string, any>) {
    return this.usersService.updateProfile(userId, body);
  }

  @Get(':userId/dashboard')
  getDashboard(@Param('userId') userId: string) {
    return this.usersService.getDashboard(userId);
  }
}
