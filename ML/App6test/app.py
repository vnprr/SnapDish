import streamlit as st
from fastai.vision.all import *
import pathlib
from PIL import Image

# Ścieżka do skryptu
script_path = Path(__file__).resolve()
# Ścieżka do katalogu, w którym znajduje się skrypt
script_dir = script_path.parent

# Ścieżki do modeli
classification_model_path = os.path.join(script_dir, 'classification_model.pkl')
regression_model_path = os.path.join(script_dir, 'regression_model.pkl')

# Fixing PosixPath issue on Windows
posix_backup = pathlib.PosixPath
try:
    pathlib.PosixPath = pathlib.WindowsPath
    classification_learn = load_learner(classification_model_path)
    regression_learn = load_learner(regression_model_path)
finally:
    pathlib.PosixPath = posix_backup

def main():
    # Tytuł aplikacji
    st.title("Rozpoznawanie jedzenia i szacowanie kalorii")

    # Dodanie pola do przesyłania zdjęcia
    uploaded_file = st.file_uploader("Prześlij zdjęcie jedzenia", type=["jpg", "jpeg", "png"])

    if uploaded_file is not None:
        # Wczytaj obraz
        img = Image.open(uploaded_file).convert("RGB")
        st.image(img, caption='Załadowane zdjęcie', use_container_width=True)

        # Przekształć obraz do odpowiedniego rozmiaru
        img = img.resize((256, 256))  # Adjust the size as per your model's requirement

        # Przewiduj klasę obrazu
        try:
            img_tensor = PILImage.create(img)
            pred, pred_idx, probs = classification_learn.predict(img_tensor)
            # Wyświetl wynik klasyfikacji
            st.write(f"Przewidywana klasa: {pred}")
            st.write(f"Prawdopodobieństwa: {probs[pred_idx]:.4f}")

            # Przewiduj kalorie
            calorie_pred, _, _ = regression_learn.predict(img_tensor)
            # Konwersja wyniku regresji na float
            calorie_pred = float(calorie_pred[0])
            # Wyświetl wynik regresji
            st.write(f"Szacowane kalorie: {calorie_pred:.2f}")
        except Exception as e:
            st.error(f"Nie udało się przewidzieć klasy lub kalorii: {e}")

main()