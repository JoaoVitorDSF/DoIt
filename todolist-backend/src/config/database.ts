import { DataSource } from 'typeorm';
import { Admin } from '../entities/Admin';
import { Client } from '../entities/Client';
import { Todo } from '../entities/Todo';
import { Grupo } from '../entities/Grupo';
import { UsuarioGrupo } from '../entities/UsuarioGrupo';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'JVDSF778.',
  database: process.env.DB_DATABASE || 'todolist',
  synchronize: true,
  logging: false,
  entities: [Admin, Client, Todo, Grupo, UsuarioGrupo],
  migrations: [],
  subscribers: [],
});
