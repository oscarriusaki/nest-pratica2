import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity()
export class Day {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
        default: new Date()
    })
    date: string;

    @Column('text')
    text: string;

    @Column('text',{
        default: 'di'
    })
    picture: string;

    @Column('text')
    estado: string;
    
}
