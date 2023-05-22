import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDayDto } from './dto/create-day.dto';
import { UpdateDayDto } from './dto/update-day.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Day } from './entities/day.entity';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid'

@Injectable()
export class DayService {

  private logger = new Logger();

  constructor(
    @InjectRepository(Day)
    private readonly dayRepository: Repository<Day>,
  ){}
  
  async create(data: CreateDayDto) {
    
    try {
      console.log(data,'este');

      const day = this.dayRepository.create(data);
      await this.dayRepository.save(day);
      return day;
      
    } catch (error) {
      this.handleDBException(error);
    }

  }

  findAll() {
    return this.dayRepository.find({});
  }

  async findOne(term: string) {
      let day:Day;
    if(isUUID(term)){
      day = await this.dayRepository.findOneBy({ id: term});
      if(!day)
        throw new NotFoundException
      day = await this.dayRepository.findOneBy({ id: term});
    }else{
      const search = await this.dayRepository.createQueryBuilder('day');
      day = await search.where('text ILIKE :text',{
        text: `%${term}%`
      }).getOne();
      if(!day)
        throw new NotFoundException
    }
    
    return day;
  }

  async update(id: string, updateDayDto: UpdateDayDto) {
    const dayRepo = await this.dayRepository.preload({
      id,
      ...updateDayDto
    });
    if(!dayRepo)
      throw new NotFoundException('Day not found')
    await this.dayRepository.save(dayRepo)
    return dayRepo;
  }

  async remove(id: string) {
    const day = await this.findOne(id);
    const dayRepo = await this.dayRepository.createQueryBuilder();
    const newDay = await dayRepo
          .update(Day)
          .set({estado: 'false'})
          .where('id =:id',{id})
          .execute();
    
    return newDay;
  }
  private handleDBException(error: any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail)

    this.logger.error(error)
    throw new InternalServerErrorException('Internal server error')
  }
}
