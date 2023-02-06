import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { errorMonitor } from 'events';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    //Generate Password
    const hash = await argon.hash(dto.password);
    // save the user in db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      delete user.hash;
      //return saves user
      return user;
    } catch (error) {
      // Check if error is a prisma error and check if error code is a duplicate key error code(ie 'P2002'). If not throw error
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Cridentials taken');
        }
      }
      throw error;
    }
  }

  async signin() {
    return { msg: 'Hello, I am signed in' };
  }
}
