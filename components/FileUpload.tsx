import CarLoanProgressBar from '@components/CarLoanProgressBar';
import SvgIcon from '@components/SvgIcon';
import {Entypo} from '@expo/vector-icons';
import {showToast} from '@utils/showToast';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Define types for file images
export interface FileImage {
  id: string;
  name: string;
  uri: string | null;
  size: string;
  status: UploadStatus;
  message?: string;
  typeId?: number;
  uploadSuccess?: boolean; // Track if upload was successful
  required?: boolean; // Track if this file is required
}

export type UploadStatus = 'success' | 'uploading' | 'error' | 'empty';

// Custom hook for file upload
export function useFileUpload(
  typeId: number,
  fileNamePrefix: string,
  onFilesChange?: (files: FileImage[]) => void,
) {
  const [files, setFiles] = useState<FileImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allRequiredFilesUploaded, setAllRequiredFilesUploaded] =
    useState(false);

  // Helper function to check if all required files have been uploaded
  const checkAllRequiredFilesUploaded = useCallback(
    (filesList: FileImage[]) => {
      const requiredFiles = filesList.filter(file => file.required);
      // If there are no required files, we consider all requirements met
      if (requiredFiles.length === 0) return true;

      // Check if all required files have status 'success'
      return requiredFiles.every(file => file.status === 'success');
    },
    [],
  );

  // Initialize files from API data
  const initializeFiles = useCallback(
    (apiData: any[]) => {
      try {
        if (apiData && apiData.length > 0) {
          // Filter by the specified type ID
          const filteredData = apiData.filter(type => type.TYPE_ID === typeId);

          // Map API data to our FileImage interface
          const mappedImages: FileImage[] = filteredData.map(type => ({
            id: type.FILE_TYPE,
            name: type.DESCR,
            uri: null,
            size: 'Хоосон',
            status: 'empty' as UploadStatus,
            typeId: type.TYPE_ID,
            required: true, // Set required flag based on API data
          }));

          setFiles(mappedImages);
          // Check if all required files are uploaded (initially they aren't)
          setAllRequiredFilesUploaded(
            checkAllRequiredFilesUploaded(mappedImages),
          );
        }
      } catch (error) {
        console.error('Error mapping image types:', error);
      } finally {
        setLoading(false);
      }
    },
    [typeId, checkAllRequiredFilesUploaded],
  );

  // Restore files from saved data
  const restoreFiles = useCallback(
    (apiData: any[], savedImages: any[]) => {
      try {
        if (apiData && apiData.length > 0) {
          // Filter by the specified type ID
          const filteredData = apiData.filter(type => type.TYPE_ID === typeId);

          // Map API data to our FileImage interface
          const mappedImages: FileImage[] = filteredData.map(type => {
            // Check if we have saved data for this file type
            const savedImage = savedImages.find(
              saved => saved.id === type.FILE_TYPE,
            );

            if (savedImage && savedImage.uri) {
              // Restore the saved image
              return {
                id: type.FILE_TYPE,
                name: type.DESCR,
                uri: savedImage.uri,
                size: savedImage.size || 'Хоосон',
                status: 'success' as UploadStatus,
                typeId: type.TYPE_ID,
                required: true,
                uploadSuccess: savedImage.uploadSuccess,
              };
            } else {
              // No saved data, create empty file
              return {
                id: type.FILE_TYPE,
                name: type.DESCR,
                uri: null,
                size: 'Хоосон',
                status: 'empty' as UploadStatus,
                typeId: type.TYPE_ID,
                required: true,
              };
            }
          });

          setFiles(mappedImages);
          // Check if all required files are uploaded
          setAllRequiredFilesUploaded(
            checkAllRequiredFilesUploaded(mappedImages),
          );
        }
      } catch (error) {
        console.error('Error restoring files:', error);
      } finally {
        setLoading(false);
      }
    },
    [typeId, checkAllRequiredFilesUploaded],
  );

  // Update file status and check if all required files are uploaded
  const updateFileStatus = useCallback(
    (id: string, status: UploadStatus, message: string = '') => {
      setFiles(prevFiles => {
        const updatedFiles = prevFiles.map(file =>
          file.id === id ? {...file, status, message} : file,
        );

        // Check if all required files are uploaded after the update
        setAllRequiredFilesUploaded(
          checkAllRequiredFilesUploaded(updatedFiles),
        );

        // Call the callback if provided
        if (onFilesChange) {
          onFilesChange(updatedFiles);
        }

        return updatedFiles;
      });
    },
    [checkAllRequiredFilesUploaded, onFilesChange],
  );

  // Process the selected image
  const handleProcessImage = useCallback(
    (uri: string, id: string) => {
      processImage(
        uri,
        fileNamePrefix,
        progress => {
          // Update progress in the UI
          setFiles(prevFiles =>
            prevFiles.map(file =>
              file.id === id && file.status === 'uploading'
                ? {...file, size: progress}
                : file,
            ),
          );
        },
        (processedUri, fileSize) => {
          // Update file status after successful processing
          setFiles(prevFiles => {
            const updatedFiles = prevFiles.map(file =>
              file.id === id
                ? {
                    ...file,
                    uri: processedUri,
                    size: fileSize,
                    status: 'success' as UploadStatus,
                    uploadSuccess: undefined,
                  }
                : file,
            );

            // Check if all required files are uploaded after the update
            setAllRequiredFilesUploaded(
              checkAllRequiredFilesUploaded(updatedFiles),
            );

            // Call the callback if provided
            if (onFilesChange) {
              onFilesChange(updatedFiles);
            }

            return updatedFiles;
          });
        },
        error => {
          console.error('Error processing image:', error);
          updateFileStatus(id, 'error', 'Боловсруулах үед алдаа гарлаа');
        },
      );
    },
    [fileNamePrefix, updateFileStatus, checkAllRequiredFilesUploaded],
  );

  // Pick image from camera
  const handlePickFromCamera = useCallback(
    async (id: string) => {
      try {
        // Request camera permissions first
        const {status: cameraPermission} =
          await ImagePicker.requestCameraPermissionsAsync();
        const {status: mediaLibraryPermission} =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          cameraPermission !== 'granted' ||
          mediaLibraryPermission !== 'granted'
        ) {
          showToast('Анхааруулга', 'Камерын зөвшөөрөл олгоогүй байна', 'error');
          return;
        }

        pickImageFromCamera(
          () => updateFileStatus(id, 'uploading', ''),
          uri => handleProcessImage(uri, id),
          error => {
            console.error('Error picking image from camera:', error);
            updateFileStatus(id, 'error', 'Алдаа гарлаа');
          },
        );
      } catch (error) {
        console.error('Error requesting camera permissions:', error);
        updateFileStatus(id, 'error', 'Камерын зөвшөөрөл авахад алдаа гарлаа');
      }
    },
    [handleProcessImage, updateFileStatus],
  );

  // Pick image from gallery
  const handlePickFromGallery = useCallback(
    async (id: string) => {
      try {
        // Request media library permissions
        const {status} =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
          showToast(
            'Анхааруулга',
            'Зургийн сангийн зөвшөөрөл олгоогүй байна',
            'error',
          );
          return;
        }

        pickImageFromGallery(
          () => updateFileStatus(id, 'uploading', ''),
          uri => handleProcessImage(uri, id),
          error => {
            console.error('Error picking image from gallery:', error);
            updateFileStatus(id, 'error', 'Алдаа гарлаа');
          },
        );
      } catch (error) {
        console.error('Error requesting gallery permissions:', error);
        updateFileStatus(
          id,
          'error',
          'Зургийн сангийн зөвшөөрөл авахад алдаа гарлаа',
        );
      }
    },
    [handleProcessImage, updateFileStatus],
  );

  // Handle file selection
  const handleFileSelection = useCallback(
    (id: string) => {
      const fileIndex = files.findIndex(file => file.id === id);
      if (fileIndex === -1) return;

      // Show image source options
      showImageSourceOptions(
        () => handlePickFromCamera(id),
        () => handlePickFromGallery(id),
      );
    },
    [files, handlePickFromCamera, handlePickFromGallery],
  );

  // Delete file
  const handleDeleteFile = useCallback(
    (id: string) => {
      // Show confirmation dialog
      showDeleteConfirmation(async () => {
        try {
          const fileIndex = files.findIndex(file => file.id === id);
          if (fileIndex === -1) return;

          const file = files[fileIndex];

          // Delete file if exists
          if (file.uri) {
            const fileInfo = await FileSystem.getInfoAsync(file.uri);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(file.uri);
            }
          }

          // Reset file state
          setFiles(prevFiles => {
            const updatedFiles = prevFiles.map(f =>
              f.id === id
                ? {
                    ...f,
                    uri: null,
                    size: 'Хоосон',
                    status: 'empty' as UploadStatus,
                    message: undefined,
                    uploadSuccess: undefined,
                  }
                : f,
            );

            // Check if all required files are uploaded after deletion
            setAllRequiredFilesUploaded(
              checkAllRequiredFilesUploaded(updatedFiles),
            );

            // Call the callback if provided
            if (onFilesChange) {
              onFilesChange(updatedFiles);
            }

            return updatedFiles;
          });
        } catch (error) {
          console.error('Error deleting file:', error);
          showToast('Анхааруулга', 'Зураг устгах үед алдаа гарлаа', 'error');
        }
      });
    },
    [files, checkAllRequiredFilesUploaded],
  );

  // Cancel upload
  const handleCancelUpload = useCallback(
    (id: string) => {
      updateFileStatus(id, 'empty', '');
    },
    [updateFileStatus],
  );

  // Mark file as successfully uploaded
  const markFileUploaded = useCallback(
    (id: string, success: boolean) => {
      setFiles(prevFiles => {
        const updatedFiles = prevFiles.map(file =>
          file.id === id ? {...file, uploadSuccess: success} : file,
        );

        // Check if all required files are uploaded
        setAllRequiredFilesUploaded(
          checkAllRequiredFilesUploaded(updatedFiles),
        );

        // Call the callback if provided
        if (onFilesChange) {
          onFilesChange(updatedFiles);
        }

        return updatedFiles;
      });
    },
    [checkAllRequiredFilesUploaded, onFilesChange],
  );

  // Get files ready for upload
  const getFilesForUpload = useCallback(() => {
    return files
      .filter(file => file.status === 'success' && file.uri)
      .map(file => ({
        id: file.id,
        uri: file.uri,
        typeId: file.typeId || typeId,
        name: file.name,
        uploadSuccess: file.uploadSuccess,
      }));
  }, [files, typeId]);

  // Clean up files
  const cleanupFiles = useCallback(async () => {
    try {
      const uploadedFiles = files
        .filter(file => file.uploadSuccess && file.uri)
        .map(file => file.uri);

      // Delete successfully uploaded files
      await Promise.all(
        uploadedFiles.map(async uri => {
          if (uri) {
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(uri);
            }
          }
        }),
      );

      // Also run the general cache cleanup
      await cleanupTemporaryFiles(fileNamePrefix);
    } catch (error) {
      console.error('Error cleaning up files:', error);
    }
  }, [files, fileNamePrefix]);

  return {
    files,
    loading,
    isSubmitting,
    setLoading,
    setIsSubmitting,
    initializeFiles,
    restoreFiles,
    updateFileStatus,
    handleFileSelection,
    handleDeleteFile,
    handleCancelUpload,
    markFileUploaded,
    getFilesForUpload,
    cleanupFiles,
    allRequiredFilesUploaded, // Export this state to parent components
  };
}

