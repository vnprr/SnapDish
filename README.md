# Serwer
Projekt zaliczeniowy z SUML

## 1. Wprowadzenie
Aplikacja pozwala na:

*    Rejestrację i logowanie użytkowników (zabezpieczone hashem z użyciem biblioteki bcrypt).
*    Dodawanie i aktualizowanie posiłków wraz z kaloriami.
*    Dodawanie składników do wybranych posiłków.
*    Przegląd posiłków przypisanych do danego użytkownika (w formie listy).
*    Klasyfikację obrazu (zdjęcia) i szacowanie wartości kalorycznej przy użyciu modeli Fastai.
*    Całość działa w oparciu o bazę Google Firestore.

---

## 2. Wymagania systemowe i zależności
*    Python w wersji 3.8+ (sprawdzony na 3.9 i 3.10)
*    Zależności pakietów Python podane w requirements.txt
*    Konto w Firebase z włączoną bazą Firestore oraz wygenerowany plik klucza serwisowego (firebase-key.json).

---

## 3. Struktura serwera

```
├── models/
│   ├── classification_model.pkl
│   └── regression_model.pkl
├── firebase-key.json
├── main.py
├── requirements.txt
```

*    models/ – katalog przechowujący modele Fastai:
*    classification_model.pkl – model używany do klasyfikacji obrazu
*    regression_model.pkl – model używany do szacowania kalorii
*    firebase-key.json – plik klucza serwisowego Firebase (uwaga: nie zalecane jest commitowanie tego pliku do repozytorium publicznego — patrz Zabezpieczenia i uwagi).
*    main.py – główny plik, kod serwera.
*    requirements.txt – lista zależności.

---

## 4. Konfiguracja Firebase

### Utwórz projekt w Firebase:

Wejdź na console.firebase.google.com i utwórz nowy projekt.

Włącz Cloud Firestore (tryb natywny — production lub testowy).

### Wygeneruj plik klucza serwisowego:

W ustawieniach projektu Firebase znajdź sekcję Service accounts.

Wygeneruj nowy private key i umieść go w projekcie.

Upewnij się, że ścieżka do firebase-key.json w kodzie jest prawidłowa.

---

## 5. Uruchomienie aplikacji

### Zainstaluj zależności:

```
pip install -r requirements.txt
```

### Upewnij się, że w katalogu models/ znajdują się oba pliki:

*    classification_model.pkl
*    regression_model.pkl

### Uruchom serwer przy pomocy Uvicorn (domyślnie wystartuje na porcie 8000):

```
uvicorn <nazwa_pliku>:app --reload
```

### Sprawdź w przeglądarce lub przez narzędzia typu curl, Postman.

---

## 6. Opis endpointów

### Autentykacja i autoryzacja

#### 6.1. Rejestracja użytkownika
**Endpoint:** `POST /register`

**Parametry:**
- *email:* `str`
- *password:* `str`

**Zwraca:**
- `userId`: ID wygenerowanego użytkownika
- Wiadomość o pomyślnym dodaniu użytkownika

#### 6.2. Logowanie użytkownika (OAuth2)
**Endpoint:** `POST /token`

**Parametry:**
- *username:* `str` (email użytkownika)
- *password:* `str`

**Zwraca:**
- `access_token`: token (w tym przypadku ID użytkownika w Firestore)
- `token_type`: `bearer`

> [!IMPORTANT]
> W kolejnych endpointach wymagane jest podanie tokenu w nagłówku:
> ```
> Authorization: Bearer <access_token>
> ```

---

### Zarządzanie posiłkami i składnikami

#### 6.3. Dodanie posiłku
**Endpoint:** `POST /add-meal`

**Parametry:**
- *name:* `str` (nazwa posiłku)
- *calories:* `int` (liczba kalorii, np. 300)
- *time:* `datetime` (np. 2025-01-01T12:00:00; jeśli brak, przyjmowana jest bieżąca data)
- *file:* `UploadFile` (opcjonalnie, obrazek posiłku)

**Nagłówek:** `Authorization: Bearer <token>`

**Zwraca:**
- `mealId`: ID dodanego posiłku
- komunikat o pomyślnym dodaniu

