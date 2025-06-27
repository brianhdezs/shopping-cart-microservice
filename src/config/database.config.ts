import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const port = process.env.DB_PORT;
  const parsedPort = port ? parseInt(port, 10) : 5432;
  
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parsedPort,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'shopping_cartdb',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  };
});