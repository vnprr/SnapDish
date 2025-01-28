import { DateTime } from 'luxon';

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    CameraScreen: undefined;
    MealCreationScreen: { photoUri: string, classificationResult: { predicted_class: string, estimated_calories: number } | null };
    SelectMealScreen: { photoUri: string ,  classificationResult: { predicted_class: string, estimated_calories: number } | null };
};

export type Meal = {
    id: string;
    userId: string;
    name: string
    ingredientIds: string[];
    calories: number;
    image?: string; // URL or path to the image
    time: DateTime;
};