### 6.4. Aktualizacja posiłku
**Endpoint:** `PUT /update-meal/{meal_id}`

**Parametry:**
- `name`: `str` (opcjonalnie)
- `calories`: `int` (opcjonalnie)
- `time`: `datetime` (opcjonalnie)
- `file`: `UploadFile` (opcjonalnie, aktualizacja zdjęcia)

**Nagłówek:** `Authorization: Bearer <token>`

**Zwraca:** komunikat o pomyślnym zaktualizowaniu danych

### 6.5. Dodawanie składników do posiłku
**Endpoint:** `POST /add-ingredients/{meal_id}`

**Parametry:**
- `ingredients`: lista obiektów `[{"name": str, "calories": int}, ...]`

**Nagłówek:** `Authorization: Bearer <token>`

**Zwraca:**
- identyfikatory dodanych składników
- zaktualizowaną łączną liczbę kalorii

### 6.6. Pobranie posiłków danego użytkownika
**Endpoint:** `GET /meals`

**Nagłówek:** `Authorization: Bearer <token>`

**Zwraca:** listę obiektów reprezentujących posiłki z bazy (z uwzględnieniem zdekodowanego zdjęcia w formacie base64, jeśli istnieje).

---

## Klasyfikacja zdjęcia

### 6.7. Klasyfikacja obrazu i szacowanie kalorii
**Endpoint:** `POST /classify`

**Parametry:**
- `file`: `UploadFile` (wymagane — obraz do klasyfikacji)

**Zwraca:**
- `predicted_class`: nazwa przewidywanej klasy (str)
- `probability`: prawdopodobieństwo przewidzianej klasy (float)
- `estimated_calories`: przewidywana wartość kaloryczna (float)

---

## 7. Zabezpieczenia i uwagi

1. Hasła użytkowników są przechowywane w bazie jako hash (**bcrypt**). Dzięki temu nawet jeśli dojdzie do wycieku bazy, rzeczywiste hasła nie zostaną ujawnione wprost.

2. Token w tym projekcie jest uproszczony — użytkownik otrzymuje w polu `access_token` wartość odpowiadającą jego dokumentowi w Firestore. W rzeczywistej aplikacji produkcyjnej zaleca się:
   * Stosowanie **JWT** lub innego bardziej zaawansowanego mechanizmu autentykacji.
   * Używanie **HTTPS** w celu ochrony danych przesyłanych do serwera.

3. Plik `firebase-key.json` (klucz serwisowy Firebase) nie powinien być publikowany w repozytorium publicznym. Najlepiej użyć zmiennych środowiskowych lub prywatnego repozytorium / menedżera sekretów (np. w chmurze).

4. Mechanizm przechowywania obrazów w bazie Firestore (w polu `image`) jest mało optymalny przy większej skali. Najlepszym rozwiązaniem jest przechowywanie plików w **Firebase Storage** lub podobnym rozwiązaniu i trzymanie jedynie linków do nich.

Rozszerzalność: Aplikacja serwera demonstruje główne koncepcje — w projekcie produkcyjnym warto dodać np. obsługę wyjątków, logowanie, ograniczenia i sprawdzanie zapytań, poprawić zapytania, ujednolicić nazwy parametrów i zmiennych, etc.

---

# Aplikacja Mobilna (React Native)

Poniższa dokumentacja opisuje przykładową aplikację React Native. Aplikacja obsługuje logowanie, rejestrowanie, wykonywanie zdjęć, klasyfikację potraw (w oparciu o endpoint serwera) oraz tworzenie i przeglądanie posiłków wraz z ich kaloriami.

---

## 1. Wprowadzenie

Aplikacja pozwala użytkownikom:

- **Logować się** i **rejestrować** (endpointy serwera).
- **Tworzyć** posiłki (z nazwą, kaloriami i zdjęciem).
- **Przeglądać** posiłki zebrane w bazie (z podziałem na daty, kalorie, itp.).
- **Robić zdjęcia** w aplikacji i przesyłać je do serwera w celu **klasyfikacji** (dostajemy przewidywaną klasę potrawy i przybliżoną wartość kaloryczną).
- **Nawigować** pomiędzy ekranami (Home, Camera, Meal Creation itp.) za pomocą **React Navigation**.

