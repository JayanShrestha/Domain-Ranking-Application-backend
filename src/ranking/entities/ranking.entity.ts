import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class Ranking extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  domain: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  rank: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  checkedAt: Date;
}