import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Todo } from './Todo';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  sobrenome!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  telefone!: string;

  @Column()
  senha!: string;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationToken!: string | null;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'text', nullable: true })
  profileImage!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'light' })
  theme!: string;

  @Column({ default: false })
  isBlocked!: boolean;

  @Column({ nullable: true, type: 'datetime' })
  lastLoginAt!: Date | null;

  @OneToMany(() => Todo, (todo) => todo.client)
  todos!: Todo[];
}