export interface FileUploadProps {
  id: string;
  name: string;
  size: string;
  status: UploadStatus;
  message?: string;
  uri?: string | null;
  onUpload: () => void;
  onDelete: () => void;
  onCancel: () => void;
  uploadSuccess?: boolean;
  themeColor?: string; // Allow customization of theme color
  progressBarColor?: string; // Allow customization of progress bar color
  iconName?: string; // Allow customization of icon
}

// Individual upload item component
export function FileUploadItem({
  id,
  name,
  size,
  status,
  message,
  uri,
  onUpload,
  onDelete,
  onCancel,
  uploadSuccess,
  themeColor = '#00C7EB', // Default to car loan theme
  progressBarColor,
  iconName = 'upload',
}: FileUploadProps) {
  let icon = null;
  let textColor = 'text-white';
  let border = 'border border-bgSecondary';
  let bg = 'bg-[#1C222B]';

  switch (status) {
    case 'success':
      icon = <SvgIcon name="caruploadcheck" height={20} width={20} />;
      if (uploadSuccess) {
        border = `border border-green-500`;
      } else {
        border = `border border-${themeColor === '#00C7EB' ? 'cyan-400' : '[#FFDA7E]'}`;
      }
      break;
    case 'uploading':
      icon = (
        <SvgIcon
          name={themeColor === '#00C7EB' ? 'carloading' : 'houseloading'}
          height={20}
          width={20}
        />
      );
      border = `border border-${themeColor === '#00C7EB' ? 'cyan-400' : '[#FFDA7E]'}`;
      break;
    case 'error':
      icon = <Entypo name="warning" size={20} color="red" />;
      textColor = 'text-red-500';
      break;
    case 'empty':
      icon = <View className="h-5 w-5 rounded-full border border-gray-400" />;
      break;
  }

  // Calculate progress based on size string (if in percentage)
  const progressValue =
    status === 'uploading' && size.includes('%')
      ? parseInt(size.replace('%', ''), 10) / 100
      : 0.4;

  return (
    <TouchableOpacity
      onPress={onUpload}
      disabled={status === 'success' || status === 'uploading'}
      className={`mb-2 flex-row items-center justify-between rounded-xl p-3 ${bg} ${border}`}>
      <View className="flex-1 flex-row items-center pl-3">
        {icon}
        <View className="ml-4 mr-3 mt-1 h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-bgPrimary">
          {uri ? (
            <Image source={{uri}} className="h-10 w-10" />
          ) : (
            <SvgIcon name={iconName} />
          )}
        </View>
        <View className="-mt-1 flex-1">
          <Text className={`text-sm ${textColor}`}>{name}</Text>
          {status === 'uploading' ? (
            <View className="w-[80%]">
              <CarLoanProgressBar
                progress={progressValue}
                min={0}
                max={1}
                barColor={progressBarColor || themeColor}
              />
              <Text className="mt-1 text-xs text-gray-400">{size}</Text>
            </View>
          ) : (
            <Text className={`mt-2 text-xs ${textColor}`}>
              {status === 'error'
                ? message
                : uploadSuccess && status === 'success'
                  ? 'Амжилттай хадгалагдсан'
                  : size}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        className="p-3"
        onPress={
          status === 'success'
            ? onDelete
            : status === 'uploading'
              ? onCancel
              : onUpload
        }>
        {status === 'success' ? (
          <SvgIcon name="trash" height={20} width={16} />
        ) : status === 'uploading' ? (
          <SvgIcon name="stop" height={20} width={20} />
        ) : (
          status === 'empty' && null
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

interface FileUploadManagerProps {
  fileTypes: FileImage[];
  onFileSelect: (id: string) => void;
  onFileDelete: (id: string) => void;
  onFileCancel: (id: string) => void;
  themeColor?: string;
  progressBarColor?: string;
  iconName?: string;
  loading?: boolean;
}

// Main file upload manager component
export function FileUploadManager({
  fileTypes,
  onFileSelect,
  onFileDelete,
  onFileCancel,
  themeColor = '#00C7EB',
  progressBarColor,
  iconName = 'upload',
  loading = false,
}: FileUploadManagerProps) {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={themeColor} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {fileTypes.map(file => (
        <FileUploadItem
          key={file.id}
          id={file.id}
          name={file.name}
          size={file.size}
          status={file.status}
          message={file.message}
          uri={file.uri}
          onUpload={() => onFileSelect(file.id)}
          onDelete={() => onFileDelete(file.id)}
          onCancel={() => onFileCancel(file.id)}
          uploadSuccess={file.uploadSuccess}
          themeColor={themeColor}
          progressBarColor={progressBarColor}
          iconName={iconName}
        />
      ))}
    </View>
  );
}

// Helper function to upload files with retry logic
export const uploadFileWithRetry = async (
  file: any,
  uploadFn: (file: any) => Promise<any>,
  onStatusUpdate: (id: string, status: UploadStatus, message: string) => void,
  onSuccess: (id: string) => void,
  maxRetries = 2,
) => {
  const {id} = file;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Skip already successfully uploaded files
      if (file.uploadSuccess) {
        return true;
      }

      // If this is a retry attempt, update status
      if (attempt > 0) {
        onStatusUpdate(
          id,
          'uploading',
          `Дахин оролдож байна (${attempt}/${maxRetries})`,
        );
      }

      const result = await uploadFn(file);

      if (!result) {
        // If upload failed but we have retries left, continue to next attempt
        if (attempt === maxRetries) {
          onStatusUpdate(id, 'error', 'Серверт хадгалах үед алдаа гарлаа');
          return false;
        }
        continue;
      }

      // Mark as successfully uploaded
      onSuccess(id);
      return true;
    } catch (error) {
      console.error(
        `Error uploading file ${id}, attempt ${attempt + 1}:`,
        error,
      );

      // If we're out of retries, mark as failed
      if (attempt === maxRetries) {
        onStatusUpdate(id, 'error', 'Серверт хадгалах үед алдаа гарлаа');
        return false;
      }
      // Otherwise, we'll retry in the next iteration
    }
  }
  return false; // This should never be reached due to returns in the loop
};

// Helper functions for image handling
export const pickImageFromCamera = async (
  onStart: () => void,
  onSuccess: (uri: string) => void,
  onError: (error: any) => void,
) => {
  try {
    onStart();
    // Launch camera with options
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Reduced quality to keep file size under 2MB
    });

    if (!result.canceled) {
      onSuccess(result.assets[0].uri);
    }
  } catch (error) {
    onError(error);
  }
};

export const pickImageFromGallery = async (
  onStart: () => void,
  onSuccess: (uri: string) => void,
  onError: (error: any) => void,
) => {
  try {
    onStart();
    // Launch image library with options
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Reduced quality to keep file size under 2MB
    });

    if (!result.canceled) {
      onSuccess(result.assets[0].uri);
    }
  } catch (error) {
    onError(error);
  }
};

