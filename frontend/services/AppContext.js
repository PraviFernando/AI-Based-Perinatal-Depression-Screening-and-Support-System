// ================================================================
// APP CONTEXT — AppContext.js  (Bloom Complete)
// ================================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { analyzeDiary, getRecommendations } from './emotionEngine';

const AppContext = createContext();

const DEMO_DIARIES = [
  "I feel so alone today. Nobody visits me and I miss having people around. The baby is fine but I feel empty inside.",
  "I am exhausted and overwhelmed. The baby won't sleep and I can't cope with everything. I feel like I'm failing.",
  "Today was a good day! Baby smiled at me and I felt a real connection. I feel more hopeful.",
  "I am so anxious about everything. My heart keeps racing and I worry something bad will happen to the baby.",
  "I don't feel connected to my baby. I try to bond but I feel nothing. I've lost all confidence.",
  "My body is in so much pain. My c-section recovery is really hard. I can't sleep and I feel hopeless.",
  "My husband doesn't help at all. My family isn't here either. I feel so unsupported and alone.",
];

const SI_DAYS = ['ඉරි','සඳු','අඟ','බදා','බ්‍රහ','සිකු','සෙන'];

export const AppProvider = ({ children }) => {
  const [user] = useState({ name: 'සාරා', weekPostpartum: 6 });
  const [userPreferredActivities, setUserPreferredActivities] = useState([]);
  const [userPreferredGames,      setUserPreferredGames]      = useState([]);
  const [preferencesSet,          setPreferencesSet]          = useState(false);
  const [latestAnalysis,          setLatestAnalysis]          = useState(null);
  const [latestRecommendations,   setLatestRecommendations]   = useState(null);
  const [demoDiaryIdx,            setDemoDiaryIdx]            = useState(0);
  const [moodHistory,             setMoodHistory]             = useState([
    { day:'සඳු', emotion:'stressed', risk:'medium' },
    { day:'අඟ',  emotion:'sad',      risk:'medium' },
    { day:'බදා', emotion:'happy',    risk:'low'    },
    { day:'බ්‍රහ',emotion:'stressed', risk:'low'    },
    { day:'සිකු', emotion:'sad',      risk:'medium' },
    { day:'සෙන', emotion:'happy',    risk:'low'    },
    { day:'ඉරි',  emotion:'stressed', risk:'low'    },
  ]);

  const processDiary = (diaryText) => {
    try {
      const analysis       = analyzeDiary(diaryText);
      const recommendations = getRecommendations(analysis, userPreferredActivities, userPreferredGames);
      setLatestAnalysis(analysis);
      setLatestRecommendations(recommendations);
      const today = SI_DAYS[new Date().getDay()];
      setMoodHistory(prev => [
        ...prev.slice(-6),
        { day: today, emotion: analysis.detectedEmotion, risk: analysis.riskLevel },
      ]);
      return { analysis, recommendations };
    } catch (err) {
      console.error('processDiary error:', err);
      return null;
    }
  };

  const simulateNextDiary = () => {
    const next = (demoDiaryIdx + 1) % DEMO_DIARIES.length;
    setDemoDiaryIdx(next);
    return processDiary(DEMO_DIARIES[next]);
  };

  const savePreferences = (activities, games) => {
    setUserPreferredActivities(activities);
    setUserPreferredGames(games);
    setPreferencesSet(true);
  };

  const nextDemoPreview = DEMO_DIARIES[(demoDiaryIdx + 1) % DEMO_DIARIES.length];

  useEffect(() => { processDiary(DEMO_DIARIES[0]); }, []);

    const setLatestData = (analysis, recommendations) => {
    setLatestAnalysis(analysis);
    setLatestRecommendations(recommendations);
    if (analysis) {
      const today = SI_DAYS[new Date().getDay()];
      setMoodHistory(prev => [
        ...prev.slice(-6),
        { day: today, emotion: analysis.detectedEmotion || analysis.emotion, risk: analysis.riskLevel },
      ]);
    }
  };

  return (
    <AppContext.Provider value={{
      user, userPreferredActivities, userPreferredGames,
      preferencesSet, savePreferences,
      latestAnalysis, latestRecommendations,
      moodHistory, processDiary, simulateNextDiary, nextDemoPreview, demoDiaryIdx,
      setLatestData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
