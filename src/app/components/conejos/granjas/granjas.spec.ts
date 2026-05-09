import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Granjas } from './granjas';

describe('Granjas', () => {
  let component: Granjas;
  let fixture: ComponentFixture<Granjas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Granjas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Granjas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
