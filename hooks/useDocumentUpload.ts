import AsyncStorage from '@react-native-async-storage/async-storage';
import {showToast} from '@utils/showToast';
import * as FileSystem from 'expo-file-system/legacy';
import {useCallback, useEffect, useState} from 'react';

export interface DocumentFile {
  uri: string;
  name: string;
  size: number;
  base64?: string;
  extension?: string;
  mimeType?: string;
  isUploaded?: boolean;
  isUploading?: boolean;
  uploadSuccess?: boolean;
  id?: string; // Unique identifier for each file
  serverFileId?: string; // ID returned from server after upload
  isLocalFileDeleted?: boolean; // Track if the local file has already been deleted
}

export interface UseDocumentUploadReturn {
  // File states
  selectedFiles: DocumentFile[];
  isLoading: boolean;
  isUploading: boolean;

  // File actions
  handleFileSelected: (file: DocumentFile) => void;
  handleFileRemoved: (fileIndex: number) => void;
  handleUpload: (
    uploadFunction: (file: DocumentFile) => Promise<any>,
    delayMs?: number,
    transactionId?: string,
  ) => Promise<boolean>;

  // Utility functions
  isValidFileType: (mimeType: string, allowedTypes: string[]) => boolean;

  // State reset
  resetState: () => void;

  // Check for previous uploads
  checkPreviousUploads: (transactionId: string) => Promise<void>;

  // Clear previous uploads
  clearPreviousUploads: (transactionId: string) => Promise<void>;
}

/**
 * Custom hook for document file upload management with multiple file support
 */
