function ZIndexUtils(): any {
  let zIndexes: any[] = [];

  const generateZIndex = (key: any, baseZIndex: any): any => {
    const lastZIndex = zIndexes.length > 0 ? zIndexes[zIndexes.length - 1] : { key, value: baseZIndex };
    const newZIndex = lastZIndex.value + (lastZIndex.key === key ? 0 : baseZIndex) + 1;

    zIndexes.push({ key, value: newZIndex });

    return newZIndex;
  };

  const revertZIndex = (zIndex: number): void => {
    zIndexes = zIndexes.filter(obj => obj.value !== zIndex);
  };

  const getCurrentZIndex = (): any => {
    return zIndexes.length > 0 ? zIndexes[zIndexes.length - 1].value : 0;
  };

  const getZIndex = (el: { style: { zIndex: string } }): any => {
    return el ? parseInt(el.style.zIndex, 10) || 0 : 0;
  };

  return {
    get: getZIndex,
    set: (key: any, el: { style: { zIndex: string } }, baseZIndex: any): any => {
      if (el) {
        el.style.zIndex = String(generateZIndex(key, baseZIndex));
      }
    },
    clear: (el: { style: any }): any => {
      if (el) {
        revertZIndex(getZIndex(el));
        el.style.zIndex = '';
      }
    },
    getCurrent: () => getCurrentZIndex(),
  };
}

export default ZIndexUtils();
