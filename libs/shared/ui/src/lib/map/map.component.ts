import { Component, inject, Input, OnChanges, OnInit, output, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { Observable, Subscriber } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DestroyableComponent, ToastEnum } from '@eskhata/util';
import { MessageService } from '@eskhata/data-access';
import { ENVIRONMENT } from '@eskhata/environment';

@Component({
  standalone: true,
  selector: 'em-map',
  templateUrl: './map.component.html',
  imports: [FormsModule],
  styleUrls: ['./map.component.scss'],
})
export class MapComponent extends DestroyableComponent implements OnInit, OnChanges {
  @Input() longitude: number;
  @Input() latitude: number;
  @Input() disabled: boolean;

  @Input() restrictInput = false;

  @Input() flyOnChange = false;

  readonly changed = output<any>();

  marker = Object();
  icon = L.icon({
    iconUrl: 'assets/icons/subtract.svg',
    iconSize: [25, 41],
    popupAnchor: [13, 0],
  });
  zoom = 13;

  private readonly messageService = inject(MessageService);
  private readonly environment = inject(ENVIRONMENT);
  private map: L.Map;

  ngOnInit(): void {
    this.setTimeout(() => {
      this.loadMap();
      this.getPoint();
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.flyOnChange && (changes['latitude'] || changes['longitude']) && this.map) {
      this.flyToLocation(this.latitude, this.longitude);
    }
  }

  flyToLocation(lat: number, lng: number): void {
    const validLat = typeof lat === 'number' && lat >= -90 && lat <= 90;
    const validLng = typeof lng === 'number' && lng >= -180 && lng <= 180;

    if (!validLat || !validLng) {
      this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: 'Неверные координаты для отображения карты.',
      });
      return;
    }

    this.map.flyTo([lat, lng], this.zoom);
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    if (!this.restrictInput) {
      return;
    }
    const allowedChars = '0123456789.-';
    const key = event.key;
    if (!allowedChars.includes(key)) {
      event.preventDefault();
    }
  }

  getPoint(): void {
    this.map.on('click', e => {
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.latitude = e.latlng.lat;
      this.longitude = e.latlng.lng;
      this.marker = L.marker([e.latlng.lat, e.latlng.lng], { icon: this.icon }).addTo(this.map);
      this.changed.emit({ latitude: this.latitude, longitude: this.longitude });
    });
  }

  mapChange(): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.map.flyTo([this.latitude, this.longitude], 13);
    this.marker = L.marker([this.latitude, this.longitude], { icon: this.icon }).addTo(this.map);
    this.changed.emit({ latitude: this.latitude, longitude: this.longitude });
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
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: this.environment.mapbox.accessToken,
    } as L.TileLayerOptions).addTo(this.map);
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
}
