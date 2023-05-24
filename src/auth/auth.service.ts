import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interface/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  private logger = new Logger('user')

  constructor(
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,

    private readonly jwtService: JwtService,
  ){}

  async create(createUserDto: CreateUserDto) {

    try {

      const { password, ...userData } = createUserDto;
      
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync())
      });
      await this.userRepository.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({id: user.id})
      };

    } catch (error) {
      this.handleDBEception(error);
    }
    
  }
  async login(loginUserDto: LoginUserDto){
    
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: {email},
      select: {email: true, password: true, id: true}
    })

    if(!user)
      throw new UnauthorizedException('creadentials are not valid(email)')
    if(!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)')
    
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };

    // TODO retornar el jwt 

  }
  private getJwtToken(payload: JwtPayload){
    
    const token = this.jwtService.sign(payload);
    return token;

  }

  findAll() {
    return this.userRepository.find({});
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
  private handleDBEception(error: any): never{
    if(error.code === '23505')
      throw new BadRequestException(error.detail)
    this.logger.error(error)
    throw new InternalServerErrorException('Please check server error')
  }
}
