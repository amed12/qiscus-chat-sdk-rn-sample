# Attachments

## Supported file types

Validation is done via helpers in `src/client/fileUtils.ts`:

| Helper | Purpose |
|--------|---------|
| `isUnsupportedFileType(name)` | Returns `true` for blocked extensions |
| `isImageFile(name)` | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` |
| `isVideoFile(name)` | `.mp4`, `.mov`, `.avi`, `.mkv` |
| `fileSizeMB(bytes)` | Converts bytes → MB |
| `MAX_FILE_SIZE_MB` | Maximum allowed file size (default: 20 MB) |

Always validate before calling `sendFile`.

## Picking a file

Use Expo pickers — they return an `UploadFileSource`-compatible object:

```ts
// Image
import * as ImagePicker from 'expo-image-picker';
const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] });
if (!result.canceled) {
  const asset = result.assets[0];
  const file: UploadFileSource = { uri: asset.uri, name: asset.fileName ?? 'image.jpg', type: asset.mimeType ?? 'image/jpeg' };
}

// Document
import * as DocumentPicker from 'expo-document-picker';
const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
if (!result.canceled) {
  const asset = result.assets[0];
  const file: UploadFileSource = { uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' };
}
```

## Sending a file

```ts
const { sendFile, buildOptimistic } = useSendMessage();

// 1. Validate
if (isUnsupportedFileType(file.name)) { /* show error */ return; }
if (fileSizeMB(file.size ?? 0) > MAX_FILE_SIZE_MB) { /* show error */ return; }

// 2. Optimistic placeholder
const optimistic = buildOptimistic(file.name, currentUser, room.id);
addOptimistic(optimistic);

// 3. Upload + send
try {
  const serverMsg = await sendFile(room.id, file, currentUser, (percent) => {
    // update progress indicator if needed
  });
  updateMessage(optimistic.unique_temp_id, serverMsg);
} catch {
  updateMessage(optimistic.unique_temp_id, { ...optimistic, status: 'failed' });
}
```

## How it works internally

`useSendMessage.sendFile` calls `qiscusClient.upload(file, callback)`. Once the upload completes and a `fileURL` is returned, it calls `qiscusClient.sendComment(roomId, 'File attachment', tempId, 'custom', payload)` where `payload` is a JSON string:

```json
{
  "type": "image",
  "content": {
    "url": "https://...",
    "file_name": "photo.jpg",
    "caption": ""
  }
}
```

Image/video files use `type: "image"` (detected via `isImageFile` / `isVideoFile`); all others use the MIME type.
