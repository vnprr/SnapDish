import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, Image, Button } from 'react-native';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import { getMeals } from '@/app/services/meals';
import styles from '@/app/styles/style';
import { Meal, RootStackParamList } from '@/app/types';

type SelectMealScreenRouteProp = RouteProp<RootStackParamList, 'SelectMealScreen'>;

export default function SelectMealScreen() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<SelectMealScreenRouteProp>();
    const { photoUri } = route.params;

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const data = await getMeals();
                setMeals(data);
            } catch (error) {
                Alert.alert('Error', 'Failed to load meals. Please try again.');
            }
        };
        fetchMeals();
    }, []);

    const handleAddNewMeal = () => {
        //@ts-ignore
        navigation.navigate('MealCreationScreen', { photoUri });
    };

    const handleSelectMeal = (mealId: string) => {
        //@ts-ignore
        navigation.navigate('MealDetailScreen', { mealId, photoUri });
    };

    return (
        <View style={styles.container}>
            <Button title="Add New Meal" onPress={handleAddNewMeal} />
            <Text style={styles.title}>Select a Meal</Text>
            {meals.length === 0 ? (
                <Text style={styles.noMeals}>No meals found.</Text>
            ) : (
                <FlatList<Meal>
                    data={meals}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSelectMeal(item.id)}>
                            <View style={styles.mealItem}>
                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.thumbnail}
                                />
                                <Text style={styles.mealText}>Meal ID: {item.id}</Text>
                                <Text style={styles.mealText}>Calories: {item.calories}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}



// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, Alert, TouchableOpacity, Button } from 'react-native';
// import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
// import { getMeals } from '@/app/services/meals';
// import styles from '@/app/styles/style';
// import { Meal, RootStackParamList } from '@/app/types';
// // import { AntDesign } from '@expo/vector-icons';
//
// type SelectMealScreenRouteProp = RouteProp<RootStackParamList, 'SelectMealScreen'>;
//
// export default function SelectMealScreen() {
//     const [meals, setMeals] = useState<Meal[]>([]);
//     const navigation = useNavigation<NavigationProp<RootStackParamList>>();
//     const route = useRoute<SelectMealScreenRouteProp>();
//     const { photoUri } = route.params;
//
//     useEffect(() => {
//         const fetchMeals = async () => {
//             try {
//                 const data = await getMeals();
//                 setMeals(data);
//             } catch (error) {
//                 Alert.alert('Error', 'Failed to load meals. Please try again.');
//             }
//         };
//         fetchMeals();
//     }, []);
//
//     const handleAddNewMeal = () => {
//         // @ts-ignore
//         navigation.navigate('MealCreationScreen', { photoUri, classificationResult });
//     };
//
//     const handleSelectMeal = (mealId: string) => {
//         // Navigate to the screen where the photo can be added to the selected meal
//         // @ts-ignore
//         navigation.navigate('MealDetailScreen', { mealId, photoUri, classificationResult });
//     };
//
//     return (
//         <View style={styles.container}>
//             <Button title="Add New Meal" onPress={handleAddNewMeal} />
//             <Text style={styles.title}>Select a Meal</Text>
//             {meals.length === 0 ? (
//                 <Text style={styles.noMeals}>No meals found.</Text>
//             ) : (
//                 <FlatList<Meal>
//                     data={meals}
//                     keyExtractor={(item) => item.id}
//                     renderItem={({ item }) => (
//                         <TouchableOpacity onPress={() => handleSelectMeal(item.id)}>
//                             <View style={styles.mealItem}>
//                                 <Text style={styles.mealText}>Meal ID: {item.id}</Text>
//                                 <Text style={styles.mealText}>Calories: {item.calories}</Text>
//                                 <Text style={styles.mealText}>Ingredients: {item.ingredientIds.length}</Text>
//                             </View>
//                         </TouchableOpacity>
//                     )}
//                 />
//             )}
//         </View>
//     );
// }