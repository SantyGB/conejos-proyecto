import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservacionComponent } from './observacion';

describe('ObservacionComponent', () => {

  let component: ObservacionComponent;
  let fixture: ComponentFixture<ObservacionComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [ObservacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservacionComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();

  });

  it('should create', () => {

    expect(component).toBeTruthy();

  });

});