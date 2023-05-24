import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { GetUser } from './decorators/get-user.decorator';
import { RawHeaders } from './decorators';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RolProtected } from './decorators/rol-protected/rol-protected.decorator';
import { ValidRoles } from './interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto){
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    // @Headers() headers: IncomingHttpHeaders
  ){
    
    return {
      ok: true ,
      user,
      userEmail,
      rawHeaders
    }
  }

  // @SetMetadata('roles', ['admin','super-user'])
  @Get('private2')
  @RolProtected( ValidRoles.superUser , ValidRoles.user, ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRotue2(
    @GetUser() user: User
  ){
    
    return {
      ok: true,
      user
    }
  }

  @Get()
  getUser(){
    return this.authService.findAll()
  }
}
