import { Injectable } from '@angular/core';
import { firstValueFrom, from, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { PmLuigiContextService } from 'services/luigi';

interface ServiceProviderConfig {
  matomoContainerId?: string;
}

interface MatomoConfig {
  siteUrl?: string;
  matomoContainerId?: string;
  hashedUserId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsTrackerService {
  constructor(private luigiContextService: PmLuigiContextService) {}

  public async injectScript(useMatomoId = false) {
    const config = await firstValueFrom(
      this.luigiContextService.contextObservable().pipe(
        switchMap((c) => {
          const analyticsTrackerConfig: MatomoConfig =
            c.context?.analyticsTrackerConfig;
          const serviceProviderConfig: ServiceProviderConfig =
            c.context?.serviceProviderConfig;
          const tenantId = c.context?.tenantId || c.context['organizationId'];

          const hashedUserId = from(this.digestMessage(c.context.userId));
          return hashedUserId.pipe(
            map((hashedUserId) => {
              const matomoContainerId = useMatomoId
                ? analyticsTrackerConfig?.matomoContainerId
                : serviceProviderConfig?.matomoContainerId;

              const siteUrl = analyticsTrackerConfig?.siteUrl;

              if (!matomoContainerId || !siteUrl) {
                return null;
              }

              return {
                siteUrl,
                matomoContainerId,
                hashedUserId,
              } as MatomoConfig;
            }),
          );
        }),
        first(),
      ),
    );

    if (config) {
      this.injectScriptElement(config);
    }
  }

  private injectScriptElement(config: MatomoConfig) {
    const script = this.getInitializeScript(config);
    const scriptTag = document.createElement('script');
    scriptTag.text = script;
    document.body.appendChild(scriptTag);
  }

  async digestMessage(message: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    // convert bytes to hex string
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  private getInitializeScript(config: MatomoConfig): string {
    const url = `${config.siteUrl}js/container_${config.matomoContainerId}.js`;

    return `
      var _mtm = window._mtm = window._mtm || [];
      _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
      _mtm.push({uid: '${config.hashedUserId}' });
      (function() {
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.async=true; g.src='${url}'; s.parentNode.insertBefore(g,s);
      })();
  `;
  }
}
