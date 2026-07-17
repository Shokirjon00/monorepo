export async function loadFile(file: BlobPart): Promise<any> {
  return new Promise((resolve) => {
    let blob = new Blob([file], {type: 'image/png'});
    const reader = new FileReader();
    reader.onload = async (): Promise<any> => {
      resolve(reader.result);
    }
    reader.readAsDataURL(blob);
  })
}
