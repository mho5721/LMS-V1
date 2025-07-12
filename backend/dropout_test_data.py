import pandas as pd
import numpy as np
# Generate synthetic test data
n_test = 30
n_samples = 100
np.random.seed(42)

# Generate test data with the same patterns
test_user_ids = np.arange(n_samples + 1, n_samples + n_test + 1)
test_days_since_last_login = np.random.randint(0, 31, n_test)
test_assignments_submitted = np.random.randint(0, 12, n_test)
test_discussions_participated = np.random.randint(0, 8, n_test)
test_note_count = np.random.randint(0, 10, n_test)
test_days_enrolled = np.random.randint(10, 90, n_test)

# Create test dropout labels
test_is_dropout = []
for i in range(n_test):
    dropout_score = (test_days_since_last_login[i] / 30 * 0.4 +
                    (1 - test_assignments_submitted[i] / 12) * 0.3 +
                    (1 - test_discussions_participated[i] / 8) * 0.2 +
                    (1 - test_note_count[i] / 10) * 0.1)
    test_is_dropout.append(1 if dropout_score > 0.7 or np.random.random() < 0.2 else 0)

# Create test DataFrame
test_data = pd.DataFrame({
    'user_id': test_user_ids,
    'days_since_last_login': test_days_since_last_login,
    'assignments_submitted': test_assignments_submitted,
    'discussions_participated': test_discussions_participated,
    'note_count': test_note_count,
    'days_enrolled': test_days_enrolled,
    'is_dropout': test_is_dropout
})

# Save test data
test_data.to_csv('dropout_test_data.csv', index=False)
print("\nTest Data Preview:")
print(test_data.head())