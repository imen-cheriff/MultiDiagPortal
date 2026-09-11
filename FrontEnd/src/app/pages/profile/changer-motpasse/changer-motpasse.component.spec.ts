import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangerMotpasseComponent } from './changer-motpasse.component';

describe('ChangerMotpasseComponent', () => {
  let component: ChangerMotpasseComponent;
  let fixture: ComponentFixture<ChangerMotpasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangerMotpasseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangerMotpasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