export const processImage = async (
  uri: string,
  fileNamePrefix: string,
  onProgress: (progress: string) => void,
  onSuccess: (uri: string, size: string) => void,
  onError: (error: any) => void,
) => {
  try {
    // Update progress to uploading
    onProgress('0%');

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri);

    const fileSize =
      fileInfo.exists && 'size' in fileInfo
        ? (fileInfo.size / (1024 * 1024)).toFixed(2)
        : '0';

    // If file is larger than 2MB, use image-manipulator to resize
    let finalUri = uri;
    if (
      fileInfo.exists &&
      'size' in fileInfo &&
      fileInfo.size > 1.5 * 1024 * 1024 // Lower threshold to 1.5MB for better compression
    ) {
      // Update progress to show compression is happening
      onProgress('25% - сжимаж байна');

      // More aggressive compression for larger images
      const compressionLevel = fileInfo.size > 5 * 1024 * 1024 ? 0.5 : 0.7;

      // Resize the image to reduce file size
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{resize: {width: 1000}}], // Reduced width from 1200 to 1000
        {
          compress: compressionLevel,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      finalUri = manipResult.uri;
    }

    // Update progress to show copying
    onProgress('50% - хадгалж байна');

    // Save to temporary directory with a unique name
    const fileName = `${fileNamePrefix}_${new Date().getTime()}.jpg`;
    const destination = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.copyAsync({
      from: finalUri,
      to: destination,
    });

    // Get final file size
    const savedFileInfo = await FileSystem.getInfoAsync(destination);
    const savedFileSize =
      savedFileInfo.exists && 'size' in savedFileInfo
        ? (savedFileInfo.size / (1024 * 1024)).toFixed(2)
        : fileSize;

    // Update status after successful save
    onSuccess(destination, `${savedFileSize} MB`);
  } catch (error) {
    onError(error);
  }
};

