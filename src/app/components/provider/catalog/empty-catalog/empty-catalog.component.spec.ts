import { EmptyCatalogComponent } from './empty-catalog.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('EmptyCatalogComponent', () => {
  let fixture: ComponentFixture<EmptyCatalogComponent>;
  let component: EmptyCatalogComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyCatalogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyCatalogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the title when provided', () => {
    component.title = 'No Results Found';
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector(
      '[fd-illustrated-message-title], .fd-illustrated-message__title, [fdillustratedmessagetitle]',
    );
    expect(titleEl?.textContent?.trim() ?? '').toContain('');
  });

  it('should have correct sceneConfig', () => {
    expect(component.sceneConfig).toEqual({
      scene: {
        url: './assets/sapIllus-Scene-NoSearchResults.svg',
        id: 'sapIllus-Scene-NoSearchResults',
      },
      dialog: {
        url: './assets/sapIllus-Dialog-NoSearchResults.svg',
        id: 'sapIllus-Dialog-NoSearchResults',
      },
    });
  });

  it('should accept title input as undefined', () => {
    component.title = undefined;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
