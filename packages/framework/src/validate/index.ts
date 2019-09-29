/**
 * Copyright (c) 2019 Chan Zewail <chanzewail@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import { Message } from '../foundation/support/message'
import * as validators from './validators'
import { Container } from '../container'
import { Application } from '../foundation/application'

export interface IRule {
  field: string,
  handler: (...args: any[]) => any,
  args: any[],
  options: { [key: string]: any },
}

export interface IRuleIndependences {
  [key: string]: [keyof typeof validators, any[]?, { [key2: string]: any }?][]
}

export class Validate {
  /**
   * application
   */
  app: Application = Container.get('app');

  /**
   * validate data
   */
  data: { [key:string]: any };

  /**
   * validate rules
   */
  rules: IRule[];

  /**
   * validate message
   */
  message: Message = new Message();

  /**
   * Create Validate instance
   * @param data
   * @param rules
   */
  constructor(data: { [key: string]: any }, validator?: any) {
    /**
     * @type {Object} data validate data
     */
    this.data = this.parseData(data);

    /**
     * @type rules validator rules
     */
    this.rules = this.parseValidator(validator);
  }

  /**
   * parse different type rulse
   * @param rules rules
   */
  parseValidator(validator?: any) {
    if (!validator) return []
    // if object type
    if (typeof validator === 'object') {
      // if @Validator rules
      if (Reflect.getMetadata('type', validator) === 'validator') {
        return Reflect.getMetadata('validator', validator) || [];
      }
      // independence object rules
      return this.parseIndependenceRules(validator);
    }
    // if string type
    if (typeof validator === 'string') {
      const containerKey = `validator.${validator}`;
      if (!this.app.has(containerKey)) return [];
      return Reflect.getMetadata('validator', this.app.get(`validator.${validator}`)) || [];
    }
    return [];
  }

  /**
   * parse independence object rules
   * @param rules rules
   */
  parseIndependenceRules(rules: { [key: string]: any[] }) {
    const _rules: IRuleIndependences = rules
    const res = [];
    const fields = Object.keys(_rules);
    for (const field of fields) {
      const fieldRules = _rules[field] || [];
      for (const rule of fieldRules) {
        const handler = validators[rule[0]]
        if (handler) {
          res.push({
            field,
            handler,
            args: rule[1] || [],
            options: rule[2] || {},
          });
        }
      }
    }
    return res;
  }

  /**
   * parse validate data
   * @param data data
   */
  parseData(data = {}) {
    return data;
  }

  /**
   * replace special message fields
   * @param value field value
   * @param rule stuct rule
   */
  replaceSpecialMessageFields(value: any, rule: IRule) {
    const {
      field,
      args,
      options,
    } = rule;
    let msg = options.message || 'validate $field failed with value: $value';
    for (const [index, val] of args.entries()) {
      msg = msg.replace(`$${index + 1}`, val);
    }
    return msg.replace('$field', field).replace('$value', value);
  }

  /**
   * validate a field
   * @param rule rule
   */
  validateField(rule: IRule) {
    if (!rule) return false;
    const {
      field, args, handler,
    } = rule;
    const property = this.data[field];
    try {
      const validated = handler(property, ...args);
      if (validated) return true;
      this.message.add(field, this.replaceSpecialMessageFields(property, rule));
    } catch (err) {
      this.message.add(field, err.message);
    }
    return false;
  }

  /**
   * check if validate data is passed
   */
  get passes() {
    return this.check();
  }

  /**
   * check if validate data is failed
   */
  get fails() {
    return !this.passes;
  }

  /**
   * check the rules
   */
  check() {
    for (const rule of this.rules) {
      this.validateField(rule);
    }
    return this.message.isEmpty();
  }

  /**
   * get validate errors
   */
  get errors() {
    return this.message.messages;
  }
}
