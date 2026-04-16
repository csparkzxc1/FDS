import * as ImageManipulator from 'expo-image-manipulator';

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.8;

export async function resizeAndCompressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    {
      compress: JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );
  return result.uri;
}

export function getStoragePath(bucketPath: string, fileName: string): string {
  return `${bucketPath}/${fileName}`;
}

export function generatePhotoFileName(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 7);
  return `${userId}_${timestamp}_${random}.jpg`;
}
