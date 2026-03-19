export class EmptyCatalogPo {
  constructor(private root: HTMLElement) {}

  get illustratedMessage(): HTMLElement {
    return this.root.querySelector('[fd-illustrated-message]')!;
  }

  get title(): HTMLElement {
    return this.root.querySelector('[fd-illustrated-message-title]')!;
  }

  get actions(): HTMLElement {
    return this.root.querySelector('fd-illustrated-message-actions')!;
  }

  // TODO move to a more common place
  getTextContent(element: HTMLElement): string {
    return element.textContent?.trim() || '';
  }
}
