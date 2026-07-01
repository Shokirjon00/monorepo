import {Component, DestroyRef, ElementRef, inject, OnInit, viewChild} from '@angular/core';
import { BreadcrumbService } from 'xng-breadcrumb';
import { Router} from '@angular/router';
import { Observable, from, of, timer, race } from 'rxjs';
import { switchMap, map, catchError, tap, mapTo, takeUntil, finalize } from 'rxjs/operators';
import { PosService } from '@modules/client/pos/services/pos.service';
import { FileSaverService } from 'ngx-filesaver';
import { HttpResponse } from '@angular/common/http';
import { IPosDetail } from '@modules/client/pos/interfaces/pos-detail.interface';
import { HeaderService } from '@core/services/header.service';
import { IHeader } from '@core/interfaces/header.interface';
import { QRCodeComponent } from 'angularx-qrcode';
import { SafeUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { PosQrDialogComponent } from '@shared/dialogs/pos-qr-dialog/pos-qr-dialog.component';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { DateTimePipe } from "@core/pipe/date-time.pipe";
import { PrintDirective } from "@core/directives/print.directive";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { toPng, toSvg } from "html-to-image";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { NgStyle} from "@angular/common";
import { QR_SIZES, MM_SIZE_MAP, QrSize } from './qr-constants';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

const CSS_DPI = 96;
const EXPORT_DPI = 300;
const FONT_WAIT_MS = 1500;
const DEFAULT_WEBP_QUALITY = 1;

@Component({
  standalone: true,
  selector: 'em-pos-info',
  templateUrl: './pos-info.component.html',
  styleUrls: ['./pos-info.component.scss'],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    DateTimePipe,
    PrintDirective,
    QRCodeComponent,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent,
    NgStyle
  ],
  providers: [PosService, FileSaverService]
})
export class PosInfoComponent implements OnInit {
  readonly qrContainer = viewChild<ElementRef>('qrContainer');
  posDetail: IPosDetail;
  qrCode: string = '';
  qrBody: number = 465;
  qrWidth: number;
  qrHeight: number;
  eQMSQrCode: string = '';
  header: IHeader = {
    tabShow: false,
    isFilter: false
  };
  qrSizes: QrSize[] = QR_SIZES;
  selectedQrSize: string = 'A4'
  qrCodeSrc!: SafeUrl
  eQMSQrCodeSrc!: SafeUrl
  loading: boolean = false;
  private posId: string;
  private merchantId: string;
  private companyId: string;
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly service = inject(PosService);
  private readonly fileSaverService = inject(FileSaverService);
  private readonly headerService = inject(HeaderService);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.headerService.getPosId()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(posId => this.posId = posId);

    this.headerService.getMerchantId()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(merchantId => this.merchantId = merchantId);

    this.headerService.getCompanyId()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(companyId => this.companyId = companyId);

