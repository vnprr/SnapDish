import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 20,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    noMeals: {
        fontSize: 18,
        color: '#888',
        textAlign: 'center',
    },
    mealItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        borderRadius: 5,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    mealText: {
        fontSize: 16,
        marginLeft: 10,
    },
    fabButton: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: '#007bff',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },

    dateHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center',
        color: '#333',
    },
    flatListContent: {
        paddingBottom: 100,
    },

    previewContainer: {
        width: '100%',
    },

    topContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#000',
    },
    cameraPreview: {
        flex: 1,
    },
    photo: {
        flex: 1,
        resizeMode: 'cover',
    },

    classificationWrapper: {
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 5,
        marginTop: 10,
        marginHorizontal: 10,
    },
    classificationText: {
        fontSize: 16,
        color: '#333',
    },

    bottomContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 20,
    },

    cameraButton: {
        alignSelf: 'center',
        backgroundColor: '#007bff',
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },

    twoButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
});

export default globalStyles;
