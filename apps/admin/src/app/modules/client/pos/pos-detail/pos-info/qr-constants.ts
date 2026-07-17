export interface QrSize {
  isSelected: boolean;
  value: string;
  qrBody: number;
  qrWidth: number;
  qrHeight: number;
}

export const QR_SIZES: QrSize[] = [
  { isSelected: true, value: 'A4', qrBody: 436, qrWidth: 200, qrHeight: 200 },
  { isSelected: false, value: 'A5', qrBody: 375, qrWidth: 200, qrHeight: 200 },
  { isSelected: false, value: 'A6', qrBody: 260, qrWidth: 200, qrHeight: 200 },
  { isSelected: false, value: 'A7', qrBody: 190, qrWidth: 200, qrHeight: 200 },
  { isSelected: false, value: 'A8', qrBody: 130, qrWidth: 200, qrHeight: 200 }
];

export const MM_SIZE_MAP: Record<string, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  A5: { w: 148, h: 210 },
  A6: { w: 105, h: 148 },
  A7: { w: 74, h: 105 },
  A8: { w: 52, h: 75 }
};
