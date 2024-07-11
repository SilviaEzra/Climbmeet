import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosCreadosComponent } from './eventos-creados.component';

describe('EventosCreadosComponent', () => {
  let component: EventosCreadosComponent;
  let fixture: ComponentFixture<EventosCreadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventosCreadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventosCreadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
