import { Injectable } from '@angular/core';
import {
  addCoreSearchParams,
  addCustomMessageListener,
  addNodeParams,
  getActiveFeatureToggles,
  getCoreSearchParams,
  getNodeParams,
  linkManager,
  sendCustomMessage,
  storageManager,
  uxManager,
} from '@luigi-project/client/luigi-client';

@Injectable({
  providedIn: 'root',
})
export class LuigiClient {
  public linkManager = linkManager;
  public uxManager = uxManager;
  public sendCustomMessage = sendCustomMessage;
  public addCustomMessageListener = addCustomMessageListener;
  public storageManager = storageManager;
  public getActiveFeatureToggles = getActiveFeatureToggles;

  public getNodeParams = getNodeParams;
  public addNodeParams = addNodeParams;

  public getCoreSearchParams = getCoreSearchParams;
  public addCoreSearchParams = addCoreSearchParams;

  public clearFrameCache(): void {
    this.sendCustomMessage({
      id: 'general.frame-entity-changed',
    });
  }
}
