import { NodeContext } from '../models';
import { IContextMessage, PmLuigiContextService } from './luigi';
import { AnalyticsTrackerService } from './analytics-tracker.service';
import { TestBed } from '@angular/core/testing';
import { mock } from 'vitest-mock-extended';
import { MockProvider } from 'ng-mocks';
import { BehaviorSubject, Observable } from 'rxjs';
import { ILuigiContextTypes } from '@luigi-project/client-support-angular';

describe('AnalyticsTrackerService', () => {
  let service: AnalyticsTrackerService;
  let ctxSrv: PmLuigiContextService;

  const makeContextMessage = (contextOverrides: Record<string, any> = {}): IContextMessage => ({
    contextType: ILuigiContextTypes.UPDATE,
    context: mock<NodeContext>({
      userId: 'user-123',
      tenantId: 'tenant-1',
      ...contextOverrides,
    }),
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnalyticsTrackerService,
        MockProvider(PmLuigiContextService, {
          contextObservable(): Observable<IContextMessage> {
            return new BehaviorSubject<IContextMessage>(makeContextMessage());
          },
        }),
      ],
    });

    service = TestBed.inject(AnalyticsTrackerService);
    ctxSrv = TestBed.inject(PmLuigiContextService);
  });

  afterEach(() => {
    document.body.querySelectorAll('script').forEach((s) => s.remove());
  });

  describe('digestMessage', () => {
    it('should return a hex string of length 64 for a given message', async () => {
      const result = await service.digestMessage('hello');
      expect(result).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should return consistent hash for the same input', async () => {
      const result1 = await service.digestMessage('test-user');
      const result2 = await service.digestMessage('test-user');
      expect(result1).toBe(result2);
    });

    it('should return different hashes for different inputs', async () => {
      const result1 = await service.digestMessage('user-a');
      const result2 = await service.digestMessage('user-b');
      expect(result1).not.toBe(result2);
    });
  });

  describe('injectScript', () => {
    beforeEach(() => {
      document.body.querySelectorAll('script').forEach((s) => s.remove());
    });

    it('should not inject a script when analyticsTrackerConfig is missing', async () => {
      ctxSrv.contextObservable = () =>
        new BehaviorSubject<IContextMessage>(
          makeContextMessage({ analyticsTrackerConfig: undefined }),
        );
      await service.injectScript(true);
      expect(document.body.querySelector('script')).toBeNull();
    });

    it('should not inject a script when matomoContainerId is missing from serviceProviderConfig', async () => {
      ctxSrv.contextObservable = () =>
        new BehaviorSubject<IContextMessage>(
          makeContextMessage({
            serviceProviderConfig: { matomoContainerId: undefined },
            analyticsTrackerConfig: { siteUrl: 'https://matomo.example.com/' },
          }),
        );
      await service.injectScript(false);
      expect(document.body.querySelector('script')).toBeNull();
    });

    it('should inject a script when full config is provided (useMatomoId=false)', async () => {
      ctxSrv.contextObservable = () =>
        new BehaviorSubject<IContextMessage>(
          makeContextMessage({
            tenantId: 'tenantId',
            analyticsTrackerConfig: {
              siteUrl: 'https://matomo.example.com/',
              matomoContainerId: 'analytics-container-id',
            },
            serviceProviderConfig: { matomoContainerId: 'svc-container-id' },
            userId: 'user-id',
          }),
        );

      await service.injectScript(false);

      const script = document.body.querySelector<HTMLScriptElement>('script:not([src])');
      expect(script).not.toBeNull();
      expect(script!.text).toContain('svc-container-id');
      expect(script!.text).toContain('https://matomo.example.com/');
    });

    it('should use analyticsTrackerConfig matomoContainerId when useMatomoId=true', async () => {
      ctxSrv.contextObservable = () =>
        new BehaviorSubject<IContextMessage>(
          makeContextMessage({
            analyticsTrackerConfig: {
              siteUrl: 'https://matomo.example.com/',
              matomoContainerId: 'analytics-container-id',
            },
            serviceProviderConfig: { matomoContainerId: 'svc-container-id' },
            userId: 'user-id',
          }),
        );

      await service.injectScript(true);

      const script = document.body.querySelector<HTMLScriptElement>('script:not([src])');
      expect(script).not.toBeNull();
      expect(script!.text).toContain('analytics-container-id');
    });
  });
});
