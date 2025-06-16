import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

df = pd.read_csv("dropout_data.csv")

X = df[[
    "days_since_last_login",
    "assignments_submitted",
    "discussions_participated",
    "note_count",
    "days_enrolled"
]]
y = df["is_dropout"]

model = RandomForestClassifier()
model.fit(X, y)

joblib.dump(model, "api/ml_models/dropout_model.pkl")
print("Model saved")
