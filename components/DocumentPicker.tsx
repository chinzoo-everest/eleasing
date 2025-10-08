import SvgIcon from '@components/SvgIcon';
import {DocumentFile} from '@customHooks/useDocumentUpload';
import {Entypo, FontAwesome5, MaterialCommunityIcons} from '@expo/vector-icons';
import {cn} from '@utils/cn';
import {showToast} from '@utils/showToast';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import React, {useMemo} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface DocumentPickerComponentProps {
  onFileSelected: (fileData: {
    uri: string;
    name: string;
    size: number;
    base64?: string;
    extension?: string;
    mimeType?: string;
  }) => void;
  onFileRemoved: () => void;
  themeColor?: string;
  iconName?: string;
  allowedTypes?: string[];
  isLoading?: boolean;
  isUploading?: boolean;
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
  selectedFile?: {
    name: string;
    size: number;
    extension?: string;
  } | null;
}

const DocumentPickerComponent: React.FC<DocumentPickerComponentProps> = ({
  onFileSelected,
  onFileRemoved,
  themeColor = '#00C7EB',
  iconName = 'statement_upload_deposit',
  allowedTypes = ['*/*'],
  isLoading = false,
  isUploading = false,
  maxSizeMB = 10,
  title = 'Файлын төрөл:',
  subtitle = 'Та хамгийн ихдээ 10MB-аас бага хэмжээтэй файл оруулах боломжтой',
  selectedFile = null,
}) => {
  // Generate a human-readable description of allowed file types
  const allowedTypesText = useMemo(() => {
    if (allowedTypes.includes('*/*')) return '';

    const typeMap: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/vnd.ms-excel': 'Excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'Excel',
      'application/msword': 'Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'Word',
      'text/csv': 'CSV',
    };

    const uniqueTypes = new Set<string>();
    allowedTypes.forEach(type => {
      if (typeMap[type]) uniqueTypes.add(typeMap[type]);
    });

    return Array.from(uniqueTypes).join(', ');
  }, [allowedTypes]);

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        // Check file size (convert bytes to MB)
        const fileSizeMB = file.size ? file.size / (1024 * 1024) : 0;
        if (fileSizeMB > maxSizeMB) {
          showToast(
            'Анхааруулга',
            `Файлын хэмжээ хэтэрсэн байна. Хамгийн ихдээ ${maxSizeMB}MB байх ёстой.`,
            'error',
          );
          return;
        }

        // Get file extension and MIME type
        const extension = file.name.split('.').pop()?.toLowerCase();
        const mimeType = file.mimeType;

        // Check if file type is allowed
        if (
          mimeType &&
          !allowedTypes.includes(mimeType) &&
          !allowedTypes.includes('*/*')
        ) {
          showToast(
            'Анхааруулга',
            `Дэмжигдэхгүй файлын төрөл. Зөвхөн ${allowedTypesText} файл дэмжигдэнэ.`,
            'error',
          );
          return;
        }

        try {
          // Convert file to base64
          const base64 = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          onFileSelected({
            uri: file.uri,
            name: file.name,
            size: file.size || 0,
            base64,
            extension,
            mimeType: file.mimeType,
          });
        } catch (error) {
          console.error('Error reading file:', error);
          showToast(
            'Анхааруулга',
            'Файлыг уншихад алдаа гарлаа. Дахин оролдоно уу.',
            'error',
          );
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      showToast(
        'Анхааруулга',
        'Файл сонгоход алдаа гарлаа. Дахин оролдоно уу.',
        'error',
      );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render appropriate file icon based on file extension
  const renderFileTypeIcon = () => {
    const extension = selectedFile?.extension?.toLowerCase();

    // Use different icon sets based on file type
    if (['pdf'].includes(extension || '')) {
      return (
        <View style={[styles.iconContainer, {backgroundColor: '#FF5252'}]}>
          <FontAwesome5 name="file-pdf" size={24} color="white" />
        </View>
      );
    } else if (['doc', 'docx'].includes(extension || '')) {
      return (
        <View style={[styles.iconContainer, {backgroundColor: '#5C6BC0'}]}>
          <FontAwesome5 name="file-word" size={24} color="white" />
        </View>
      );
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return (
        <View style={[styles.iconContainer, {backgroundColor: '#66BB6A'}]}>
          <FontAwesome5 name="file-excel" size={24} color="white" />
        </View>
      );
    } else if (['csv'].includes(extension || '')) {
      return (
        <View style={[styles.iconContainer, {backgroundColor: '#66BB6A'}]}>
          <MaterialCommunityIcons
            name="file-delimited-outline"
            size={24}
            color="white"
          />
        </View>
      );
    } else {
      return (
        <View style={[styles.iconContainer, {backgroundColor: '#FFA726'}]}>
          <FontAwesome5 name="file-alt" size={24} color="white" />
        </View>
      );
    }
  };

  if (isLoading) {
    return (
      <View className="flex-column mt-8 items-center justify-center rounded-xl border-[#353941] bg-[#1E222B] px-6 py-10">
        <ActivityIndicator size="large" color={themeColor} />
        <Text className="mt-4 text-sm font-medium text-white">
          Ачааллаж байна...
        </Text>
      </View>
    );
  }

  return (
    <View>
      {selectedFile ? (
        <TouchableOpacity
          className="mb-2 flex-row items-center justify-between rounded-xl border border-[#353941] bg-[#1E222B] p-3"
          disabled={true}>
          <View className="flex-1 flex-row items-center pl-3">
            <SvgIcon name="caruploadcheck" height={20} width={20} />
            {renderFileTypeIcon()}
            <View className="-mt-1 flex-1">
              <Text className="text-sm text-white" numberOfLines={1}>
                {selectedFile.name}
              </Text>
              <Text className="mt-2 text-xs text-white/60">
                {formatFileSize(selectedFile.size)}
              </Text>
            </View>
          </View>
          <TouchableOpacity className="p-3" onPress={onFileRemoved}>
            <SvgIcon name="trash" height={20} width={16} />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className="flex-column items-center justify-center rounded-xl border-[#353941] bg-[#1E222B] px-6 py-10"
          onPress={!isUploading ? handleDocumentPick : undefined}
          disabled={isUploading}>
          {isUploading ? (
            <>
              <ActivityIndicator size="large" color={themeColor} />
              <Text className="mt-4 text-sm font-medium text-white">
                Ачааллаж байна...
              </Text>
            </>
          ) : (
            <>
              <SvgIcon name={iconName} />
              <Text className="mx-5 mt-6 text-center text-sm font-medium text-white">
                {subtitle}
              </Text>
              {allowedTypesText ? (
                <Text className="mt-2 text-center text-xs font-medium text-white/60">
                  Дэмжигдэх файлын төрлүүд: {allowedTypesText}
                </Text>
              ) : null}
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

// New interfaces for the multi document picker
interface MultiDocumentPickerComponentProps {
  onFileSelected: (fileData: {
    uri: string;
    name: string;
    size: number;
    base64?: string;
    extension?: string;
    mimeType?: string;
  }) => void;
  onFileRemoved: (index: number) => void;
  themeColor?: string;
  iconName?: string;
  allowedTypes?: string[];
  isLoading?: boolean;
  isUploading?: boolean;
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
  selectedFiles: DocumentFile[];
  maxFiles?: number;
  className?: string;
}

const MultiDocumentPickerComponent: React.FC<
  MultiDocumentPickerComponentProps
> = ({
  onFileSelected,
  onFileRemoved,
  themeColor = '#00C7EB',
  iconName = 'statement_upload_deposit',
  allowedTypes = ['*/*'],
  isLoading = false,
  isUploading = false,
  maxSizeMB = 10,
  title = 'Файлын төрөл:',
  subtitle = 'Та хамгийн ихдээ 10MB-аас бага хэмжээтэй файл оруулах боломжтой',
  selectedFiles = [],
  maxFiles = 5,
  className,
}) => {
  // Generate a human-readable description of allowed file types
  const allowedTypesText = useMemo(() => {
    if (allowedTypes.includes('*/*')) return '';

    const typeMap: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/vnd.ms-excel': 'Excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'Excel',
      'application/msword': 'Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'Word',
      'text/csv': 'CSV',
    };

    const uniqueTypes = new Set<string>();
    allowedTypes.forEach(type => {
      if (typeMap[type]) uniqueTypes.add(typeMap[type]);
    });

    return Array.from(uniqueTypes).join(', ');
  }, [allowedTypes]);

  const handleDocumentPick = async () => {
    // Check if maximum number of files reached
    if (selectedFiles.length >= maxFiles) {
      showToast(
        'Анхааруулга',
        `Хамгийн ихдээ ${maxFiles} файл оруулах боломжтой.`,
        'error',
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Calculate how many files we can still add
        const remainingSlots = maxFiles - selectedFiles.length;

        // If we have more files than slots, show a message
        if (result.assets.length > remainingSlots) {
          showToast(
            'Анхааруулга',
            `Зөвхөн ${remainingSlots} файл нэмэх боломжтой. Эхний ${remainingSlots} файлыг нэмэх болно.`,
            'error',
          );
        }

        // Process only up to the remaining slots
        const filesToProcess = result.assets.slice(0, remainingSlots);

        // Process each selected file
        for (const file of filesToProcess) {
          // Check file size (convert bytes to MB)
          const fileSizeMB = file.size ? file.size / (1024 * 1024) : 0;
          if (fileSizeMB > maxSizeMB) {
            showToast(
              'Анхааруулга',
              `"${file.name}" файлын хэмжээ хэтэрсэн байна. Хамгийн ихдээ ${maxSizeMB}MB байх ёстой.`,
              'error',
            );
            continue;
          }

          // Get file extension and MIME type
          const extension = file.name.split('.').pop()?.toLowerCase();
          const mimeType = file.mimeType;

          // Check if file type is allowed
          if (
            mimeType &&
            !allowedTypes.includes(mimeType) &&
            !allowedTypes.includes('*/*')
          ) {
            showToast(
              'Анхааруулга',
              `"${file.name}" дэмжигдэхгүй файлын төрөл. Зөвхөн ${allowedTypesText} файл дэмжигдэнэ.`,
              'error',
            );
            continue;
          }

          try {
            // Convert file to base64
            const base64 = await FileSystem.readAsStringAsync(file.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });

            onFileSelected({
              uri: file.uri,
              name: file.name,
              size: file.size || 0,
              base64,
              extension,
              mimeType: file.mimeType,
            });
          } catch (error) {
            console.error('Error reading file:', error);
            showToast(
              'Анхааруулга',
              `"${file.name}" файлыг уншихад алдаа гарлаа.`,
              'error',
            );
          }
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      showToast(
        'Анхааруулга',
        'Файл сонгоход алдаа гарлаа. Дахин оролдоно уу.',
        'error',
      );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render appropriate file icon based on file extension
  const renderFileTypeIcon = (extension?: string) => {
    // Use different icon sets based on file type
    if (['pdf'].includes(extension || '')) {
      return (
        <View style={[styles.iconContainer, {backgroundColor: '#FF5252'}]}>
          <FontAwesome5 name="file-pdf" size={24} color="white" />
        </View>
      );
    } else if (['doc', 'docx'].includes(extension || '')) {
      return (
        <View style={[styles.iconContainer, {backgroundColor: '#5C6BC0'}]}>
          <FontAwesome5 name="file-word" size={24} color="white" />
        </View>
      );
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return (
        <View style={[styles.iconContainer, {backgroundColor: '#66BB6A'}]}>
          <FontAwesome5 name="file-excel" size={24} color="white" />
        </View>
      );
    } else if (['csv'].includes(extension || '')) {
      return (
        <View style={[styles.iconContainer, {backgroundColor: '#66BB6A'}]}>
          <MaterialCommunityIcons
            name="file-delimited-outline"
            size={24}
            color="white"
          />
        </View>
      );
    } else {
      return (
        <View style={[styles.iconContainer, {backgroundColor: '#FFA726'}]}>
          <FontAwesome5 name="file-alt" size={24} color="white" />
        </View>
      );
    }
  };

  if (isLoading) {
    return (
      <View className="flex-column mt-8 items-center justify-center rounded-xl border-[#353941] bg-[#1E222B] px-6 py-10">
        <ActivityIndicator size="large" color={themeColor} />
        <Text className="mt-4 text-sm font-medium text-white">
          Ачааллаж байна...
        </Text>
      </View>
    );
  }

  const renderFileItem = ({
    item,
    index,
  }: {
    item: DocumentFile;
    index: number;
  }) => (
    <TouchableOpacity
      key={index}
      className="mb-2 flex-row items-center justify-between rounded-xl border border-[#353941] bg-[#1E222B] p-3"
      disabled={true}>
      <View className="flex-1 flex-row items-center pl-3">
        {item.isUploading ? (
          <ActivityIndicator size="small" color={themeColor} />
        ) : item.isUploaded && item.uploadSuccess ? (
          <SvgIcon name="caruploadcheck" height={20} width={20} />
        ) : item.isUploaded && !item.uploadSuccess ? (
          <Entypo name="warning" size={20} color="red" />
        ) : (
          <View className="h-5 w-5 rounded-full border border-gray-400" />
        )}
        {renderFileTypeIcon(item.extension)}
        <View className="-mt-1 flex-1">
          <Text className="text-sm text-white" numberOfLines={1}>
            {item.name}
          </Text>
          <Text
            className={`mt-2 text-xs ${
              item.isUploaded && !item.uploadSuccess
                ? 'text-red-500'
                : 'text-white/60'
            }`}>
            {item.isUploading
              ? 'Байршуулж байна...'
              : item.isUploaded && item.uploadSuccess
                ? 'Амжилттай байршуулагдлаа'
                : item.isUploaded && !item.uploadSuccess
                  ? 'Байршуулахад алдаа гарлаа'
                  : formatFileSize(item.size)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        className="p-3"
        onPress={() => onFileRemoved(index)}
        disabled={item.isUploading}>
        {!item.isUploading && <SvgIcon name="trash" height={20} width={16} />}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View>
      {selectedFiles.length < maxFiles && (
        <TouchableOpacity
          className={cn(
            'flex-column mb-2 items-center justify-center rounded-xl border-[#353941] bg-[#1E222B] px-6 py-10',
            className,
          )}
          onPress={!isUploading ? handleDocumentPick : undefined}
          disabled={isUploading}>
          {isUploading ? (
            <>
              <ActivityIndicator size="large" color={themeColor} />
              <Text className="mt-4 text-sm font-medium text-white">
                Ачааллаж байна...
              </Text>
            </>
          ) : (
            <>
              <SvgIcon name={iconName} />
              <Text className="mx-5 mt-6 text-center text-sm font-medium text-white">
                {subtitle}
              </Text>
              <Text className="mt-2 text-center text-xs font-medium text-white/60">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length}/${maxFiles} файл нэмэгдсэн`
                  : ''}
              </Text>
              {allowedTypesText ? (
                <Text className="mt-2 text-center text-xs font-medium text-white/60">
                  Дэмжигдэх файлын төрлүүд: {allowedTypesText}
                </Text>
              ) : null}
            </>
          )}
        </TouchableOpacity>
      )}
      {selectedFiles.length > 0 && (
        <View>
          {selectedFiles.map((item, index) => renderFileItem({item, index}))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  selectedContainer: {
    borderWidth: 1,
    borderColor: '#353941',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginRight: 12,
    marginTop: 4,
  },
});

export {MultiDocumentPickerComponent};
export default DocumentPickerComponent;
