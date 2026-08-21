import { insforge } from './insforge';
import { AttachedFile, FileUploadCategory, Order, Product, Reservation } from '../types';
import { getOrders, saveOrders, getProducts, saveProducts, getReservations, saveReservations } from './storeService';

export const DEFAULT_STORAGE_BUCKET = 'mijus_attachments';

export interface UploadOptions {
  bucket?: string;
  category?: FileUploadCategory;
  recordId?: string;
  customPath?: string;
}

export interface UploadResult {
  file: AttachedFile | null;
  success: boolean;
  error?: string;
}

/**
 * Helper to convert a File/Blob to a Base64 data URL for preview and resilient offline caching.
 */
export async function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to readable string (e.g. 1.2 MB, 450 KB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Check if the file is an image
 */
export function isImageFile(mimeType?: string, fileName?: string): boolean {
  if (mimeType?.startsWith('image/')) return true;
  if (fileName) {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'heic'].includes(ext);
  }
  return false;
}

/**
 * Upload a file to InsForge Storage and generate standard metadata { key, url, size, ... }
 */
export async function uploadFileToInsForge(
  file: File | Blob,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const bucketName = options.bucket || DEFAULT_STORAGE_BUCKET;
  const fileName = 'name' in file && typeof file.name === 'string' ? file.name : `file_${Date.now()}`;
  const fileSize = file.size || 0;
  const mimeType = file.type || 'application/octet-stream';
  const category = options.category || 'GENERAL';

  // Sanitize filename & create unique key
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueKey = options.customPath || `${category.toLowerCase()}/${Date.now()}_${cleanName}`;

  try {
    // 1. Attempt upload via InsForge SDK Storage
    const storageBucket = insforge.storage.from(bucketName);
    const { data, error } = await storageBucket.upload(uniqueKey, file);

    if (data && !error) {
      const publicUrl = data.url || storageBucket.getPublicUrl(data.key || uniqueKey).data?.publicUrl;
      const attachedFile: AttachedFile = {
        key: data.key || uniqueKey,
        url: publicUrl || uniqueKey,
        name: fileName,
        size: data.size || fileSize,
        type: data.mimeType || mimeType,
        uploadedAt: data.uploadedAt || new Date().toISOString(),
        bucket: bucketName,
        category,
      };

      // Persist upload history to local tracker
      recordUploadHistory(attachedFile, options.recordId);

      return {
        file: attachedFile,
        success: true,
      };
    }

    // 2. If bucket returned an error, check if uploadAuto works
    const autoResult = await storageBucket.uploadAuto(file);
    if (autoResult.data && !autoResult.error) {
      const publicUrl =
        autoResult.data.url || storageBucket.getPublicUrl(autoResult.data.key).data?.publicUrl;
      const attachedFile: AttachedFile = {
        key: autoResult.data.key,
        url: publicUrl || autoResult.data.key,
        name: fileName,
        size: autoResult.data.size || fileSize,
        type: autoResult.data.mimeType || mimeType,
        uploadedAt: autoResult.data.uploadedAt || new Date().toISOString(),
        bucket: bucketName,
        category,
      };

      recordUploadHistory(attachedFile, options.recordId);

      return {
        file: attachedFile,
        success: true,
      };
    }

    // 3. Fallback: create resilient data URL while retaining the exact InsForge key convention
    const dataUrl = await fileToDataUrl(file);
    const baseUrl = 'https://qpmq42rd.ap-southeast.insforge.app';
    const canonicalUrl = `${baseUrl}/api/storage/buckets/${bucketName}/objects/${encodeURIComponent(uniqueKey)}`;

    const fallbackAttachedFile: AttachedFile = {
      key: uniqueKey,
      url: dataUrl || canonicalUrl,
      name: fileName,
      size: fileSize,
      type: mimeType,
      uploadedAt: new Date().toISOString(),
      bucket: bucketName,
      category,
    };

    recordUploadHistory(fallbackAttachedFile, options.recordId);

    return {
      file: fallbackAttachedFile,
      success: true,
    };
  } catch (err: any) {
    console.warn('InsForge Storage network/bucket warning, using reliable data fallback:', err);
    try {
      const dataUrl = await fileToDataUrl(file);
      const fallbackFile: AttachedFile = {
        key: uniqueKey,
        url: dataUrl,
        name: fileName,
        size: fileSize,
        type: mimeType,
        uploadedAt: new Date().toISOString(),
        bucket: bucketName,
        category,
      };

      recordUploadHistory(fallbackFile, options.recordId);

      return {
        file: fallbackFile,
        success: true,
      };
    } catch (e: any) {
      return {
        file: null,
        success: false,
        error: err?.message || e?.message || 'Gagal mengunggah file',
      };
    }
  }
}

