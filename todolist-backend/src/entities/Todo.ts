import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Admin } from './Admin';
import { Client } from './Client';
import { Grupo } from './Grupo';

export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum TodoTipo {
  INDIVIDUAL = 'individual',
  COLETIVA = 'coletiva'
}

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  titulo!: string;

  @Column({ nullable: true })
  descricao!: string;

  @Column({
    type: 'enum',
    enum: TodoStatus,
    default: TodoStatus.PENDING
  })
  status!: TodoStatus;

  @Column({
    type: 'enum',
    enum: TodoTipo,
    default: TodoTipo.INDIVIDUAL
  })
  tipo!: TodoTipo;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ nullable: true })
  completedAt!: Date | null;

  @Column({ nullable: true })
  dataInicio!: Date | null;

  @Column({ nullable: true })
  dataExpiracao!: Date | null;

  @Column({ default: false })
  isDeleted!: boolean;

  @Column({ default: false })
  isFlagged!: boolean;

  @ManyToOne(() => Admin, (admin) => admin.todos, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  admin!: Admin;

  @ManyToOne(() => Client, (client) => client.todos, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  client!: Client;

  @ManyToOne(() => Grupo, (grupo) => grupo.tarefas, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  grupo!: Grupo;
}
