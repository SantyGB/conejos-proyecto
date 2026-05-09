import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlimentacionComponent } from './alimentacion';

describe('Alimentacion', () => {
  let component: AlimentacionComponent;
  let fixture: ComponentFixture<AlimentacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlimentacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlimentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
