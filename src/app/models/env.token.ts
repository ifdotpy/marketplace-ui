import { NodeContext } from './node-context';
import { InjectionToken } from '@angular/core';

export const ENV = new InjectionToken<Environment>('ENV');

export interface Environment extends Record<string, any> {
  luigiContextOverwrite?: Partial<NodeContext>;
}
