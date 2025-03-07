#v2.1
from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime
from fastai.vision.all import load_learner, PILImage
import firebase_admin
from firebase_admin import credentials, firestore
import bcrypt
import uuid
from pathlib import Path
from PIL import Image
import os
import pathlib
import base64

# Inicjalizacja Firebase
firebase_key_path = Path("firebase-key.json")
cred = credentials.Certificate(firebase_key_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Ścieżki do modeli
script_path = Path(__file__).resolve()
script_dir = script_path.parent
classification_model_path = os.path.join(script_dir, 'models', 'classification_model.pkl')
regression_model_path = os.path.join(script_dir, 'models', 'regression_model.pkl')

# Fixing PosixPath issue on Windows
if os.name == 'nt':
    posix_backup = pathlib.PosixPath
    pathlib.PosixPath = pathlib.WindowsPath
    classification_learn = load_learner(classification_model_path)
    regression_learn = load_learner(regression_model_path)
    pathlib.PosixPath = posix_backup
else:
    classification_learn = load_learner(classification_model_path)
    regression_learn = load_learner(regression_model_path)

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Modele danych
class Ingredient(BaseModel):
    name: str
    calories: int

class Meal(BaseModel):
    id: str
    userId: str
    name: str
    ingredientIds: list
    calories: int
    image: bytes = None
    time: datetime

# Rejestracja użytkownika
@app.post("/register")
async def register(email: str, password: str):
    try:
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        user_id = str(uuid.uuid4())

        db.collection("users").document(user_id).set({
            "id": user_id,
            "email": email,
            "passwordHash": hashed_password,
            "createdAt": firestore.SERVER_TIMESTAMP
        })
        return {"message": "User registered successfully", "userId": user_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Logowanie użytkownika
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        user_ref = db.collection("users").where("email", "==", form_data.username).stream()
        user = next(user_ref, None)
        if not user:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        user_data = user.to_dict()
        if not bcrypt.checkpw(form_data.password.encode("utf-8"), user_data["passwordHash"].encode("utf-8")):
            raise HTTPException(status_code=400, detail="Invalid email or password")

        return {"access_token": user_data["id"], "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Autoryzacja użytkownika
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        user_ref = db.collection("users").document(token).get()
        if not user_ref.exists:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_ref.to_dict()["email"]
    except:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Dodanie posiłku
# Add meal
@app.post("/add-meal")
async def add_meal(
    name: str,
    calories: int,
    time: datetime,
    user_email: str = Depends(get_current_user),
    file: UploadFile = File(None)
):
    try:
        meal_id = str(uuid.uuid4())
        image_data = None

        if file:
            image_data = await file.read()

        if time is None:
            time = datetime.now()

        db.collection("meals").document(meal_id).set({
            "id": meal_id,
            "userId": user_email,
            "name": name,
            "ingredientIds": [],
            "calories": calories,
            "image": image_data,
            "time": time.isoformat(),
        })
        return {"message": "Meal created successfully", "mealId": meal_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Update meal
@app.put("/update-meal/{meal_id}")
async def update_meal(
    meal_id: str = None,
    name: str = None,
    calories: int = None,
    time: datetime = None,
    file: UploadFile = File(None),
    user_email: str = Depends(get_current_user)
):
    try:
        meal_ref = db.collection("meals").document(meal_id)
        meal_doc = meal_ref.get()
        if not meal_doc.exists:
            raise HTTPException(status_code=404, detail="Meal not found")

        meal_data = meal_doc.to_dict()
        if meal_data["userId"] != user_email:
            raise HTTPException(status_code=403, detail="Not authorized to update this meal")

        update_data = {}
        if name is not None:
            update_data["name"] = name
        if calories is not None:
            update_data["calories"] = calories
        if file:
            image_data = await file.read()
            update_data["image"] = image_data
        if time is not None:
            update_data["time"] = time.isoformat()

        meal_ref.update(update_data)
        return {"message": "Meal updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Dodanie składników do posiłku
@app.post("/add-ingredients/{meal_id}")
async def add_ingredients(meal_id: str, ingredients: list[Ingredient], user_email: str = Depends(get_current_user)):
    try:
        meal_ref = db.collection("meals").document(meal_id)
        meal_doc = meal_ref.get()
        if not meal_doc.exists:
            raise HTTPException(status_code=404, detail="Meal not found")

        meal_data = meal_doc.to_dict()
        ingredient_ids = meal_data["ingredientIds"]
        total_calories = meal_data["calories"]

        for ingredient in ingredients:
            ingredient_id = str(uuid.uuid4())
            db.collection("ingredients").document(ingredient_id).set({
                "id": ingredient_id,
                "mealId": meal_id,
                "name": ingredient.name,
                "calories": ingredient.calories
            })
            ingredient_ids.append(ingredient_id)
            total_calories += ingredient.calories

        meal_ref.update({"ingredientIds": ingredient_ids, "calories": total_calories})
        return {"message": "Ingredients added successfully", "ingredientIds": ingredient_ids,
                "calories": total_calories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Pobranie posiłków użytkownika
@app.get("/meals")
async def get_meals(user_email: str = Depends(get_current_user)):
    try:
        meals_ref = db.collection("meals").where("userId", "==", user_email).stream()
        meals = []
        for meal in meals_ref:
            meal_data = meal.to_dict()
            if meal_data.get("image"):
                meal_data["image"] = base64.b64encode(meal_data["image"]).decode('utf-8')
            meals.append(meal_data)
        return meals
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



# Klasyfikacja zdjęcia
@app.post("/classify")
async def classify_image(file: UploadFile = File(...)):
    try:
        img = Image.open(file.file).convert("RGB")
        img = img.resize((256, 256))  # Adjust the size as per your model's requirement
        img_tensor = PILImage.create(img)

        # Przewiduj klasę obrazu
        pred, pred_idx, probs = classification_learn.predict(img_tensor)
        # Przewiduj kalorie
        calorie_pred, _, _ = regression_learn.predict(img_tensor)
        calorie_pred = float(calorie_pred[0])

        return {
            "predicted_class": pred,
            "probability": probs[pred_idx].item(),
            "estimated_calories": calorie_pred
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nie udało się przewidzieć klasy lub kalorii: {e}")