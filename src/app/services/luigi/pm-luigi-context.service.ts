import { ENV, Environment, NodeContext } from '../../models';
import { Injectable, Injector, Signal } from '@angular/core';
import {
  ILuigiContextTypes,
  LuigiContextService,
  LuigiContextServiceImpl,
} from '@luigi-project/client-support-angular';
import deepmerge from 'deepmerge';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IContextMessage {
  contextType: ILuigiContextTypes;
  context: NodeContext;
}

@Injectable({
  providedIn: 'root',
})
export class PmLuigiContextService extends LuigiContextService {
  private luigiContextService: LuigiContextServiceImpl;
  private readonly env: Environment;

  constructor(private injector: Injector) {
    super();
    this.luigiContextService = injector.get(LuigiContextServiceImpl);
    this.env = injector.get(ENV, {});
  }

  /**
   *
   * Can be used to set the context manually, not to be used in iframe based MFEs, the context is always set automatically.
   * This method can be used to set the context in WebComponent based MFEs from the AppComponent.
   *
   * @param context the context to be set
   */
  setContext(context: NodeContext): void {
    this.luigiContextService.addListener(ILuigiContextTypes.UPDATE, context);
  }

  contextSignal(): Signal<IContextMessage | undefined> {
    return this.luigiContextService.contextSignal() as Signal<IContextMessage | undefined>;
  }

  getContext(): NodeContext {
    if (!this.env.luigiContextOverwrite) {
      return this.luigiContextService.getContext() as NodeContext;
    }

    return deepmerge(
      this.luigiContextService.getContext(),
      this.env.luigiContextOverwrite,
    ) as NodeContext;
  }

  getContextAsync(): Promise<NodeContext> {
    if (!this.env.luigiContextOverwrite) {
      return this.luigiContextService.getContextAsync() as Promise<NodeContext>;
    }

    return this.luigiContextService
      .getContextAsync()
      .then((context) =>
        deepmerge(
          context as NodeContext,
          this.env.luigiContextOverwrite as Partial<NodeContext>,
        ),
      );
  }

  contextObservable(): Observable<IContextMessage> {
    if (!this.env.luigiContextOverwrite) {
      return this.luigiContextService.contextObservable() as Observable<IContextMessage>;
    }

    return this.luigiContextService.contextObservable().pipe(
      map((context) => {
        const mergedContext = deepmerge(
          context.context as NodeContext,
          this.env.luigiContextOverwrite as Partial<NodeContext>,
        );
        return { contextType: context.contextType, context: mergedContext };
      }),
    );
  }
}
