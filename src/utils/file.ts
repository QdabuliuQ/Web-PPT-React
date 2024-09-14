export function getAssetsFile(url: string) {
  return new URL(`../assets/${url}`, import.meta.url).href
}

export function getAssetsImageToBase64(name: string) {
  console.log(getAssetsFile(`image/${name}`))
}

export function validateFile(
  file: File,
  type: Array<string> = ['image/png', 'image/jpeg', 'image/jpg'],
  size: number = 1
) {
  const allowedTypes = type
  if (!allowedTypes.includes(file.type)) {
    return {
      status: false,
      msg: '请上传PNG、JPG或JPEG格式的图片！'
    }
  }

  const maxSizeMB = size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      status: false,
      msg: '文件大小不能超过1MB！'
    }
  }

  return {
    status: true
  }
}

export function getImageSize(url: string) {
  const image = new Image()
  image.src = url
  return new Promise((resolve) => {
    image.onload = function () {
      resolve({
        width: image.width,
        height: image.height
      })
    }
  })
}
