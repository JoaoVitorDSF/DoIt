import { DataSource } from 'typeorm';
import { Admin } from '../entities/Admin';
import { Client } from '../entities/Client';
import { Todo } from '../entities/Todo';
import { Grupo } from '../entities/Grupo';
import { UsuarioGrupo } from '../entities/UsuarioGrupo';

export const AppDataSource = new DataSource({
  type: process.env.DATABASE_URL ? 'postgres' : 'mysql',
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || 'localhost'),
  port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DATABASE_URL ? undefined : (process.env.DB_USERNAME || 'root'),
  password: process.env.DATABASE_URL ? undefined : (process.env.DB_PASSWORD || 'JVDSF778.'),
  database: process.env.DATABASE_URL ? undefined : (process.env.DB_DATABASE || 'todolist'),
  synchronize: true,
  logging: false,
  entities: [Admin, Client, Todo, Grupo, UsuarioGrupo],
  migrations: [],
  subscribers: [],
});
