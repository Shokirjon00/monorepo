import { Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'em-eskhata-bank-loader',
  templateUrl: './eskhata-bank-loader.component.html',
  styleUrls: ['./eskhata-bank-loader.component.scss']
})
export class EskhataBankLoaderComponent {
  text = input<string | null>(null);
}