    this.headerService.setHeader(this.header);
    this.getDetail();
    this.getQRCode();
    this.getEQMSQRCode();
  }

  downloadQrWithBackground(): void {
    const element = this.qrContainer().nativeElement as HTMLElement;
    const selectedSize = this.getSelectedSize();

    const mm = MM_SIZE_MAP[selectedSize?.value] || { w: element.offsetWidth, h: element.offsetHeight };
    const cssWidth = Math.round((mm.w / 25.4) * CSS_DPI);
    const cssHeight = Math.round((mm.h / 25.4) * CSS_DPI);
    const exportWidth = Math.round((mm.w / 25.4) * EXPORT_DPI);
    const exportHeight = Math.round((mm.h / 25.4) * EXPORT_DPI);
    const fileBase = `QR_${selectedSize?.value || 'custom'}`;

    from(this.waitForFonts(FONT_WAIT_MS)).pipe(
      switchMap(() => from(this.createSvgDataUrl(element, cssWidth, cssHeight))),
      switchMap((svgDataUrl: string) => from(this.renderCanvasFromSvg(svgDataUrl, exportWidth, exportHeight)).pipe(
        map((canvas: HTMLCanvasElement) => ({ svgDataUrl, canvas }))
      )),
      switchMap(({ svgDataUrl, canvas }) => from(this.tryExportWebpFromCanvas(canvas, `${fileBase}.webp`, DEFAULT_WEBP_QUALITY)).pipe(
        map((exported: boolean) => ({ svgDataUrl, exported }))
      )),
      tap(({ svgDataUrl, exported }: { svgDataUrl: string; exported: boolean }) => {
        if (!exported) {
          this.fallbackSvgDownload(svgDataUrl, `${fileBase}.svg`);
        }
      }),
      catchError(() => {
        return from(toPng(element, { backgroundColor: null, quality: 1, cacheBust: true, width: cssWidth, height: cssHeight })).pipe(
          tap((dataUrl: string) => {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${fileBase}.png`;
            link.click();
          }),
          mapTo(null)
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private getSelectedSize() {
    return this.qrSizes.find(size => size.isSelected);
  }

  private createSvgDataUrl(element: HTMLElement, width: number, height: number): Observable<string> {
    return from(toSvg(element, {
      backgroundColor: null,
      cacheBust: true,
      width: width,
      height: height
    }));
  }

  private renderCanvasFromSvg(svgDataUrl: string, width: number, height: number): Observable<HTMLCanvasElement> {
    return from(this.loadImage(svgDataUrl)).pipe(
      map((img: HTMLImageElement) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D контекст недоступен');
        ctx.drawImage(img, 0, 0, width, height);
        return canvas;
      })
    );
  }

  private tryExportWebpFromCanvas(canvas: HTMLCanvasElement, filename: string, quality: number): Observable<boolean> {
    return from(this.canvasToBlob(canvas, 'image/webp', quality)).pipe(
      map((webpBlob: Blob | null) => {
        if (webpBlob) {
          this.safeDownload(webpBlob, filename);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  private fallbackSvgDownload(svgDataUrl: string, filename: string): void {
    const a = document.createElement('a');
    a.href = svgDataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  private waitForFonts(timeout = 1000): Observable<void> {
    const fontsApi = (document as any).fonts;
    if (fontsApi && fontsApi.ready) {
      return race(from(fontsApi.ready), timer(timeout).pipe(mapTo(undefined)));
    }
    return timer(Math.min(500, timeout)).pipe(mapTo(undefined));
  }

  private loadImage(src: string): Observable<HTMLImageElement> {
    return new Observable<HTMLImageElement>((observer) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        observer.next(img);
        observer.complete();
      };
      img.onerror = (err) => observer.error(err);
      img.src = src;
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    });
  }

  private canvasToBlob(canvas: HTMLCanvasElement, type: string, quality = 1): Observable<Blob | null> {
    return new Observable<Blob | null>((observer) => {
      if (canvas.toBlob) {
        try {
          canvas.toBlob((b) => {
            observer.next(b);
            observer.complete();
          }, type, quality);
        } catch (e) {
          observer.next(null);
          observer.complete();
        }
      } else {
        observer.next(null);
        observer.complete();
      }
    });
  }

  private safeDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  isTitleLong(): boolean {
    return this.posDetail?.name?.length > 40;
  }

  changeURL(url: SafeUrl, key: string): void {
    if (key === 'qr') {
      this.qrCodeSrc = url;
    } else {
      this.eQMSQrCodeSrc = url;
    }
  }

  getSettings(): void {
    this.service.getSetting(this.posId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: HttpResponse<Blob>) => {
        if (res.headers.get('content-disposition')) {
          const fileName = res.headers.get('content-disposition').split(';')[1].split('=')[1];
          this.fileSaverService.save(res.body, fileName);
        }
      })
  }

  navigateToPosUpdate(): void {
    this.headerService.setPosId(this.posId)
    if (this.companyId) {
      this.router.navigate(['clients/company', this.companyId, 'merchant', this.merchantId, 'poses', this.posId, 'edit'])
        .catch()
    } else if (this.merchantId) {
      this.router.navigate(['clients/merchant', this.merchantId, 'poses', this.posId, 'edit'])
        .catch()
    } else {
      this.router.navigate(['clients/poses', this.posId, 'edit']).catch()
    }
  }

  changeQrSize(qrSize: any): void {
    if (!qrSize.isSelected) {
      this.qrSizes.forEach((size) => size.isSelected = false);
      qrSize.isSelected = !qrSize.isSelected;
      this.selectedQrSize = qrSize.value;
      this.qrBody = qrSize.qrBody;
      this.qrWidth = qrSize.qrWidth;
      this.qrHeight = qrSize.qrHeight;
    }
  }

  openQrDialog(): void {
    this.loading = true;
    this.service.getPosConnectionQr(this.posId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.dialog.open(PosQrDialogComponent, { data: res.data });
        } else {
          this.messageService.add({ severity: ToastEnum.ERROR, summary: res.message });
        }
      })
  }

  private getDetail(): void {
    this.breadcrumbService.set('@posDetail', { skip: true });
    this.service.getDetail(this.posId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.posDetail = res.data;
        this.breadcrumbService.set('@posDetail', { label: this.posDetail.name, skip: false });
      })
  }

  private getQRCode(): void {
    this.service.getQRCode(this.posId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.qrCode = res.data;
        }
      })
  }

  private getEQMSQRCode(): void {
    this.service.getEQMSQRCode(this.posId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.eQMSQrCode = res.data;
        }
      })
  }
}
