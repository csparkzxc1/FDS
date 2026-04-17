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

  // Fetch → Blob is safe in React Native (Hermes). Avoids FileReader which
  // has unreliable ArrayBuffer support in the RN runtime.
  const response = await fetch(compressed);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('chore-photos')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('chore-photos').getPublicUrl(path);
  return data.publicUrl;
}
