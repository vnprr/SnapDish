import React, { useState } from 'react';
import { View, Text, TextInput, Image, Button, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTime } from 'luxon';
import { RootStackParamList } from '@/app/types';
import * as FileSystem from 'expo-file-system';
import styles from '@/app/styles/style';
import { addMeal } from '@/app/services/add_meal';

type MealCreationScreenRouteProp = RouteProp<RootStackParamList, 'MealCreationScreen'>;

export default function MealCreationScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<MealCreationScreenRouteProp>();
    const photoUri = route.params.photoUri;

    let predictedClass = '';
    let estimatedCalories = 0;

    if (route.params.classificationResult !== null) {
        predictedClass = route.params.classificationResult.predicted_class;
        estimatedCalories = route.params.classificationResult.estimated_calories;
    }

    const [mealName, setMealName] = useState(predictedClass);
    const [calories, setCalories] = useState(estimatedCalories);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleSave = async () => {
        const mealTime = DateTime.fromJSDate(date);
        await addMeal(photoUri, mealName, calories, mealTime);
        Alert.alert('Saved', 'Meal has been saved successfully.');
        navigation.navigate('Home');
    };

    const handleCancel = async () => {
        try {
            await FileSystem.deleteAsync(photoUri);
            Alert.alert('Cancelled', 'Meal creation has been cancelled.');
            navigation.goBack();
        } catch (error) {
            console.error('Error deleting photo:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: photoUri }} style={styles.photo} />
            <TextInput
                style={styles.input}
                value={mealName}
                onChangeText={setMealName}
                placeholder="Meal Name"
            />
            <TextInput
                style={styles.input}
                value={calories.toString()}
                onChangeText={(text) => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue) && numericValue >= 0) {
                        setCalories(numericValue);
                    }
                }}
                placeholder="Calories"
                keyboardType="numeric"
            />
            <Button title="Select Date" onPress={() => setShowDatePicker(true)} />
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                            setDate(selectedDate);
                        }
                    }}
                />
            )}
            <Button title="Select Time" onPress={() => setShowTimePicker(true)} />
            {showTimePicker && (
                <DateTimePicker
                    value={date}
                    mode="time"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowTimePicker(false);
                        if (selectedDate) {
                            setDate(selectedDate);
                        }
                    }}
                />
            )}
            <Button title="Save" onPress={handleSave} />
            <Button title="Cancel" onPress={handleCancel} />
        </View>
    );
}