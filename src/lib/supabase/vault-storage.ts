import { createClient } from './server';
import fs from 'fs/promises';
import path from 'path';

const BUCKET_NAME = 'medical-documents';
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'medical-documents');

export async function uploadToVault(storagePath: string, fileBuffer: Buffer, mimeType: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      throw error;
    }
    return data;
  } catch (error: any) {
    if (error.message.toLowerCase().includes('bucket not found') || error.message.toLowerCase().includes('does not exist')) {
      console.warn("Private storage bucket 'medical-documents' does not exist in Supabase. Falling back to local storage.");
    } else if (error.message.toLowerCase().includes('signature verification failed')) {
      console.warn("Supabase Anon Key mismatch (signature verification failed). Falling back to local storage.");
    } else {
      console.warn(`Supabase upload failed: ${error.message}. Falling back to local storage.`);
    }

    // Fallback to local filesystem
    const fullPath = path.join(LOCAL_UPLOAD_DIR, storagePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, fileBuffer);
    return { path: storagePath, local: true };
  }
}

export async function getVaultSignedUrl(storagePath: string, expiresInSeconds: number = 3600) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error) {
      throw error;
    }
    return data.signedUrl;
  } catch (error: any) {
    // Check if the file exists locally
    const fullPath = path.join(LOCAL_UPLOAD_DIR, storagePath);
    try {
      await fs.access(fullPath);
      // Return a local URL path
      return `/uploads/medical-documents/${storagePath}`;
    } catch {
      console.error(`Failed to generate signed URL and local file not found: ${error.message}`);
      return `/uploads/medical-documents/${storagePath}`; // Fallback best-effort
    }
  }
}

export async function deleteFromVault(storagePath: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      throw error;
    }
    return data;
  } catch (error: any) {
    console.warn(`[VaultStorage] Error deleting ${storagePath} from Supabase:`, error.message);
    // Delete from local storage
    const fullPath = path.join(LOCAL_UPLOAD_DIR, storagePath);
    try {
      await fs.unlink(fullPath);
    } catch (e) {
      console.error(`[VaultStorage] Error deleting local file:`, e);
    }
    return null;
  }
}

export async function downloadFromVault(storagePath: string): Promise<Buffer> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(storagePath);

    if (error || !data) {
      throw error || new Error('No data received from Supabase');
    }
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error: any) {
    console.warn(`[VaultStorage] Supabase download failed for ${storagePath}, falling back to local storage:`, error?.message);
    const fullPath = path.join(LOCAL_UPLOAD_DIR, storagePath);
    try {
      const fileBuffer = await fs.readFile(fullPath);
      return fileBuffer;
    } catch (e: any) {
      throw new Error(`Failed to download document from both Supabase and local storage: ${e.message}`);
    }
  }
}
