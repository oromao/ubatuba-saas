import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(@Body() dto: CreateUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    return this.usersService.create({ email: dto.email.toLowerCase(), passwordHash: hash });
  }
}