export function useDocumentUpload(): UseDocumentUploadReturn {
  const [selectedFiles, setSelectedFiles] = useState<DocumentFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Generate a storage key for a specific transaction
  const getStorageKey = (transactionId: string) =>
    `uploaded_files_${transactionId}`;

  // Safely delete a file if it exists
  const safelyDeleteFile = useCallback(
    async (uri: string): Promise<boolean> => {
      try {
        // First check if file exists
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(uri, {idempotent: true});
          return true;
        }
        return false; // File didn't exist
      } catch (error) {
        console.error('Error safely deleting file:', error);
        return false;
      }
    },
    [],
  );

  // Clean up temporary files - only delete files that exist and weren't already deleted
  // This should typically only be called after server upload or on unmount
  const cleanupTemporaryFiles = useCallback(
    async (filesToClean?: DocumentFile[]) => {
      const files = filesToClean || selectedFiles;

      for (const file of files) {
        if (file?.uri && !file.isLocalFileDeleted) {
          const deleted = await safelyDeleteFile(file.uri);
          if (deleted) {
            // Mark file as deleted in the state if it's in the current selection
            setSelectedFiles(prevFiles =>
              prevFiles.map(f =>
                f.id === file.id ? {...f, isLocalFileDeleted: true} : f,
              ),
            );
          }
        }
      }
    },
    [selectedFiles, safelyDeleteFile],
  );

  // Check if files have been previously uploaded for this transaction
  const checkPreviousUploads = useCallback(async (transactionId: string) => {
    try {
      setIsLoading(true);
      const storageKey = getStorageKey(transactionId);
      const storedData = await AsyncStorage.getItem(storageKey);

      if (storedData) {
        const uploadedFiles = JSON.parse(storedData);

        if (uploadedFiles && uploadedFiles.length > 0) {
          // Just mark the files as uploaded in the state
          // Don't add isLocalFileDeleted since we're not creating local files for stored uploads
          setSelectedFiles(
            uploadedFiles.map((file: DocumentFile) => ({
              ...file,
              isUploaded: true,
              uploadSuccess: true,
              isLocalFileDeleted: true, // Mark as deleted since we don't want to try deleting these
              // Remove base64 data to save memory - it's already uploaded
              base64: undefined,
            })),
          );

          showToast('', 'Өмнө илгээсэн файлууд ачаалагдлаа', 'info');
        }
      }
    } catch (error) {
      console.error('Error checking previous uploads:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear previous uploads for a transaction
  const clearPreviousUploads = useCallback(async (transactionId: string) => {
    try {
      const storageKey = getStorageKey(transactionId);
      await AsyncStorage.removeItem(storageKey);
      // Clear any files in state as well
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error clearing previous uploads:', error);
    }
  }, []);

  // Save uploaded files to storage
  const saveUploadedFiles = useCallback(
    async (transactionId: string, files: DocumentFile[]) => {
      try {
        // Only save files that have been successfully uploaded
        const uploadedFiles = files.filter(
          file => file.isUploaded && file.uploadSuccess,
        );

        if (uploadedFiles.length > 0) {
          // Remove base64 data before storing to save space
          const filesToStore = uploadedFiles.map(file => ({
            ...file,
            base64: undefined,
            isLocalFileDeleted: true, // Mark as deleted since we're storing references only
          }));

          const storageKey = getStorageKey(transactionId);
          await AsyncStorage.setItem(storageKey, JSON.stringify(filesToStore));
        }
      } catch (error) {
        console.error('Error saving uploaded files:', error);
      }
    },
    [],
  );

  // Generate a unique ID for each file
  const generateFileId = useCallback(() => {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
  }, []);

  // Handle file selection
  const handleFileSelected = useCallback(
    (file: DocumentFile) => {
      setSelectedFiles(prevFiles => [
        ...prevFiles,
        {
          ...file,
          id: generateFileId(),
          isUploaded: false,
          isUploading: false,
          uploadSuccess: false,
          isLocalFileDeleted: false,
        },
      ]);
    },
    [generateFileId],
  );

  // Handle file removal by index
  const handleFileRemoved = useCallback(async (fileIndex: number) => {
    // Simply remove the file from the state without deleting it
    // The temporary file will be cleaned up either on successful upload or when the component unmounts
    setSelectedFiles(prevFiles =>
      prevFiles.filter((_, index) => index !== fileIndex),
    );
  }, []);

  // Handle file upload with retry mechanism for multiple files
  const handleUpload = useCallback(
    async (
      uploadFunction: (file: DocumentFile) => Promise<any>,
      delayMs: number = 500,
      transactionId?: string,
    ): Promise<boolean> => {
      if (selectedFiles.length === 0) {
        showToast('Анхааруулга', 'Файл сонгоогүй байна', 'error');
        return false;
      }

      // Skip files that have already been uploaded successfully
      const filesToUpload = selectedFiles.filter(
        file => !(file.isUploaded && file.uploadSuccess),
      );

      if (filesToUpload.length === 0) {
        // All files are already uploaded
        showToast('', 'Бүх файл илгээгдсэн байна', 'success');
        return true;
      }

      setIsUploading(true);
      let allUploadsSuccessful = true;
      const successfullyUploadedFiles: DocumentFile[] = [];

      try {
        // Upload each file one by one with visual feedback
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];

          // Skip files that have already been uploaded successfully
          if (file.isUploaded && file.uploadSuccess) {
            continue;
          }

          // Mark current file as uploading
          setSelectedFiles(prevFiles =>
            prevFiles.map((f, index) =>
              index === i ? {...f, isUploading: true} : f,
            ),
          );

          // Add a small delay for better visual feedback
          if (i > 0) {
            await new Promise(resolve => global.setTimeout(resolve, delayMs));
          }

          try {
            // Execute the upload function provided by the parent component
            const response = await uploadFunction(file);

            // Track this file for deletion after successful upload
            const updatedFile = {
              ...file,
              isUploading: false,
              isUploaded: true,
              uploadSuccess: true,
              serverFileId: response?.id || response?.fileId || undefined,
            };

            successfullyUploadedFiles.push(updatedFile);

            // Mark file as successfully uploaded in state
            setSelectedFiles(prevFiles =>
              prevFiles.map((f, index) => (index === i ? updatedFile : f)),
            );

            // NOW is the time to delete the local file - after successful upload to server
            if (file.uri && !file.isLocalFileDeleted) {
              const deleted = await safelyDeleteFile(file.uri);
              if (deleted) {
                // Update state to mark file as deleted
                setSelectedFiles(prevFiles =>
                  prevFiles.map((f, index) =>
                    index === i
                      ? {...updatedFile, isLocalFileDeleted: true}
                      : f,
                  ),
                );
              }
            }
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);

            // Mark file as failed
            setSelectedFiles(prevFiles =>
              prevFiles.map((f, index) =>
                index === i
                  ? {
                      ...f,
                      isUploading: false,
                      isUploaded: true,
                      uploadSuccess: false,
                    }
                  : f,
              ),
            );

            allUploadsSuccessful = false;
          }

          // Add a small delay after each file upload for better visual feedback
          await new Promise(resolve => global.setTimeout(resolve, delayMs));
        }

        // If all uploads were successful and we have a transaction ID, save to storage
        if (allUploadsSuccessful && transactionId) {
          await saveUploadedFiles(transactionId, selectedFiles);
        }

        if (!allUploadsSuccessful) {
          showToast(
            'Анхааруулга',
            'Зарим файл байршуулахад алдаа гарлаа',
            'error',
          );
        }

        return allUploadsSuccessful;
      } catch (error) {
        console.error('Error in upload process:', error);
        showToast(
          'Анхааруулга',
          'Файл байршуулахад алдаа гарлаа. Дахин оролдоно уу.',
          'error',
        );
        return false;
      } finally {
        setIsUploading(false);
      }
    },
    [selectedFiles, saveUploadedFiles, safelyDeleteFile],
  );

  // Check if file type is allowed
  const isValidFileType = useCallback(
    (mimeType: string, allowedTypes: string[]): boolean => {
      // If allowedTypes includes '*/*', all file types are allowed
      if (allowedTypes.includes('*/*')) return true;

      // Try to match by exact mime type
      if (allowedTypes.includes(mimeType)) return true;

      // Try to match by file extension for common types
      const getExtensionFromMimeType = (mime: string): string | null => {
        const mimeToExtension: Record<string, string> = {
          'application/pdf': 'pdf',
          'application/vnd.ms-excel': 'xls',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            'xlsx',
          'application/msword': 'doc',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            'docx',
          'text/csv': 'csv',
        };
        return mimeToExtension[mime] || null;
      };

      const extension = getExtensionFromMimeType(mimeType);
      if (extension) {
        // Map extensions to mime types
        const extensionToMimeType: Record<string, string[]> = {
          pdf: ['application/pdf'],
          xls: ['application/vnd.ms-excel'],
          xlsx: [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ],
          doc: ['application/msword'],
          docx: [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],
          csv: ['text/csv', 'application/vnd.ms-excel', 'text/plain'],
        };

        const possibleMimeTypes = extensionToMimeType[extension];
        if (possibleMimeTypes) {
          for (const possibleType of possibleMimeTypes) {
            if (allowedTypes.includes(possibleType)) return true;
          }
        }
      }

      return false;
    },
    [],
  );

  // Reset all state
  const resetState = useCallback(async () => {
    // We'll only clear the state but not delete the files
    // Files will be cleaned up when component unmounts or on successful upload
    setSelectedFiles([]);
    setIsLoading(false);
    setIsUploading(false);
  }, []);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Use a self-invoking async function for cleanup on unmount
      (async () => {
        // Only clean up files that haven't been deleted yet
        const filesToClean = selectedFiles.filter(
          file => !file.isLocalFileDeleted,
        );

        if (filesToClean.length > 0) {
          await cleanupTemporaryFiles(filesToClean);
        }
      })();
    };
  }, [selectedFiles, cleanupTemporaryFiles]);

  return {
    selectedFiles,
    isLoading,
    isUploading,
    handleFileSelected,
    handleFileRemoved,
    handleUpload,
    isValidFileType,
    resetState,
    checkPreviousUploads,
    clearPreviousUploads,
  };
}
