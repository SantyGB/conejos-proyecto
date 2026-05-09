import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConejosComponent } from './conejos';

describe('Conejos', () => {
  let component: ConejosComponent;
  let fixture: ComponentFixture<ConejosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConejosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConejosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
