import { registerAs } from '@nestjs/config';

type MYSQL = 'mysql'

export default registerAs('databaseConfig', () => ({
  type: 'mysql' as MYSQL,
  host: process.env.HOST,
  port: parseInt(process.env.PORT || '') || 3000,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  entities: [],
  synchronize: process.env.SYNCRONIZE === 'true',
}));
