import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Grupo } from './Grupo';
import { Client } from './Client';
import { Admin } from './Admin';

@Entity()
export class UsuarioGrupo {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Grupo, (grupo) => grupo.membros, { onDelete: 'CASCADE' })
  @JoinColumn()
  grupo!: Grupo;

  @ManyToOne(() => Client, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  cliente!: Client;

  @ManyToOne(() => Admin, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  admin!: Admin;

  @CreateDateColumn()
  createdAt!: Date;
}
