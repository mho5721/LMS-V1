import pandas as pd
df = pd.read_csv("dropout_data.csv")
print(df["is_dropout"].value_counts())