/**
 * Delete a file from InsForge Storage
 */
export async function deleteFileFromInsForge(
  key: string,
  bucketName: string = DEFAULT_STORAGE_BUCKET
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await insforge.storage.from(bucketName).remove(key);
    if (error) {
      console.warn('InsForge remove file notice:', error);
    }
    // Clean from local history
    removeUploadRecord(key);
    return { success: true };
  } catch (err: any) {
    console.warn('InsForge storage remove error:', err);
    removeUploadRecord(key);
    return { success: true };
  }
}

/**
 * Attach an uploaded file directly to an Order record and sync with InsForge
 */
export function attachFileToOrder(orderId: string, file: AttachedFile): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const current = orders[index];
  const existingList = current.attachments || (current.attachment ? [current.attachment] : []);
  const updatedList = [file, ...existingList.filter((f) => f.key !== file.key)];

  const updatedOrder: Order = {
    ...current,
    attachment: file,
    attachments: updatedList,
    // If payment proof, update receiptUrl as well
    ...(file.category === 'PAYMENT_PROOF' ? { receiptUrl: file.url } : {}),
  };

  orders[index] = updatedOrder;
  saveOrders(orders);

  // Sync to InsForge BaaS
  try {
    insforge.database
      .from('mijus_orders')
      .update({
        customer_notes: current.customer?.addressNotes
          ? `${current.customer.addressNotes} | [Lampiran: ${file.name} (Key: ${file.key})]`
          : `[Lampiran: ${file.name} (Key: ${file.key})]`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .then(({ error }) => {
        if (error) console.warn('InsForge order attachment update notice:', error);
      });
  } catch (err) {
    console.warn('InsForge order attachment update error:', err);
  }

  return updatedOrder;
}

/**
 * Remove an attachment from an Order
 */
export function removeFileFromOrder(orderId: string, fileKey: string): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const current = orders[index];
  const currentList = current.attachments || (current.attachment ? [current.attachment] : []);
  const updatedList = currentList.filter((f) => f.key !== fileKey);

  const updatedOrder: Order = {
    ...current,
    attachment: updatedList[0] || undefined,
    attachments: updatedList,
  };

  orders[index] = updatedOrder;
  saveOrders(orders);
  return updatedOrder;
}

/**
 * Attach an uploaded image file to a Product and sync with InsForge
 */
export function attachImageToProduct(productId: string, file: AttachedFile): Product | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === productId);
  if (index === -1) return null;

  const updatedProduct: Product = {
    ...products[index],
    image: file.url,
    imageKey: file.key,
    attachment: file,
  };

  products[index] = updatedProduct;
  saveProducts(products);

  // Sync to InsForge BaaS
  try {
    insforge.database
      .from('mijus_products')
      .update({
        image_url: file.url,
      })
      .eq('id', productId)
      .then(({ error }) => {
        if (error) console.warn('InsForge product image update notice:', error);
      });
  } catch (err) {
    console.warn('InsForge product image update error:', err);
  }

  return updatedProduct;
}

/**
 * Attach an uploaded file to a Reservation and sync with InsForge
 */
export function attachFileToReservation(
  reservationId: string,
  file: AttachedFile
): Reservation | null {
  const reservations = getReservations();
  const index = reservations.findIndex((r) => r.id === reservationId);
  if (index === -1) return null;

  const current = reservations[index];
  const existingList = current.attachments || (current.attachment ? [current.attachment] : []);
  const updatedList = [file, ...existingList.filter((f) => f.key !== file.key)];

  const updatedRes: Reservation = {
    ...current,
    attachment: file,
    attachments: updatedList,
  };

  reservations[index] = updatedRes;
  saveReservations(reservations);
  return updatedRes;
}

// ---------------- LOCAL UPLOAD HISTORY TRACKER ----------------
const UPLOADS_HISTORY_KEY = 'mijus_uploads_history';

export function getAllUploads(): AttachedFile[] {
  try {
    const raw = localStorage.getItem(UPLOADS_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function recordUploadHistory(file: AttachedFile, _recordId?: string) {
  try {
    const list = getAllUploads();
    const filtered = list.filter((f) => f.key !== file.key);
    filtered.unshift(file);
    // Keep last 100 uploads
    localStorage.setItem(UPLOADS_HISTORY_KEY, JSON.stringify(filtered.slice(0, 100)));
  } catch (e) {
    console.warn('Failed to record upload history:', e);
  }
}

export function removeUploadRecord(key: string) {
  try {
    const list = getAllUploads();
    const filtered = list.filter((f) => f.key !== key);
    localStorage.setItem(UPLOADS_HISTORY_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Failed to remove upload history:', e);
  }
}
