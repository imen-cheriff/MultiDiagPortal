import { Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-password-strength-bar',
  standalone: true,
  templateUrl: './password-strength-bar.component.html',
  styleUrl: './password-strength-bar.component.scss',
})
export class PasswordStrengthBarComponent {
  colors = ['#F00', '#F90', '#FF0', '#9F0', '#0F0'];

  constructor(private elementRef: ElementRef) { }

  private resetBar(): void {
    const element = this.elementRef.nativeElement;
    const lis = element.getElementsByTagName('li');
    for (let i = 0; i < lis.length; i++) {
      lis[i].style.backgroundColor = '#DDD';
    }
  }

  private static measureStrength(p: string): number {
    let force = 0;
    const regex = /[$-/:-?{-~!"^_`\[\]]/g; // "
    const lowerLetters = /[a-z]+/.test(p);
    const upperLetters = /[A-Z]+/.test(p);
    const numbers = /[0-9]+/.test(p);
    const symbols = regex.test(p);

    const flags = [lowerLetters, upperLetters, numbers, symbols];
    const passedMatches = flags.filter((isMatchedFlag: boolean) => {
      return isMatchedFlag === true;
    }).length;

    force += 2 * p.length + (p.length >= 10 ? 1 : 0);
    force += passedMatches * 10;

    // penality (short password)
    force = p.length <= 6 ? Math.min(force, 10) : force;

    // penality (poor variety of characters)
    force = passedMatches === 1 ? Math.min(force, 10) : force;
    force = passedMatches === 2 ? Math.min(force, 20) : force;
    force = passedMatches === 3 ? Math.min(force, 40) : force;

    return force;
  }

  getColor(s: number): any {
    let idx = 0;
    if (s <= 10) {
      idx = 0;
    } else if (s <= 20) {
      idx = 1;
    } else if (s <= 30) {
      idx = 2;
    } else if (s <= 40) {
      idx = 3;
    } else {
      idx = 4;
    }
    return { idx: idx + 1, col: this.colors[idx] };
  }

  @Input()
  set passwordToCheck(password: string) {
    if (password) {
      const c = this.getColor(
        PasswordStrengthBarComponent.measureStrength(password)
      );
      const element = this.elementRef.nativeElement;
      const lis = element.getElementsByTagName('li');
      for (let i = 0; i < lis.length; i++) {
        if (i < c.idx) {
          lis[i].style.backgroundColor = c.col;
        } else {
          lis[i].style.backgroundColor = '#DDD';
        }
      }
    } else {
      this.resetBar(); // Reset the bar when the password is empty
    }
  }
}
