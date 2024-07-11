import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../eventos/event.service';
import { Observable } from 'rxjs';

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  address: string;
  date: string;
  image: string;
  userId?: number;
}

@Component({
  selector: 'app-eventos-creados',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './eventos-creados.component.html',
  styleUrls: ['./eventos-creados.component.css']
})
export class EventosCreadosComponent implements OnInit {
  events$: Observable<Event[]> = new Observable<Event[]>(); // Inicialización de la propiedad

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.events$ = this.eventService.getEvents();
  }

  deleteEvent(id: number) {
    this.eventService.deleteEvent(id).subscribe(() => {
      this.events$ = this.eventService.getEvents(); // Actualizar la lista de eventos después de eliminar
    });
  }
}
