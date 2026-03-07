/**
 * Utility to crop an image using HTML Canvas.
 * Used with react-easy-crop's output (croppedAreaPixels).
 */

interface PixelCrop {
  x: number
  y: number
  width: number
  height: number
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })
}

/**
 * Crop an image and return a Blob.
 * @param imageSrc - data URL or object URL of the source image
 * @param pixelCrop - { x, y, width, height } in pixels from react-easy-crop
 * @param outputSize - optional max output size (default 800px)
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  outputSize = 800
): Promise<Blob> {
  const image = await createImage(imageSrc)

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")

  // Determine output dimensions (max outputSize, maintain aspect ratio)
  const size = Math.min(pixelCrop.width, pixelCrop.height, outputSize)
  canvas.width = size
  canvas.height = size

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Canvas toBlob failed"))
      },
      "image/jpeg",
      0.9
    )
  })
}
