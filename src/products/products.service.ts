import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationProductDto } from 'src/common/dtos/pagination-product.dto';
import { validate as isUUID } from 'uuid'
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private logger = new Logger('productRepository');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ){}

  async create(createProductDto: CreateProductDto, user: User) {
    
    try {
      const { images = [], ...productDetails } = createProductDto;
      
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image }) ),
        user,
      });
      await this.productRepository.save(product);
      return { ...product, images };

    } catch (error) {
      this.handleDBException(error);
    }

  }

  async findAll(pagination: PaginationProductDto) {
    // return this.productRepository.find({});
    const { limit = 10, offset = 0 } = pagination;
    const pro = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    })
    return pro.map( product => ({
      ...product,
      images: product.images.map(img => img.url)
    }));
      
  }

  async findOne(term: string) {

    let product: Product;
    if( isUUID(term) ){
      product = await this.productRepository.findOneBy({id: term})
    }else{
      const newPro = this.productRepository.createQueryBuilder('prod');
      product = await newPro.where('UPPER(title) =:title or slug =:slug',{
        title:term.toUpperCase(),
        slug:term.toLowerCase(),
      })
      .leftJoinAndSelect('prod.images','prodImages')
      .getOne()
    }
    
    if( !product )
      throw new NotFoundException('producto not found');

    return product;
  }
  async findOnePlain (term: string){
    const { images = [], ...rest } = await this.findOne(term)
    return {
      ...rest,
      images: images.map( image => image.url )
    }
  }
  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({
        id, 
        ...toUpdate
    });
    if(!product)
      throw new NotFoundException(`product with id ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
    
      if( images ){
        await queryRunner.manager.delete(ProductImage, {product: {id}})
        product.images = images.map(
            image => this.productImageRepository.create({url: image})
          )
      }

      product.user = user;

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release()
      // await this.productRepository.save(product);
      return this.findOnePlain(id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBException(error)
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    console.log(product);
    await this.productRepository.remove(product);
    return product;
  }

  private handleDBException ( error: any ){

    if(error.code === '23505')
      throw new BadRequestException(error.detail)

    this.logger.error(error);
    throw new InternalServerErrorException('Internal server error')

  }
  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query
                  .delete()
                  .where({})
                  .execute();
    } catch (error) {
      this.handleDBException(error)
    }
  }
}
