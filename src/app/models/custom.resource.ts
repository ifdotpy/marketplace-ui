import { ObjectMeta } from 'kubernetes-types/meta/v1';

export interface CustomResource extends ObjectMeta {
  metadata: ObjectMeta;
  spec: Record<string, unknown>;
  status: Record<string, unknown>;
}
