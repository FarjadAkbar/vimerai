/**
 * Storage service interface for file uploads.
 * Allows switching between different storage providers (local, S3, R2, etc.)
 */
export interface IStorageService {
  /**
   * Upload a file to storage
   * @param key - Unique identifier/key for the file (e.g., "videos/video_123.mp4")
   * @param buffer - File content as Buffer
   * @param contentType - MIME type (e.g., "video/mp4")
   * @returns Public URL to access the file
   */
  upload(key: string, buffer: Buffer, contentType: string): Promise<string>;

  /**
   * Delete a file from storage
   * @param key - Unique identifier/key for the file
   */
  delete(key: string): Promise<void>;

  /**
   * Get the public URL for a file (without uploading)
   * @param key - Unique identifier/key for the file
   * @returns Public URL to access the file
   */
  getUrl(key: string): string;
}

