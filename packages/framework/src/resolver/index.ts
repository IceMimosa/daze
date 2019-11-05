// import { Container } from '../container';
import { Application } from '../foundation/application';
import { Loader } from '../loader';
import { ControllerManager } from '../controller';
import { ModelManager } from '../model';


export class Resolver {
  
  /**
   * application instance
   */
  app: Application ;

  loader: Loader;

  constructor(loader: Loader, app: Application) {
    this.app = app;

    this.loader = loader;
  }

  resolveAllModules() {
    this.resolveMiddlewares();
    this.resolveServices();
    this.resolveResources();
    this.resolveValidators();
    this.resolveComponents();
    this.resolveModels();
    this.resolveControllers();
  }

  resolveMiddlewares() {
    const { middlewares } = this.loader;
    for (const Middleware of middlewares) {
      const name = Reflect.getMetadata('name', Middleware);
      this.app.bind(`middleware.${name}`, Middleware);
    }
    return this;
  }

  resolveControllers() {
    const { controllers } = this.loader;
    for (const Controller of controllers) {
      this.app.multiton(Controller, Controller);
      this.app.get<ControllerManager>('controller-manager').register(Controller);
    }
    return this;
  }

  resolveModels() {
    const { models } = this.loader;
    for (const Model of models) {
      this.app.singleton(Model, Model);
      this.app.get<ModelManager>('model-manager').register(Model);
    }
  }

  resolveServices() {
    const { services } = this.loader;
    for (const Service of services) {
      const name = Reflect.getMetadata('name', Service);
      this.app.singleton(Service, Service);
      if (name) {
        this.app.multiton(`service.${name}`, (...args: any[]) => {
          return this.app.get(Service, args);
        }, true);
      }
    }
  }

  resolveValidators() {
    const { validators } = this.loader;
    for (const Validator of validators) {
      const name = Reflect.getMetadata('name', Validator);
      if (name) this.app.bind(`validator.${name}`, Validator);
    }
  }

  resolveResources() {
    const { resources } = this.loader;
    for (const Resource of resources) {
      const name = Reflect.getMetadata('name', Resource);
      this.app.singleton(Resource, Resource);
      if (name) {
        this.app.multiton(`resource.${name}`, (...args: any[]) => {
          return this.app.get(Resource, args);
        }, true);
      }
    }
  }

  resolveComponents() {
    const { components } = this.loader;
    for (const Component of components) {
      const name = Reflect.getMetadata('name', Component);
      if (name) this.app.bind(`component.${name}`, Component);
    }
  }
}