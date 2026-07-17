import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as L from 'leaflet';
import {environment} from '@environments/environment';
import {Observable, Subscriber} from 'rxjs';
import {DestroyableComponent} from '@core/abstract/destroyable.component';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'em-map',
  templateUrl: './map.component.html',
  standalone: true,
  imports: [
    FormsModule
  ],
  styleUrls: ['./map.component.scss']
})
export class MapComponent extends DestroyableComponent implements OnInit {
  @Input() longitude: number;
  @Input() latitude: number;
  @Input() disabled: boolean;
  @Output() changed = this.register(new EventEmitter());
  marker = Object();
  icon = L.icon({
    iconUrl: 'assets/icons/subtract.svg',
    iconSize: [25, 41],
    popupAnchor: [13, 0],
  });
  private map: L.Map;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.setTimeout(() => {
      this.loadMap();
      this.getPoint();
    }, 500)
  }

  mapChange(): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.map.flyTo([this.latitude, this.longitude], 13);
    this.marker = L.marker([this.latitude, this.longitude], {icon: this.icon}).addTo(this.map);
    this.changed.emit({latitude: this.latitude, longitude: this.longitude});
  }

  private getCurrentPosition(): any {
    return new Observable((observer: Subscriber<any>) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position: any) => {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          observer.complete();
        });
      } else {
        observer.error();
      }
    });
  }

  private loadMap(): void {
    this.map = L.map('map').setView([0, 0], 1);

    const accessToken = environment.mapbox.accessToken;

    L.tileLayer(
      `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${accessToken}`,
      {
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
      }
    ).addTo(this.map);

    if (this.latitude && this.longitude) {
      this.map.flyTo([this.latitude, this.longitude], 13);
      this.marker = L.marker([this.latitude, this.longitude], { icon: this.icon });
      this.changed.emit({ latitude: this.latitude, longitude: this.longitude });
      this.marker.addTo(this.map);
    } else {
      this.getCurrentPosition().subscribe((position: any) => {
        this.latitude = position.latitude;
        this.longitude = position.longitude;
        this.map.flyTo([position.latitude, position.longitude], 13);
        this.marker = L.marker([position.latitude, position.longitude], { icon: this.icon });
        this.changed.emit({ latitude: this.latitude, longitude: this.longitude });
        this.marker.addTo(this.map);
      });
    }
  }

  private getPoint(): void {
    this.map.on('click', e => {
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.latitude = e.latlng.lat;
      this.longitude = e.latlng.lng;
      this.marker = L.marker([e.latlng.lat, e.latlng.lng], {icon: this.icon}).addTo(this.map);
      this.changed.emit({latitude: this.latitude, longitude: this.longitude});
    });
  }
}
