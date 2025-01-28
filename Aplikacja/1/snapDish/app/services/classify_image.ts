import { SERVER_URL } from '@/app/config';

export const classifyImage = async (imageUri: string) => {
    try {
        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            name: 'photo.jpg',
            type: 'image/jpeg',
        } as any);

        const response = await fetch(`${SERVER_URL}/classify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to classify image');
        }

        const result = await response.json();
        return {
            predicted_class: result.predicted_class,
            estimated_calories: Math.floor(result.estimated_calories),
        };
    } catch (error) {
        throw new Error('Error classifying the image: ' + error);
    }
};