import { registerAs } from '@nestjs/config';

type MYSQL = 'mysql'

export default registerAs('databaseConfig', () => ({
  type: 'mysql' as MYSQL,
  host: process.env.HOST,
  port: parseInt(process.env.MYSQL_PORT || '') || 3306,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  synchronize: process.env.SYNCRONIZE === 'true',
}));
