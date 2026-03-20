import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerificationInfoComponent } from './verification-info.component';

describe('VerificationInfoComponent', () => {
  let component: VerificationInfoComponent;
  let fixture: ComponentFixture<VerificationInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VerificationInfoComponent],
    });

    fixture = TestBed.createComponent(VerificationInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('mapVerificationInfo', () => {
    it('should return communityVerificationInfo when verification is undefined', () => {
      fixture.componentRef.setInput('verification', undefined);
      fixture.detectChanges();
      expect(component.mapVerificationInfo()).toEqual(component.communityVerificationInfo);
    });

    it('should return communityVerificationInfo for community verification type', () => {
      fixture.componentRef.setInput('verification', { type: 'community' });
      fixture.detectChanges();
      expect(component.mapVerificationInfo()).toEqual(component.communityVerificationInfo);
    });

    it('should return communityVerificationInfo for any unknown verification type', () => {
      fixture.componentRef.setInput('verification', { type: 'some-unknown-type' });
      fixture.detectChanges();
      expect(component.mapVerificationInfo()).toEqual(component.communityVerificationInfo);
    });
  });

  describe('communityVerificationInfo', () => {
    it('should have showIcon false', () => {
      expect(component.communityVerificationInfo.showIcon).toBe(false);
    });

    it('should have label Community', () => {
      expect(component.communityVerificationInfo.label).toBe('Community');
    });

    it('should have objectStatus neutral', () => {
      expect(component.communityVerificationInfo.objectStatus).toBe('neutral');
    });
  });

  describe('verificationInfo computed signal', () => {
    it('should return communityVerificationInfo for any verification input', () => {
      fixture.componentRef.setInput('verification', { type: 'some-type' });
      fixture.detectChanges();
      expect(component.verificationInfo()).toEqual(component.communityVerificationInfo);
    });

    it('should return communityVerificationInfo when no input is set', () => {
      expect(component.verificationInfo()).toEqual(component.communityVerificationInfo);
    });
  });
});
