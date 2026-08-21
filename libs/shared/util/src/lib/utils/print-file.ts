import printJS from 'print-js-updated';
import { createBlob } from './create-blob';

export function printFile(file: BlobPart): void {
  const objectUrl = createBlob(file);
  printJS(objectUrl);
}
