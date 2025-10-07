import { registerAs } from '@nestjs/config';

export default registerAs('defaultConfig', () => ({
  port: parseInt(process.env.PORT || '') || 3000,
  authenticationKey: process.env.AUTHENTICATION_KEY || ''
}));