export const showImageSourceOptions = (
  onCameraSelect: () => void,
  onGallerySelect: () => void,
) => {
  Alert.alert('Зураг сонгох', '', [
    {
      text: 'Камераас авах',
      onPress: onCameraSelect,
    },
    {
      text: 'Зургийн санаас сонгох',
      onPress: onGallerySelect,
    },
    {
      text: 'Цуцлах',
      style: 'cancel',
    },
  ]);
};

export const showDeleteConfirmation = (onConfirm: () => void) => {
  Alert.alert('Зураг устгах', 'Зураг устгахдаа итгэлтэй байна уу?', [
    {
      text: 'Цуцлах',
      style: 'cancel',
    },
    {
      text: 'Устгах',
      style: 'destructive',
      onPress: onConfirm,
    },
  ]);
};

export const cleanupTemporaryFiles = async (
  filePrefix: string,
  currentFiles: string[] = [],
) => {
  try {
    // First check the total cache size
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) return;

    // Get info about cache directory
    let totalCacheSize = 0;
    let imageFiles = [];

    try {
      const files = await FileSystem.readDirectoryAsync(cacheDir);

      // Get size of all files and identify relevant image files
      await Promise.all(
        files.map(async file => {
          try {
            const fileInfo = await FileSystem.getInfoAsync(
              `${cacheDir}${file}`,
            );
            if (fileInfo.exists && 'size' in fileInfo) {
              totalCacheSize += fileInfo.size;

              // Track relevant image files separately
              if (file.startsWith(filePrefix)) {
                imageFiles.push({
                  path: `${cacheDir}${file}`,
                  size: fileInfo.size,
                  lastModified: fileInfo.modificationTime || 0,
                });
              }
            }
          } catch (e) {
            console.error(`Error getting info for file ${file}:`, e);
          }
        }),
      );

      // Sort files by modification time (oldest first)
      imageFiles.sort((a, b) => a.lastModified - b.lastModified);

      // Calculate cache size in MB
      const cacheSizeMB = totalCacheSize / (1024 * 1024);

      // If the cache is too large (>50MB), clean up old files
      if (cacheSizeMB > 50) {
        // Delete images that aren't current
        let freedSpace = 0;

        for (const file of imageFiles) {
          // Skip current images
          if (currentFiles.includes(file.path)) {
            continue;
          }

          try {
            await FileSystem.deleteAsync(file.path);
            freedSpace += file.size;

            // Stop if we've freed up enough space
            if ((totalCacheSize - freedSpace) / (1024 * 1024) < 40) {
              break;
            }
          } catch (e) {
            console.error(`Failed to delete ${file.path}:`, e);
          }
        }
      }
    } catch (e) {
      console.error('Error reading cache directory:', e);
    }
  } catch (error) {
    console.error('Error cleaning up temporary files:', error);
  }
};
