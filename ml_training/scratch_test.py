import joblib
import pandas as pd

models = joblib.load('c:\\Users\\kasun\\Documents\\lecture notes\\4th year\\Research Project\\R26-IT-106-main\\ml_training\\exercise_recommendation_models.pkl')
encoders = joblib.load('c:\\Users\\kasun\\Documents\\lecture notes\\4th year\\Research Project\\R26-IT-106-main\\ml_training\\exercise_encoders.pkl')
feature_cols = joblib.load('c:\\Users\\kasun\\Documents\\lecture notes\\4th year\\Research Project\\R26-IT-106-main\\ml_training\\exercise_feature_cols.pkl')

df = pd.read_excel('c:\\Users\\kasun\\Documents\\lecture notes\\4th year\\Research Project\\R26-IT-106-main\\ml_training\\postpartum_exercise_dataset.xlsx')

video_map = {}
for i in range(1, 6):
    for idx, row in df.iterrows():
        name = row[f'exercise_{i}_name']
        video = row[f'exercise_{i}_video_url']
        if pd.notna(name) and pd.notna(video) and name != 'none':
            video_map[name] = video

print("Feature cols:", feature_cols)
print("Video Map sample:", list(video_map.items())[:5])
