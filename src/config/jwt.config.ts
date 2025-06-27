import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'Zr8qPf27XmL9AyVoKjN0REcTsdgW1uICBxvYQHpMnBkTJh5SwF4a6UZyXGE3LtvnaoCMk92DJw7pqsVxrYzA1gQKLnT3WeRUf',
  issuer: process.env.JWT_ISSUER || 'dsicode-auth-api',
  audience: process.env.JWT_AUDIENCE || 'dsicode-client',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
}));