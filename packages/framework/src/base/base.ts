/**
 * Copyright (c) 2019 zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import type { OutgoingHttpHeaders } from 'http';
import type { Config } from '../config';
import { Container } from '../container';
import type { Database } from '../database';
import type { Application } from '../foundation/application';
import type { Messenger } from '../messenger';
import { Response } from '../response';
import { Redirect } from '../response/redirect';

export abstract class Base {
  /**
   * Application instance getter
   */
  protected get app(): Application {
    return Container.get('app');
  }

  /**
   * Config instance getter
   */
  protected get config(): Config {
    return Container.get('config');
  }

  /**
   * Message instance getter
   */
  protected get messenger(): Messenger {
    return Container.get('messenger');
  }

  /**
   * create response instance
   * @param params response constructor params
   */
  protected response(data?: any, code = 200, header: OutgoingHttpHeaders = {}): Response {
    return new Response(data, code, header);
  }

  /**
   * create redirect instance
   * @param params redirect constructor params
   */
  protected redirect(url?: string, code = 200, header: OutgoingHttpHeaders = {}): Redirect {
    return new Redirect(url, code, header);
  }

  /**
   * create database instance
   * @param name connection name
   */
  protected db(name?: string) {
    return this.app.get<Database>('db').connection(name);
  }

  protected logger(channel?: string) {
    return this.app.get('logger').channel(channel);
  }
}
