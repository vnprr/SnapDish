import { SERVER_URL } from '@/app/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { DateTime } from 'luxon';

export const getMeals = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            throw new Error('User is not authenticated');
        }

        const response = await fetch(`${SERVER_URL}/meals`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch meals:', response.status, errorText);
            throw new Error('Failed to fetch meals');
        }

        const meals = await response.json();

        // Decode Base64 image data and save locally
        const processedMeals = await Promise.all(meals.map(async (meal: any) => {
            if (meal.image) {
                const imageUri = `${FileSystem.documentDirectory}${meal.id}.jpg`;
                await FileSystem.writeAsStringAsync(imageUri, meal.image, { encoding: FileSystem.EncodingType.Base64 });
                meal.image = imageUri;
            }
            // Parse the date using Luxon
            meal.time = DateTime.fromISO(meal.time);
            return meal;
        }));

        return processedMeals;
    } catch (error) {
        console.error('Error fetching meals:', error);
        throw error;
    }
};