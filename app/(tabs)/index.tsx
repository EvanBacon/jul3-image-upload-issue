import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Button, Platform, StyleSheet, View } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { fetch as expoFetch } from "expo/fetch";
export default function HomeScreen() {
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera roll is required!"
      );
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets) {
      const imageUris = pickerResult.assets.map((asset) => asset.uri);
      setSelectedImages(imageUris);
    }
  };

  const handleCameraPicker = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera is required!"
      );
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets) {
      const imageUris = pickerResult.assets.map((asset) => asset.uri);
      setSelectedImages(imageUris);
    }
  };

  const uploadImagesWithExpoFetch = async (assets: ImagePicker.ImagePickerAsset[]) => {
    setUploadStatus("Uploading with expo/fetch...");

    const formData = new FormData();

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      const filename = asset.uri.split("/").pop() || `image_${i}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append(`file${i}`, {
        uri: asset.uri,
        name: filename,
        type,
      } as any);
    }

    formData.append("totalFiles", assets.length.toString());
    formData.append("uploadTime", new Date().toISOString());

    try {
      const response = await expoFetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setUploadStatus(`expo/fetch upload successful! ${assets.length} images uploaded`);

      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      setUploadStatus(`expo/fetch upload failed: ${error.message}`);
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  const uploadImagesWithGlobalFetch = async (assets: ImagePicker.ImagePickerAsset[]) => {
    setUploadStatus("Uploading with global fetch...");

    const formData = new FormData();

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      const filename = asset.uri.split("/").pop() || `image_${i}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append(`file${i}`, {
        uri: asset.uri,
        name: filename,
        type,
      } as any);
    }

    formData.append("totalFiles", assets.length.toString());
    formData.append("uploadTime", new Date().toISOString());

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setUploadStatus(`Global fetch upload successful! ${assets.length} images uploaded`);

      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      setUploadStatus(`Global fetch upload failed: ${error.message}`);
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  const createAndUploadBlob = async () => {
    const textContent = "This is a sample text content created as a blob";

    const formData = new FormData();

    if (Platform.OS === "web") {
      const blob = new Blob([textContent], { type: "text/plain" });
      const file = new File([blob], "generated-file.txt", {
        type: "text/plain",
      });
      formData.append("generatedFile", file);
    } else {
      formData.append("generatedFile", {
        uri: "data:text/plain;base64," + btoa(textContent),
        name: "generated-file.txt",
        type: "text/plain",
      } as any);
    }

    formData.append("source", "blob");

    try {
      setUploadStatus("Uploading blob...");
      const response = await expoFetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setUploadStatus("Blob upload successful!");
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      setUploadStatus(`Blob upload failed: ${error.message}`);
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">File Upload Example</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Upload Images</ThemedText>
        <ThemedText>
          Test image upload functionality with expo-image-picker, fetch,
          FormData, and Blob APIs.
        </ThemedText>

        <View style={styles.buttonContainer}>
          <Button title="Pick from Gallery" onPress={handleImagePicker} />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Take Photo" onPress={handleCameraPicker} />
        </View>

        {selectedImages.length > 0 && (
          <>
            <View style={styles.buttonContainer}>
              <Button
                title="Upload with expo/fetch"
                onPress={() => uploadImagesWithExpoFetch(selectedImages.map(uri => ({ uri } as ImagePicker.ImagePickerAsset)))}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Upload with global fetch"
                onPress={() => uploadImagesWithGlobalFetch(selectedImages.map(uri => ({ uri } as ImagePicker.ImagePickerAsset)))}
              />
            </View>
          </>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Create & Upload Blob" onPress={createAndUploadBlob} />
        </View>

        {selectedImages.length > 0 && (
          <ThemedView style={styles.imageContainer}>
            <ThemedText style={styles.imageCount}>
              Selected {selectedImages.length} image(s)
            </ThemedText>
            <View style={styles.imageGrid}>
              {selectedImages.slice(0, 4).map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.thumbnail} />
              ))}
            </View>
          </ThemedView>
        )}

        {uploadStatus ? (
          <ThemedText style={styles.statusText}>{uploadStatus}</ThemedText>
        ) : null}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    marginVertical: 8,
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: "italic",
  },
  imageContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  imageCount: {
    marginBottom: 8,
    fontSize: 12,
    textAlign: "center",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
