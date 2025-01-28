import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register } from '@/app/services/auth';
import { RootStackParamList } from '@/app/types';

export default function LoginScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await login(email, password);
            await AsyncStorage.setItem('authToken', response.access_token);
            Alert.alert('Login successful', `Welcome ${email}`);
            navigation.navigate('Home');
        } catch (error) {
            Alert.alert('Login failed', 'Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
            const response = await register(email, password);
            console.log(response);
            Alert.alert('Registration successful', 'You can now log in with your new account.');
        } catch (error) {
            Alert.alert('Registration failed', 'Please check your details and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                Login
            </Text>
            <TextInput
                style={{ width: '100%', padding: 10, borderWidth: 1, borderColor: '#ccc', marginBottom: 10 }}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={{ width: '100%', padding: 10, borderWidth: 1, borderColor: '#ccc', marginBottom: 10 }}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    <Button
                        title="Login"
                        onPress={handleLogin}
                        disabled={loading}
                    />
                    <Button
                        title="Register"
                        onPress={handleRegister}
                        disabled={loading}
                    />
                </>
            )}
        </View>
    );
}