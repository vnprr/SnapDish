import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '@/app/screens/LoginScreen';
import HomeScreen from '@/app/screens/HomeScreen';
import CameraScreen from '@/app/screens/CameraScreen';
import MealCreationScreen from "@/app/screens/MealCreationScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Meals' }} />
            <Stack.Screen name="CameraScreen" component={CameraScreen} options={{ title: 'Take a Photo' }} />
            <Stack.Screen name="MealCreationScreen" component={MealCreationScreen} options={{ title: 'Create a Meal' }} />
        </Stack.Navigator>
    );
}