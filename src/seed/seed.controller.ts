import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedService } from './seed.service'; 
import { ValidRoles } from 'src/auth/interface';
import { Auth } from 'src/auth/decorators';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  // @Auth(ValidRoles.admin) 
  executeSeed(){
    return this.seedService.runSeed()
  }
}
