export function createBlob(file: BlobPart): any {
  // It is necessary to create a new blob object with mime-type explicitly set
  // otherwise only Chrome works like it should
  const newBlob = new Blob([file], {type: 'application/pdf'});

  // For other browsers:
  // Create a link pointing to the ObjectURL containing the blob.
  return window.URL.createObjectURL(newBlob);
}
