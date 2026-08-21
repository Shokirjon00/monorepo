import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { IQrPosGeography, IQrPosRegion, IRegionMarker } from '../../interfaces/qr-pos-analytics.interface';
import { EmNumberPipe } from '@modules/analytics/pipes/em-number.pipe';

@Component({
  standalone: true,
  selector: 'em-qr-pos-geography',
  templateUrl: './qr-pos-geography.component.html',
  styleUrls: ['./qr-pos-geography.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, EmNumberPipe],
})
export class QrPosGeographyComponent {
  readonly geography = input<IQrPosGeography | null>(null);

  readonly regions = computed<IQrPosRegion[]>(() => this.geography()?.regions ?? []);
  readonly markers = computed<IRegionMarker[]>(() => {
    const regions = this.regions().filter(r => r.lat != null && r.lng != null);
    if (!regions.length) return [];

    const lats = regions.map(r => r.lat as number);
    const lngs = regions.map(r => r.lng as number);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const span = (min: number, max: number, v: number): number =>
      max === min ? 50 : ((v - min) / (max - min)) * 80 + 10;

    return regions.map(r => ({
      regionId: r.regionId,
      name: r.name,
      x: span(minLng, maxLng, r.lng as number),
      y: 100 - span(minLat, maxLat, r.lat as number),
      size: 14 + (r.share / 100) * 26,
    }));
  });

  trackRegion(_: number, region: IQrPosRegion): string {
    return region.regionId;
  }
}
