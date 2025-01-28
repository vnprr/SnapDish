import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, Image } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getMeals } from '@/app/services/meals';
import styles from '@/app/styles/style';
import { Meal } from '@/app/types';
import { RootStackParamList } from '@/app/types';
import { AntDesign } from '@expo/vector-icons';
import { DateTime } from 'luxon';

export default function HomeScreen() {
    const [groupedMeals, setGroupedMeals] = useState<{ [key: string]: { meals: Meal[], totalCalories: number } }>({});
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const data = await getMeals();
                // Sort meals from newest to oldest
                const sortedMeals = data.sort((a, b) => b.time.toMillis() - a.time.toMillis());
                // Group meals by date and calculate total calories
                const grouped = sortedMeals.reduce((acc, meal) => {
                    const date = meal.time.toLocaleString(DateTime.DATE_MED);
                    if (!acc[date]) {
                        acc[date] = { meals: [], totalCalories: 0 };
                    }
                    acc[date].meals.push(meal);
                    acc[date].totalCalories += meal.calories;
                    return acc;
                }, {} as { [key: string]: { meals: Meal[], totalCalories: number } });
                setGroupedMeals(grouped);
            } catch (error) {
                Alert.alert('Error', 'Failed to load meals. Please try again.');
            }
        };
        fetchMeals();
    }, []);

    return (
        <View style={styles.container}>
            {Object.keys(groupedMeals).length === 0 ? (
                <Text style={styles.noMeals}>No meals found.</Text>
            ) : (
                <FlatList
                    contentContainerStyle={styles.flatListContent}
                    data={Object.keys(groupedMeals)}
                    keyExtractor={(date) => date}
                    renderItem={({ item: date }) => (
                        <View>
                            <Text style={styles.dateHeader}>
                                {date} - Total Calories: {groupedMeals[date].totalCalories}
                            </Text>
                            {groupedMeals[date].meals.map((meal) => (
                                <View key={meal.id} style={styles.mealItem}>
                                    <Image source={{ uri: meal.image }} style={styles.thumbnail} />
                                    <View>
                                        <Text style={styles.mealText}>Name: {meal.name}</Text>
                                        <Text style={styles.mealText}>
                                            Time: {meal.time.toLocaleString(DateTime.TIME_SIMPLE)}
                                        </Text>
                                        <Text style={styles.mealText}>Calories: {meal.calories}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                />
            )}

            <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => navigation.navigate('CameraScreen')}
            >
                <AntDesign name="camera" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
}