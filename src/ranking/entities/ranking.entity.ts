import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { CreationOptional } from 'sequelize';

@Table
export class Ranking extends Model<Ranking> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare domain: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare rank: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
   declare checkedAt: Date;
}