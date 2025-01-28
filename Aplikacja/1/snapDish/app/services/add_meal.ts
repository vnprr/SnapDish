import { SERVER_URL } from '@/app/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DateTime } from 'luxon';

export const addMeal = async (photoUri: string, mealName: string, calories: number, time: DateTime) => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            throw new Error('User is not authenticated');
        }

        const formData = new FormData();
        formData.append('file', {
            uri: photoUri,
            name: 'photo.jpg',
            type: 'image/jpeg'
        } as any);

        const queryParams = new URLSearchParams({
            name: mealName,
            calories: calories.toString(),
            time: time.toISO() || ''
        }).toString();

        const response = await fetch(`${SERVER_URL}/add-meal?${queryParams}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to add meal:', response.status, errorText);
            throw new Error('Failed to add meal');
        }

        const result = await response.json();
        console.log(response)
        return result;
    } catch (error) {
        console.error('Error adding meal:', error);
        throw error;
    }
};



// import { SERVER_URL } from '@/app/config';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import FormData from 'form-data';
// import { DateTime } from 'luxon';
//
// export const addMeal = async (photoUri: string, mealName: string, calories: number, time: DateTime) => {
//     try {
//         const token = await AsyncStorage.getItem('authToken');
//         if (!token) {
//             throw new Error('User is not authenticated');
//         }
//
//         if (mealName === null)
//             throw new Error('Meal name is required');
//         if (calories === null)
//             throw new Error('Calories is required');
//         if (time === null)
//             throw new Error('Time is required');
//
//         const formData = new FormData();
//         formData.append('file', {
//             uri: photoUri,
//             name: 'photo.jpg',
//             type: 'image/jpeg'
//         });
//
//         const queryParams = new URLSearchParams({
//             name: mealName,
//             calories: calories.toString(),
//             time: time.toISO() || ''
//         }).toString();
//
//         const response = await fetch(`${SERVER_URL}/add-meal?${queryParams}`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//             },
//             body: formData.toString(),
//         });
//
//         if (!response.ok) {
//             const errorText = await response.text();
//             console.error('Failed to add meal:', response.status, errorText);
//             throw new Error('Failed to add meal');
//         }
//
//         const result = await response.json();
//         return result;
//     } catch (error) {
//         console.error('Error adding meal:', error);
//         throw error;
//     }
// };