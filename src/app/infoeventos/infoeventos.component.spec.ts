import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoEventosComponent } from './infoeventos.component';

describe('InfoeventosComponent', () => {
  let component: InfoEventosComponent;
  let fixture: ComponentFixture<InfoEventosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoEventosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
