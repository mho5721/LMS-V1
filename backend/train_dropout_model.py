# import pandas as pd
# from sklearn.ensemble import RandomForestClassifier
# from sklearn.metrics import confusion_matrix, classification_report
# import joblib

# df = pd.read_csv("dropout_data.csv")

# X = df[[
#     "days_since_last_login",
#     "assignments_submitted",
#     "discussions_participated",
#     "note_count",
#     "days_enrolled"
# ]]
# y = df["is_dropout"]

# #Train model
# model = RandomForestClassifier(random_state=42)
# model.fit(X, y)

# predictions = model.predict(X)

# #Results
# print("\nPrediction Results:")
# results = pd.DataFrame({
#     'User ID': df['user_id'],
#     'Actual': y,
#     'Predicted': predictions
# })
# print(results)

# print("\nConfusion Matrix:")
# print(confusion_matrix(y, predictions))

# print("\nClassification Report:")
# print(classification_report(y, predictions))

# print("\nModel Accuracy:", model.score(X, y))

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.metrics import confusion_matrix, classification_report
from imblearn.over_sampling import SMOTE
import matplotlib.pyplot as plt
import seaborn as sns

# Load training data
train_data = pd.read_csv('dropout_train_data.csv')
test_data = pd.read_csv('dropout_test_data.csv')

# Feature engineering
def add_features(df):
    df['assignment_completion_rate'] = df['assignments_submitted'] / df['days_enrolled']
    df['engagement_score'] = (df['discussions_participated'] + df['note_count']) / df['days_enrolled']
    df['inactive_ratio'] = df['days_since_last_login'] / df['days_enrolled']
    return df

train_data = add_features(train_data)
test_data = add_features(test_data)

# Prepare features and target
feature_columns = [
    "days_since_last_login",
    "assignments_submitted",
    "discussions_participated",
    "note_count",
    "days_enrolled",
    "assignment_completion_rate",
    "engagement_score",
    "inactive_ratio"
]

X_train = train_data[feature_columns]
y_train = train_data['is_dropout']
X_test = test_data[feature_columns]
y_test = test_data['is_dropout']

# Handle class imbalance
smote = SMOTE(random_state=42)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

# Hyperparameter tuning
param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5],
    'min_samples_leaf': [1, 2]
}

# Find best parameters
grid_search = GridSearchCV(RandomForestClassifier(random_state=42), 
                         param_grid, 
                         cv=5,
                         scoring='accuracy')
grid_search.fit(X_train_resampled, y_train_resampled)

print("Best parameters:", grid_search.best_params_)

# Train final model with best parameters
best_model = grid_search.best_estimator_

# Cross-validation
cv_scores = cross_val_score(best_model, X_train, y_train, cv=5)
print("\nCross-validation scores:", cv_scores)
print(f"Average CV score: {cv_scores.mean():.2f} (+/- {cv_scores.std() * 2:.2f})")

# Feature importance
feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': best_model.feature_importances_
})
feature_importance = feature_importance.sort_values('importance', ascending=False)

# Plot feature importances
plt.figure(figsize=(10, 6))
sns.barplot(x='importance', y='feature', data=feature_importance)
plt.title('Feature Importance in Dropout Prediction')
plt.show()

# Make predictions on test set
test_predictions = best_model.predict(X_test)
test_probabilities = best_model.predict_proba(X_test)

# Create results dataframe
results = pd.DataFrame({
    'User ID': test_data['user_id'],
    'Actual': y_test,
    'Predicted': test_predictions,
    'Dropout Probability': test_probabilities[:, 1]
})

print("\nTest Set Predictions:")
print(results)

print("\nClassification Report:")
print(classification_report(y_test, test_predictions))

# Save model
import joblib
joblib.dump(best_model, "dropout_model.pkl")