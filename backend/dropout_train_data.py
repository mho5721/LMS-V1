import pandas as pd
import numpy as np
np.random.seed(42)

# Generate synthetic training data
n_samples = 100

# Generate user IDs
user_ids = np.arange(1, n_samples + 1)

# Generate features with realistic patterns
days_since_last_login = np.random.randint(0, 31, n_samples)
assignments_submitted = np.random.randint(0, 12, n_samples)
discussions_participated = np.random.randint(0, 8, n_samples)
note_count = np.random.randint(0, 10, n_samples)
days_enrolled = np.random.randint(10, 90, n_samples)

# Create dropout labels based on patterns
is_dropout = []
for i in range(n_samples):
    # Higher chance of dropout if:
    # - Many days since last login
    # - Few assignments submitted
    # - Low participation
    dropout_score = (days_since_last_login[i] / 30 * 0.4 +
                    (1 - assignments_submitted[i] / 12) * 0.3 +
                    (1 - discussions_participated[i] / 8) * 0.2 +
                    (1 - note_count[i] / 10) * 0.1)
    is_dropout.append(1 if dropout_score > 0.7 or np.random.random() < 0.2 else 0)

# Create training DataFrame
train_data = pd.DataFrame({
    'user_id': user_ids,
    'days_since_last_login': days_since_last_login,
    'assignments_submitted': assignments_submitted,
    'discussions_participated': discussions_participated,
    'note_count': note_count,
    'days_enrolled': days_enrolled,
    'is_dropout': is_dropout
})

# Save training data
train_data.to_csv('dropout_train_data.csv', index=False)
print("Training Data Preview:")
print(train_data.head())
print("\nDropout Rate:", train_data['is_dropout'].mean())