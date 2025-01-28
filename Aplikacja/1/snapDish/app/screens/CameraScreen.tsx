import * as ImageManipulator from 'expo-image-manipulator';
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Image,
    Button,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AntDesign } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import globalStyles from '@/app/styles/style';
import { classifyImage } from '@/app/services/classify_image';
import { RootStackParamList } from '@/app/types';

export default function CameraScreen() {
    const cameraRef = useRef<CameraView>(null);

    const [hasCameraPermissions, setHasCameraPermissions] = useCameraPermissions();

    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [classificationResult, setClassificationResult] = useState<{
        predicted_class: string;
        estimated_calories: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    if (!hasCameraPermissions) {
        return <View />;
    }
    if (!hasCameraPermissions.granted) {
        return (
            <View style={globalStyles.container}>
                <Text>We need your permission to show the camera</Text>
                <Button title="Grant permission" onPress={setHasCameraPermissions} />
            </View>
        );
    }

    const processImage = async (imageUri: string) => {
        try {
            setIsLoading(true);
            const result = await classifyImage(imageUri);
            setClassificationResult(result);
        } catch (error) {
            console.log('Error classifying image:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const takePhoto = async () => {
        if (cameraRef.current) {
            try {
                setPhotoUri(null);
                setClassificationResult(null);

                const data = await cameraRef.current.takePictureAsync({
                    quality: 1,
                });

                // Resize the image
                const manipulatedImage = await ImageManipulator.manipulateAsync(
                    //@ts-ignore
                    data.uri,
                    [{ resize: { width: 720 } }],
                    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Adjust the compression as needed
                );

                // Save to FileSystem
                const fileUri = `${FileSystem.documentDirectory}photo_${Date.now()}.jpg`;
                await FileSystem.moveAsync({
                    from: manipulatedImage.uri,
                    to: fileUri,
                });

                const fileInfo = await FileSystem.getInfoAsync(fileUri);
                if (fileInfo.exists) {
                    setPhotoUri(fileUri);
                    await processImage(fileUri);
                }
            } catch (error) {
                console.log('Error taking photo:', error);
            }
        }
    };

    const handleAddMeal = () => {
        if (photoUri && classificationResult) {
            navigation.navigate('MealCreationScreen', {
                photoUri,
                classificationResult: {
                    predicted_class: classificationResult.predicted_class,
                    estimated_calories: classificationResult.estimated_calories,
                },
            });
        }
    };

    const handleRetakePhoto = () => {
        setPhotoUri(null);
        setClassificationResult(null);
    };

    return (
        <View style={globalStyles.container}>
            <View style={globalStyles.topContainer}>
                {!photoUri ? (
                    <CameraView
                        ref={cameraRef}
                        style={globalStyles.cameraPreview}
                        facing="back"
                    />
                ) : (
                    <Image source={{ uri: photoUri }} style={globalStyles.photo} />
                )}
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : classificationResult ? (
                <View style={globalStyles.classificationWrapper}>
                    <Text style={globalStyles.classificationText}>
                        Class: {classificationResult.predicted_class}
                    </Text>
                    <Text style={globalStyles.classificationText}>
                        Estimated Calories: {classificationResult.estimated_calories}
                    </Text>
                </View>
            ) : null}

            <View style={globalStyles.bottomContainer}>
                {!photoUri ? (
                    <TouchableOpacity
                        style={globalStyles.cameraButton}
                        onPress={takePhoto}
                    >
                        <AntDesign name="camera" size={30} color="#fff" />
                    </TouchableOpacity>
                ) : (
                    <View style={globalStyles.twoButtonsRow}>
                        <Button title="Add Meal" onPress={handleAddMeal} />
                        <Button title="Retake Photo" onPress={handleRetakePhoto} />
                    </View>
                )}
            </View>
        </View>
    );
}
