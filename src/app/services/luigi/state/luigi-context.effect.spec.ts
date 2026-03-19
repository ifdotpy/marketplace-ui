import { initAction } from './init.action';
import { luigiContextUpdate } from './luigi-context-update.action';
import { LuigiContextEffect } from './luigi-context.effect';
import { TestBed } from '@angular/core/testing';
import { NodeContext } from 'models/index';
import { PmLuigiContextService } from 'services/luigi';
import { ILuigiContextTypes } from '@luigi-project/client-support-angular';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockProvider } from 'ng-mocks';
import { Subject, ReplaySubject } from 'rxjs';

function createContext(token: string): NodeContext {
  return {
    token,
    accountId: 'acc-1',
    userId: 'user-1',
    entityType: 'project',
    portalBaseUrl: 'https://portal.example.com',
    portalContext: {} as any,
    serviceProviderConfig: {},
    entityName: 'my-project',
    entityId: 'proj-123',
    entity: {},
    analyticsTrackerConfig: {},
    entityContext: {},
    parentNavigationContexts: [],
  } as unknown as NodeContext;
}

describe('LuigiContextEffect', () => {
  let actions$: ReplaySubject<Action>;
  let effect: LuigiContextEffect;
  let luigiContextSubject: Subject<{ context: NodeContext; contextType: ILuigiContextTypes }>;

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);
    luigiContextSubject = new Subject();

    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        MockProvider(PmLuigiContextService, {
          contextObservable: vi.fn().mockReturnValue(luigiContextSubject),
        }),
      ],
    });

    effect = TestBed.inject(LuigiContextEffect);
  });

  describe('ngrxOnInitEffects', () => {
    it('should return initAction', () => {
      const result = effect.ngrxOnInitEffects();
      expect(result).toEqual(initAction());
    });
  });

  describe('registerForLuigiContextChanges$', () => {
    it('should emit luigiContextUpdate when context has token', () => {
      actions$.next(initAction());

      let emittedAction: Action | undefined;
      effect.registerForLuigiContextChanges$.subscribe((action) => {
        emittedAction = action;
      });

      const contextPayload = createContext('my-token');
      luigiContextSubject.next({
        context: contextPayload,
        contextType: ILuigiContextTypes.INIT,
      });

      expect(emittedAction).toEqual(
        luigiContextUpdate({ luigiContext: contextPayload }),
      );
    });

    it('should filter out context messages without a token', () => {
      actions$.next(initAction());

      let emittedAction: Action | undefined;
      effect.registerForLuigiContextChanges$.subscribe((action) => {
        emittedAction = action;
      });

      const contextWithToken = createContext('my-token');
      const contextWithoutToken = createContext('');
      luigiContextSubject.next({
        context: contextWithToken,
        contextType: ILuigiContextTypes.INIT,
      });
      luigiContextSubject.next({
        context: contextWithoutToken,
        contextType: ILuigiContextTypes.UPDATE,
      });

      expect(emittedAction).toEqual(
        luigiContextUpdate({ luigiContext: contextWithToken }),
      );
    });

    it('should emit the latest context when multiple messages are received', () => {
      actions$.next(initAction());

      let emittedAction: Action | undefined;
      effect.registerForLuigiContextChanges$.subscribe((action) => {
        emittedAction = action;
      });

      const context1 = createContext('token-1');
      const context2 = createContext('token-2');
      luigiContextSubject.next({
        context: context1,
        contextType: ILuigiContextTypes.INIT,
      });
      luigiContextSubject.next({
        context: context2,
        contextType: ILuigiContextTypes.UPDATE,
      });

      expect(emittedAction).toEqual(
        luigiContextUpdate({ luigiContext: context2 }),
      );
    });
  });
});
