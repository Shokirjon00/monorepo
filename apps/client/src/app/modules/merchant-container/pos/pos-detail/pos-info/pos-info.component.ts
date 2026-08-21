import { Component, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { IPosDetail } from '../../interfaces/pos.interface';
import { PosService } from '../../services/pos.service';
import { DestroyableComponent } from '@eskhata/util';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { FileSaverService } from 'ngx-filesaver';
import { HttpResponse } from '@angular/common/http';
import { IHeader } from '@eskhata/util';
import { HeaderService } from '@eskhata/data-access';
import { QRCodeComponent } from 'angularx-qrcode';
import { CommonModule, Location } from '@angular/common';
import printJS from 'print-js';
import { SafeUrl } from '@angular/platform-browser';
import { toPng } from 'html-to-image';
import { SvgIconComponent } from 'angular-svg-icon';
import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';
import { PrintDirective } from '@core/directives/print.directive';
import { EmHeaderComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-pos-info',
  templateUrl: './pos-info.component.html',
  styleUrls: ['./pos-info.component.scss'],
  imports: [
    SvgIconComponent,
    QRCodeComponent,
    NgxPermissionsAllowStubDirective,
    PrintDirective,
    CommonModule,
    EmHeaderComponent,
  ],
})
export class PosInfoComponent extends DestroyableComponent implements OnInit {
  readonly qrCodeComp = viewChild(QRCodeComponent);
  readonly qrContainer = viewChild<ElementRef>('qrContainer');
  posDetail: IPosDetail;
  qrCode: string;
  qrCodeSrc!: SafeUrl;
  qrBody: number = 465;
  qrWidth: number;
  qrHeight: number;
  eQMSQrCode: string = '';
  header: IHeader = {
    tabShow: false,
    isFilter: false,
  };
  qrSizes = [
    {
      isSelected: true,
      value: 'A4',
      qrBody: 436,
      qrWidth: 200,
      qrHeight: 200,
    },
    {
      isSelected: false,
      value: 'A5',
      qrBody: 375,
      qrWidth: 200,
      qrHeight: 200,
    },
    {
      isSelected: false,
      value: 'A6',
      qrBody: 260,
      qrWidth: 200,
      qrHeight: 200,
    },
    {
      isSelected: false,
      value: 'A7',
      qrBody: 190,
      qrWidth: 200,
      qrHeight: 200,
    },
    {
      isSelected: false,
      value: 'A8',
      qrBody: 130,
      qrWidth: 200,
      qrHeight: 200,
    },
  ];
  selectedQrSize: string = 'A4';
  eQMSQrCodeSrc!: SafeUrl;
  private posId: string;
  private merchantId: string;

  private service = inject(PosService);
  private fileSaverService = inject(FileSaverService);
  private router = inject(Router);
  private headerService = inject(HeaderService);
  private location = inject(Location);

  constructor() {
    super();
    this.initData();
  }

  ngOnInit(): void {
    this.getDetail();
    this.getQRCode();
    this.getEQMSQRCode();
  }

  posEdit(): void {
    this.router.navigate(['merchant/merchant', this.merchantId, 'poses', this.posId, 'edit']).catch();
  }

  printQrCode(): void {
    const imageUrl = this.qrCodeComp().context.canvas.toDataURL('image/png');
    printJS({
      printable: imageUrl,
      type: 'image',
      imageStyle: 'width:50%;margin-bottom:20px',
    });
  }

  getSettings(): void {
    this.service
      .getSetting(this.posId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res: HttpResponse<Blob>) => {
        this.fileSaverService.save(res.body, res.headers.get('content-disposition'));
      });
  }

  changeQrSize(qrSize: any): void {
    if (!qrSize.isSelected) {
      this.qrSizes.forEach(size => (size.isSelected = false));
      qrSize.isSelected = !qrSize.isSelected;
      this.selectedQrSize = qrSize.value;
      this.qrBody = qrSize.qrBody;
      this.qrWidth = qrSize.qrWidth;
      this.qrHeight = qrSize.qrHeight;
    }
  }

  changeURL(url: SafeUrl, key: string): void {
    if (key === 'qr') {
      this.qrCodeSrc = url;
    } else {
      this.eQMSQrCodeSrc = url;
    }
  }

  downloadQrWithBackground(): void {
    const selectedSize = this.qrSizes.find(size => size.isSelected);
    const element = this.qrContainer().nativeElement;

    const sizeMap = {
      A4: { width: 794, height: 1123 },
      A5: { width: 559, height: 794 },
      A6: { width: 397, height: 559 },
      A7: { width: 280, height: 397 },
      A8: { width: 197, height: 280 },
    };

    // @ts-ignore
    const { width, height } = sizeMap[selectedSize?.value] || {
      width: element.offsetWidth * 2,
      height: element.offsetHeight * 2,
    };

    toPng(element, {
      backgroundColor: null,
      quality: 1,
      cacheBust: true,
      width: width,
      height: height,
    }).then(dataUrl => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `QR_${selectedSize.value}.png`;
      link.click();
    });
  }

  back(): void {
    this.location.back();
  }

  private getDetail(): void {
    this.service
      .getDetail(this.posId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.posDetail = res.data;
        }
      });
  }

  private getQRCode(): void {
    this.service
      .getQRCode(this.posId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.qrCode = res.data;
        }
      });
  }

  private getEQMSQRCode(): void {
    this.service
      .getEQMSQRCode(this.posId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.eQMSQrCode = res.data;
        }
      });
  }

  private initData(): void {
    this.headerService
      .getPosId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(posId => (this.posId = posId));

    this.headerService
      .getMerchantId()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(merchantId => (this.merchantId = merchantId));
    this.headerService.setHeader(this.header);
  }
}
