export default {
  default: {
    type: 'mysql',
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    port: 3306
  },
  session: {
    type: 'redis',
    host: '127.0.0.1',
    port: 6379
  }
};
