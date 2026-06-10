import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Client } from './Client';
import { Admin } from './Admin';
import { Todo } from './Todo';

@Entity()
export class Grupo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column({ nullable: true })
  descricao!: string;

  @ManyToOne(() => Client, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  administradorCliente!: Client;

  @ManyToOne(() => Admin, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  administradorAdmin!: Admin;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Todo, (todo) => todo.grupo)
  tarefas!: Todo[];

  @OneToMany('UsuarioGrupo', 'grupo')
  membros!: any[];
}
