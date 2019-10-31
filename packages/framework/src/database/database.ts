import { Application } from '../foundation/application'
import { IllegalArgumentError } from '../errors/illegal-argument-error'
import { MysqlConnection } from './connection/mysql-connection'
import { Container } from '../container'
import { MysqlConnector } from './connector/mysql-connector'

export class Database {
  /**
   * Application instance
   */
  app: Application = Container.get('app');

  /**
   * The active connection instances.
   */
  connections = new Map();

  /**
   * Create Database instance
   */
  constructor() {
    return new Proxy(this, this.proxy);
  }

  /**
   * instance proxy
   */
  get proxy() {
    return {
      get(target: any, p: string | number | symbol, receiver: any) {
        if (typeof p === 'string') {
          if (Reflect.has(target, p)) {
            return Reflect.get(target, p, receiver)
          }
          return target.connection()[p]
        }
        return Reflect.get(target, p, receiver)
      }
    }
  }

  /**
   * Auto connection 
   * @param name 
   */
  connection(name: string = 'default') {
    if (!this.connections.has(name)) {
      const config = this.getConnectioncConfigure(name)
      this.connections.set(name, this.createConnection(config))
    }
    return this.connections.get(name)
  }

  /**
   * Create Connection instance for each type
   * @param config database connection options
   */
  createConnection(config: any) {
    switch (config.type) {
      case 'mysql':
        const connection = (new MysqlConnector()).connect(config);
        return new MysqlConnection(connection);
    }
    throw new IllegalArgumentError(`Unsupported database type [${config.type}]`);
  }

  /**
   * Get Connection Options 
   * @param name connection name
   */
  getConnectioncConfigure(name: string) {
    return this.app.get('config').get(`database.${name}`)
  }
}