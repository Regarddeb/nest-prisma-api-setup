export default () => ({
  app: {
    name: process.env.APP_NAME,
    port: parseInt(process.env.APP_PORT ?? '3000', 10),
    url: process.env.APP_URL,
  },
  node: {
    env: process.env.NODE_ENV,
  },
  database: {
    connection: process.env.DB_CONNECTION,
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
});
