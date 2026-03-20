export enum InfoLabels {
  Category = 'Category',
  Provider = 'Provider',
}

export type InfoLabel = InfoLabels | string;

export interface AdditionalInfo {
  label: InfoLabel;
  value: string;
}

export interface InfoLabelFilter {
  label: InfoLabel;
  values: string[];
}
