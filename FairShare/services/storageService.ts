import { supabase } from './supabase';
import { resizeAndCompressImage, generatePhotoFileName } from '@/utils/image';
import { IS_DEV_BYPASS } from '@/utils/devMode';

export async function uploadChorePhoto(
  householdId: string,
  userId: string,
  localUri: string,
): Promise<string> {
  if (IS_DEV_BYPASS) return 'https://placeholder.example.com/photo.jpg';

  const compressed = await resizeAndCompressImage(localUri);
  const fileName = generatePhotoFileName(userId);
  const path = `${householdId}/${userId}/${fileName}`;

  const response = await fetch(compressed);
  const blob = await response.blob();
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

  const { error } = await supabase.storage
    .from('chore-photos')
    .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('chore-photos').getPublicUrl(path);
  return data.publicUrl;
}
