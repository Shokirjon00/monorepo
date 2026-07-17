import { Component } from '@angular/core';

@Component({
  selector: 'em-transaction-card',
  templateUrl: './transaction-card.component.html',
  styleUrls: ['./transaction-card.component.scss']
})
export class TransactionCardComponent {

  constructor() { }
  transactionCards = [
    {
      img: 'assets/images/1.svg',
      title: 'Все',
      amount: '1024 c',
      quantity: '24',
      percent: '100%',
    },
    {
      img: 'assets/images/2.svg',
      title: 'Завершено',
      amount: '10254 c',
      quantity: '40 015',
      percent: '87%',
    },
    {
      img: 'assets/images/3.svg',
      title: 'Не подтверждено',
      amount: '10254 с.',
      quantity: '1',
      percent: '1%',
    },
    {
      img: 'assets/images/2.svg',
      title: 'Завершено',
      amount: '1024 c',
      quantity: '12',
      percent: '3%',
    },
  ]

}
