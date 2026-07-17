import { createBlob } from '@core/utils/create-blob';
import printJS from "print-js";

export function printFile(file: BlobPart): void {
  const objectUrl = createBlob(file);
  printJS(objectUrl);
}
