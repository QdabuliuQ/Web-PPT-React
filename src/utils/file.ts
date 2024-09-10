export function getAssetsFile(url: string) {
  return new URL(`../assets/${url}`, import.meta.url).href
}

export function getAssetsImageToBase64(name: string) {
  console.log(getAssetsFile(`image/${name}`))
}
