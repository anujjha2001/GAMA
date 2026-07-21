import { createClient } from './server';

const BUCKET_NAME = 'medical-documents';

export async function uploadToVault(path: string, fileBuffer: Buffer, mimeType: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) {
    if (error.message.toLowerCase().includes('bucket not found') || error.message.toLowerCase().includes('does not exist')) {
      throw new Error("Private storage bucket 'medical-documents' does not exist. Please create it in your Supabase Dashboard -> Storage.");
    }
    throw new Error(`Supabase upload error: ${error.message}`);
  }
  return data;
}

export async function getVaultSignedUrl(path: string, expiresInSeconds: number = 3600) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
  return data.signedUrl;
}

export async function deleteFromVault(path: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error(`[VaultStorage] Error deleting ${path} from storage:`, error.message);
  }
  return data;
}
