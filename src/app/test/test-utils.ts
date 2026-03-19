import { DebugElement } from '@angular/core';
import { ComponentFixture, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';

export class TestUtils {
  /**
   * Helper function to apply querySelector to the HTML elements inside the test fixture.
   */
  static querySelector(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixture: ComponentFixture<any>,
    querySelector: string,
  ): HTMLElement {
    const nativeHtmlPage: HTMLElement = fixture.debugElement.nativeElement;
    return nativeHtmlPage.querySelector(querySelector)!;
  }

  /**
   * Helper function to apply querySelectorAll to the HTML elements inside the test fixture.
   */
  static querySelectorAll(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixture: ComponentFixture<any>,
    querySelector: string,
  ): HTMLElement[] {
    const nativeHtmlPage: HTMLElement = fixture.debugElement.nativeElement;
    return Array.from(nativeHtmlPage.querySelectorAll(querySelector));
  }

  /**
   * Helper function to query the debug element of the test fixture.
   * Note that this helper returns an element of type DebugElement.
   */
  static queryDebugElement(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixture: ComponentFixture<any>,
    querySelector: string,
  ): DebugElement {
    return fixture.debugElement.query(By.css(querySelector));
  }

  /**
   * Creates an array containing n copies of the passed element
   * @param n that an array should be copied in an array
   * @param el that should be the copied
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static copyTimes(n: number, el: any): any[] {
    if (n <= 0) {
      return [];
    }
    const result = [];
    for (let i = 0; i < n; i++) {
      result.push(el);
    }
    return result;
  }

  /**
   * Gets the last value from the observable. Only works within a fake async zone.
   *
   * @param obs
   * @param tickTime
   */
  static getLastValue<T>(
    obs: Observable<T> | Promise<T>,
    tickTime?: number,
  ): T {
    let emittedAction: T;
    let subscription: Subscription | undefined = undefined;

    if (obs instanceof Observable) {
      subscription = obs.subscribe((action) => (emittedAction = action));
    } else {
      obs.then((action) => (emittedAction = action));
    }

    tick(tickTime);

    if (subscription) {
      subscription.unsubscribe();
    }
    // @ts-expect-error it's set
    return emittedAction;
  }
}
