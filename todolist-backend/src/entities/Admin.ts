import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Todo } from './Todo';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  sobrenome!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  senha!: string;

  @Column({ nullable: true })
  celular!: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'text', nullable: true })
  profileImage!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'light' })
  theme!: string;

  @Column({ default: false })
  isBlocked!: boolean;

  @Column({ nullable: true })
  lastLoginAt!: Date | null;

  @OneToMany(() => Todo, (todo) => todo.admin)
  todos!: Todo[];
}
