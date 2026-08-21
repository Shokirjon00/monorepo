export function createBlob(file: BlobPart): any {
  const newBlob = new Blob([file], {type: 'application/pdf'});

  return window.URL.createObjectURL(newBlob);
}
