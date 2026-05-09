import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Conejos } from './conejos';

describe('Conejos', () => {
  let component: Conejos;
  let fixture: ComponentFixture<Conejos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Conejos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Conejos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
