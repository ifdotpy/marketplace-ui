import { NodeContext } from 'models/node-context';

export interface LuigiFeature {
  context: NodeContext | undefined;
}

export const luigiFeatureKey = 'luigi';