---

## 2. Struktura plików

Poniżej uproszczona struktura projektu (część plików konfiguracyjnych pominięta):

```
├── app
│ ├── screens
│ │ ├── LoginScreen.tsx
│ │ ├── HomeScreen.tsx
│ │ ├── CameraScreen.tsx
│ │ └── MealCreationScreen.tsx
│ ├── services
│ │ ├── auth.ts
│ │ ├── add_meal.ts
│ │ ├── classify_image.ts
│ │ └── meals.ts
│ ├── styles
│ │ └── style.ts
│ ├── types
│ │ └── index.ts
│ └── config.ts
└── ...
```

- **AppNavigator.tsx** – definiuje nawigację pomiędzy ekranami.
- **LoginScreen.tsx** – ekran logowania i rejestracji.
- **HomeScreen.tsx** – główny ekran z listą posiłków.
- **CameraScreen.tsx** – pozwala na zrobienie zdjęcia i klasyfikację.
- **MealCreationScreen.tsx** – pozwala na stworzenie nowego posiłku (nazwa, kalorie itp.).
- **services** – pliki komunikujące się z serwerem (autentykacja, tworzenie/odczyt posiłków, klasyfikacja).
- **config.ts** – przechowuje np. adres serwera (`SERVER_URL`).

---

## 3. Wymagania i konfiguracja

- **Node.js**
- **React Native**
- W projekcie używane są m.in.:
  - `expo-camera`, `expo-file-system`
  - `react-navigation`
  - `luxon` (do obsługi dat)
- W pliku **`config.ts`** należy określić adres serwera `SERVER_URL`, np.:
```
export const SERVER_URL = 'http://192.168.0.10:8000';
```

---

## 4. Główne ekrany aplikacji

### AppNavigator

*    Stack.Navigator – definiuje stos ekranów.
*    Aplikacja startuje na ekranie "Login".
*    Nazwy ekranów to "Login", "Home", "CameraScreen", "MealCreationScreen".

### CameraScreen

*    Wykorzystuje CameraView z expo-camera do robienia zdjęcia.
*    Po zrobieniu zdjęcia (takePhoto) plik jest zapisywany lokalnie (FileSystem), a następnie wysyłany do serwera przez classifyImage.
*    Po uzyskaniu wyniku klasyfikacji (klasa i przybliżone kalorie) można przejść do ekranu MealCreationScreen.

### HomeScreen

*    Wyświetla listę posiłków pobranych z serwera (getMeals).
*    Grupuje posiłki według daty i pokazuje łączną liczbę kalorii.
*    Zawiera przycisk przenoszący do CameraScreen w celu dodania nowego zdjęcia/posiłku.

### LoginScreen

*    Pozwala się zalogować (funkcja login) lub zarejestrować (register).
*    Po poprawnym logowaniu zapisuje authToken w AsyncStorage i przenosi na ekran Home.

### MealCreationScreen

*    Przyjmuje w parametrze photoUri i wynik klasyfikacji (klasa, kalorie).
*    Użytkownik może zmienić nazwę, wprowadzić kalorie, ustawić datę/godzinę.
*    Po zapisaniu do serwera (addMeal) wraca na ekran Home.

## 5. Usługi (services)

### addMeal

worzy FormData z plikiem zdjęcia (photoUri) i danymi posiłku

Wysyła zapytanie POST /add-meal do serwera z tokenem w nagłówku

### auth

#### login

Wysyła POST /token (username & password).

Zwraca access_token (ID użytkownika).

#### register

Wysyła POST /register (email & password).

### classifyImage

Wysyła POST /classify z danymi obrazu (FormData)

Oczekuje w odpowiedzi predicted_class, estimated_calories

### getMeals

Wysyła GET /meals (token w nagłówku)

Dekoduje zdjęcia (base64) i zapisuje je w plikach lokalnych

Zwraca listę posiłków (z polami: id, name, calories, time, image) 

---

## 6. Uwagi końcowe

Jest to pierwsza i bardzo poglądowa wersja aplikacji, która zapewnia podstawową funkcjonalność.

---

# Uczenie Maszynowe


