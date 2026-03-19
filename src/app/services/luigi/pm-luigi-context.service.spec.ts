import { ENV, Environment, NodeContext } from '../../models';
import {
  IContextMessage,
  PmLuigiContextService,
} from './pm-luigi-context.service';
import { TestBed } from '@angular/core/testing';
import {
  ILuigiContextTypes,
  LuigiContextServiceImpl,
} from '@luigi-project/client-support-angular';
import { mock } from 'vitest-mock-extended';
import { MockProvider } from 'ng-mocks';
import { ReplaySubject } from 'rxjs';

const contextMessage: IContextMessage = {
  contextType: ILuigiContextTypes.UPDATE,
  context: {
    foo: 'bar',
    baz: {
      qux: 'quux',
      plugh: 'xyzzx',
    },
  } as unknown as NodeContext,
};

describe('PmLuigiContextService', () => {
  describe('without ENV override', () => {
    let service: PmLuigiContextService;
    let luigiContextServiceImpl: LuigiContextServiceImpl;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [MockProvider(LuigiContextServiceImpl)],
      });

      service = TestBed.inject(PmLuigiContextService);
      luigiContextServiceImpl = TestBed.inject(LuigiContextServiceImpl);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should call addListener on setContext', () => {
      const context = mock<NodeContext>();
      luigiContextServiceImpl.addListener = vi.fn();

      service.setContext(context);

      expect(luigiContextServiceImpl.addListener).toHaveBeenCalledWith(
        ILuigiContextTypes.UPDATE,
        context,
      );
    });

    it('should return context observable from underlying service unchanged', () => {
      const observable = new ReplaySubject<IContextMessage>();
      luigiContextServiceImpl.contextObservable = vi
        .fn()
        .mockReturnValue(observable);
      observable.next(contextMessage);

      let emitted: IContextMessage | undefined;
      service.contextObservable().subscribe((val) => (emitted = val));

      expect(emitted).toEqual(contextMessage);
    });

    it('should return context promise from underlying service unchanged', async () => {
      luigiContextServiceImpl.getContextAsync = vi
        .fn()
        .mockResolvedValue(contextMessage.context);

      const result = await service.getContextAsync();

      expect(result).toEqual(contextMessage.context);
    });

    it('should return context synchronously from underlying service unchanged', () => {
      luigiContextServiceImpl.getContext = vi
        .fn()
        .mockReturnValue(contextMessage.context);

      const result = service.getContext();

      expect(result).toEqual(contextMessage.context);
    });
  });

  describe('with ENV luigiContextOverwrite', () => {
    let service: PmLuigiContextService;
    let luigiContextServiceImpl: LuigiContextServiceImpl;

    const luigiContextOverwrite: Environment = {
      luigiContextOverwrite: {
        corge: 'grault',
        baz: {
          waldo: 'fred',
          plugh: 'thud',
        },
      },
    };

    const expectedMergedContext = {
      foo: 'bar',
      corge: 'grault',
      baz: {
        qux: 'quux',
        waldo: 'fred',
        plugh: 'thud',
      },
    };

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          MockProvider(LuigiContextServiceImpl),
          { provide: ENV, useValue: luigiContextOverwrite },
        ],
      });

      service = TestBed.inject(PmLuigiContextService);
      luigiContextServiceImpl = TestBed.inject(LuigiContextServiceImpl);
    });

    it('should deep merge context observable with luigiContextOverwrite', () => {
      const observable = new ReplaySubject<IContextMessage>();
      luigiContextServiceImpl.contextObservable = vi
        .fn()
        .mockReturnValue(observable);
      observable.next(contextMessage);

      let emitted: IContextMessage | undefined;
      service.contextObservable().subscribe((val) => (emitted = val));

      expect(emitted).toEqual({
        contextType: contextMessage.contextType,
        context: expectedMergedContext,
      });
    });

    it('should deep merge context promise with luigiContextOverwrite', async () => {
      luigiContextServiceImpl.getContextAsync = vi
        .fn()
        .mockResolvedValue(contextMessage.context);

      const result = await service.getContextAsync();

      expect(result).toEqual(expectedMergedContext);
    });

    it('should deep merge context synchronously with luigiContextOverwrite', () => {
      luigiContextServiceImpl.getContext = vi
        .fn()
        .mockReturnValue(contextMessage.context);

      const result = service.getContext();

      expect(result).toEqual(expectedMergedContext);
    });
  });
});
