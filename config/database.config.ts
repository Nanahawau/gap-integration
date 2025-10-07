import { registerAs } from '@nestjs/config';

type MYSQL = 'mysql'

export default registerAs('databaseConfig', () => ({
  type: 'mysql' as MYSQL,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '') || 3306,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.SYNCRONIZE === 'true',
}));
