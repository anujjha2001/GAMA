import { createAdminClient } from './admin';

const BUCKET_NAME = 'medical-documents';

export async function uploadToVault(storagePath: string, fileBuffer: Buffer, mimeType: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    console.error(`[VaultStorage] Upload failed for ${storagePath}:`, error.message);
    throw new Error(`Failed to upload document to storage: ${error.message}`);
  }

  return data;
}

export async function getVaultSignedUrl(storagePath: string, expiresInSeconds: number = 3600) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error) {
    console.error(`[VaultStorage] Failed to create signed URL for ${storagePath}:`, error.message);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

export async function deleteFromVault(storagePath: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);

  if (error) {
    console.error(`[VaultStorage] Failed to delete ${storagePath}:`, error.message);
    throw new Error(`Failed to delete document from storage: ${error.message}`);
  }

  return data;
}

export async function downloadFromVault(storagePath: string): Promise<Buffer> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(storagePath);

  if (error || !data) {
    const msg = error?.message ?? 'No data received from Supabase';
    console.error(`[VaultStorage] Download failed for ${storagePath}:`, msg);
    throw new Error(`Failed to download document from storage: ${msg}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

