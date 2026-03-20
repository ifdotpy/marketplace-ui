export interface CardFilter {
  category?: string;
  providers: Filter[];
}

export interface Filter {
  label: string;
  id: string;
}
