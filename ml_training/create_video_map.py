import joblib
import pandas as pd

df = pd.read_excel('c:\\Users\\kasun\\Documents\\lecture notes\\4th year\\Research Project\\R26-IT-106-main\\ml_training\\postpartum_exercise_dataset.xlsx')

video_map = {}
for i in range(1, 6):
    for idx, row in df.iterrows():
        name = row[f'exercise_{i}_name']
        video = row[f'exercise_{i}_video_url']
        if pd.notna(name) and pd.notna(video) and name != 'none':
            video_map[name] = video

joblib.dump(video_map, 'c:\\Users\\kasun\\Documents\\lecture notes\\4th year\\Research Project\\R26-IT-106-main\\ml_training\\video_map.pkl')
print("Video Map saved!")
