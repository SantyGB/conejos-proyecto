import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionFinalComponent } from './evaluacion-final';

describe('EvaluacionFinalComponent', () => {

  let component: EvaluacionFinalComponent;
  let fixture: ComponentFixture<EvaluacionFinalComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [EvaluacionFinalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluacionFinalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});