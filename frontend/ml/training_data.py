"""
================================================================
BLOOM — Training Data Module
================================================================
All training sentences live here. To improve accuracy, just add
more sentences to any category below and run /retrain.

STRUCTURE:
  TRAIN_TEXTS   → list of diary-like sentences
  TRAIN_REASONS → matching reason label for each sentence
  TRAIN_EMOTIONS→ matching emotion label for each sentence

CATEGORIES:
  Reasons  : loneliness, fatigue, anxiety, bonding_issues,
             lack_of_support, sleep_problems, loss_of_confidence,
             overwhelmed, physical_discomfort, negative_thoughts
  Emotions : happy, sad, stressed, anxious
  Risk     : low, medium, high  (computed, not trained)
================================================================
"""

# ──────────────────────────────────────────────────────────────
# LONELINESS  (emotion: sad)
# ──────────────────────────────────────────────────────────────
LONELINESS_TEXTS = [
    "I feel so alone and nobody is around me",
    "I am completely isolated from everyone I love",
    "Nobody checks on me or asks how I am doing",
    "I feel forgotten by my friends and family",
    "I spend all day without talking to another adult",
    "My husband goes to work and I am left completely alone",
    "I feel invisible like no one even sees me",
    "I miss having conversations with other people",
    "No one visits me or calls to see how I am",
    "I feel abandoned after giving birth",
    "I used to have friends but now they have all disappeared",
    "I sit at home alone with my baby every single day",
    "I feel so disconnected from the world around me",
    "Nobody around me understands what I am going through",
    "I feel like I am on an island all by myself",
    "Even when people are near me I feel deeply alone",
    "I long for someone to talk to and connect with",
    "My social life is gone and I feel empty inside",
    "I have no one to share my struggles with",
    "I feel like I disappeared after becoming a mother",
    "No friends come over anymore since the baby arrived",
    "I feel so cut off from the rest of the world",
    "Being at home all day makes me feel so isolated",
    "I wish someone would reach out and check on me",
    "I cry alone because there is no one to comfort me",
    "I feel like a ghost in my own life",
    "My loneliness is unbearable and it hurts so much",
    "I just want someone to sit with me and talk",
    "The silence in this house makes me feel so alone",
    "I have never felt this lonely in my entire life",
]
LONELINESS_REASONS = ["loneliness"] * len(LONELINESS_TEXTS)
LONELINESS_EMOTIONS = ["sad"] * len(LONELINESS_TEXTS)

# ──────────────────────────────────────────────────────────────
# FATIGUE  (emotion: stressed)
# ──────────────────────────────────────────────────────────────
FATIGUE_TEXTS = [
    "I am extremely tired and have no energy left at all",
    "I feel completely drained and burnt out every single day",
    "I cannot even get out of bed in the morning",
    "I am running on empty and feel exhausted all the time",
    "My body is completely worn out from caring for my baby",
    "I have not had a proper rest in weeks",
    "I feel like a zombie because I am so tired",
    "Every task feels impossible because I have no energy",
    "I am so fatigued that even brushing my teeth is hard",
    "My exhaustion is affecting everything I do",
    "I need to sleep so badly but I cannot get a break",
    "I have been surviving on barely any sleep for months",
    "I feel mentally and physically exhausted every day",
    "The tiredness never goes away no matter what I do",
    "I feel like I am falling apart from pure exhaustion",
    "My body aches and I am so desperately tired",
    "I cannot function properly because I am so depleted",
    "I feel like I have nothing left to give",
    "Being this tired is making me feel hopeless",
    "I am too exhausted to even enjoy time with my baby",
    "I have no stamina and feel weak throughout the day",
    "The constant fatigue is overwhelming me completely",
    "I feel sluggish and heavy from the moment I wake up",
    "I am so tired that simple decisions feel impossible",
    "Exhaustion is making me irritable and short tempered",
    "I feel like I need a week of sleep just to recover",
    "My energy is completely depleted and I feel broken",
    "I cannot remember the last time I felt rested",
    "I feel hollow and empty from the lack of sleep",
    "This level of tiredness feels unbearable and never-ending",
]
FATIGUE_REASONS = ["fatigue"] * len(FATIGUE_TEXTS)
FATIGUE_EMOTIONS = ["stressed"] * len(FATIGUE_TEXTS)

# ──────────────────────────────────────────────────────────────
# ANXIETY  (emotion: anxious)
# ──────────────────────────────────────────────────────────────
ANXIETY_TEXTS = [
    "I feel anxious and worried about everything all the time",
    "My heart is racing and I cannot calm down",
    "I keep overthinking every little thing and cannot stop",
    "I am scared that something bad is going to happen",
    "I feel nervous and restless and cannot relax",
    "My mind will not stop racing and I feel panicked",
    "I have constant anxiety about being a good mother",
    "I feel on edge all the time and cannot settle",
    "Small things trigger my anxiety and I spiral quickly",
    "I feel a constant sense of dread that never goes away",
    "I worry constantly about my baby's health and safety",
    "I cannot focus on anything because anxiety controls me",
    "I feel a tight chest and shortness of breath from worry",
    "My hands shake when I think about all my responsibilities",
    "I feel so overwhelmed by fear and anxious thoughts",
    "I catastrophize everything and imagine the worst outcomes",
    "I feel panicky even when everything seems fine",
    "My anxiety keeps me awake even when I am exhausted",
    "I check on my baby constantly out of fear",
    "I cannot stop worrying no matter how hard I try",
    "I feel like something terrible is about to happen",
    "My anxiety makes even simple tasks feel impossible",
    "I feel tense in my shoulders and stomach from worry",
    "Anxiety is stealing my joy and my ability to rest",
    "I panic when my baby cries and I cannot calm myself",
    "I feel trapped in a cycle of worry and fear",
    "Every small sound makes me jump and feel afraid",
    "I feel anxious in social situations and avoid going out",
    "The anxiety feels like a storm in my chest and head",
    "I feel like I am always bracing for disaster",
]
ANXIETY_REASONS = ["anxiety"] * len(ANXIETY_TEXTS)
ANXIETY_EMOTIONS = ["anxious"] * len(ANXIETY_TEXTS)

# ──────────────────────────────────────────────────────────────
# BONDING ISSUES  (emotion: sad)
# ──────────────────────────────────────────────────────────────
BONDING_TEXTS = [
    "I cannot feel a real connection with my baby",
    "I feel emotionally distant from my newborn",
    "I try to love my baby but feel nothing inside",
    "I feel detached and disconnected from my child",
    "I do not feel the bond everyone told me I would feel",
    "I look at my baby and feel empty instead of love",
    "I feel guilty because I am not attached to my baby",
    "I expected to feel overwhelming love but feel nothing",
    "The bond between me and my baby feels broken",
    "I feel like a caregiver not a mother to my baby",
    "I am scared I will never feel connected to my child",
    "My baby feels like a stranger to me and I feel terrible",
    "I feel no instinct when I am with my baby",
    "I care for my baby but do not feel the love I expected",
    "I watch other mothers and wonder why I feel so different",
    "The lack of bond makes me feel like a bad mother",
    "I feel like I am going through the motions with no feeling",
    "I hold my baby and feel emotionally numb inside",
    "I am ashamed to admit I do not feel attached",
    "I feel distant from my baby even when we are together",
    "I do not enjoy holding my baby the way I thought I would",
    "I feel no connection and it breaks my heart",
    "I cannot understand why I feel so disconnected",
    "I worry my baby can feel my emotional absence",
    "I feel indifferent when my baby smiles at me",
    "The bond I was promised never came and I feel cheated",
    "I feel like a failure as a mother because of this distance",
    "My heart feels closed off from my own baby",
    "I feel grief over the bond I thought I would have",
    "I am desperate to feel connected but it just will not come",
]
BONDING_REASONS = ["bonding_issues"] * len(BONDING_TEXTS)
BONDING_EMOTIONS = ["sad"] * len(BONDING_TEXTS)

# ──────────────────────────────────────────────────────────────
# LACK OF SUPPORT  (emotion: sad)
# ──────────────────────────────────────────────────────────────
SUPPORT_TEXTS = [
    "Nobody helps me with the baby and I feel so alone",
    "I am doing absolutely everything by myself",
    "My family is not supportive at all during this time",
    "My husband does not help with the baby or housework",
    "I feel abandoned by the people who should support me",
    "No one is there for me when I need help the most",
    "I have to handle everything with zero assistance",
    "My partner leaves all responsibility to me alone",
    "I feel invisible and unsupported by my loved ones",
    "I wish someone would offer to help without me asking",
    "Nobody in my family understands what I am going through",
    "I feel like I am in this parenting journey completely alone",
    "My mother-in-law gives criticism not help",
    "I have no support system and it is destroying me",
    "I beg for help but nobody listens or responds",
    "I feel like a single parent even though I am married",
    "My friends do not check on me after the baby arrived",
    "I cannot rely on anyone around me to help me",
    "Everyone gives advice but nobody actually helps",
    "I feel resentment because I carry this burden alone",
    "I asked for help and was told to manage on my own",
    "No one takes my exhaustion seriously enough to help",
    "I need more support than I am getting from everyone",
    "I feel like I am failing because I have no backup",
    "The people around me do not see how much I am struggling",
    "I am burning out from doing everything without support",
    "I feel let down by my partner during this hard time",
    "Nobody steps in unless I explicitly beg for it",
    "I feel used and unsupported by the people around me",
    "I am running on empty because no one shares the load",
]
SUPPORT_REASONS = ["lack_of_support"] * len(SUPPORT_TEXTS)
SUPPORT_EMOTIONS = ["sad"] * len(SUPPORT_TEXTS)

# ──────────────────────────────────────────────────────────────
# SLEEP PROBLEMS  (emotion: stressed)
# ──────────────────────────────────────────────────────────────
SLEEP_TEXTS = [
    "I cannot sleep at night even when my baby is sleeping",
    "I keep waking up every hour throughout the night",
    "I am severely sleep deprived and it is affecting everything",
    "My sleep is broken and interrupted and I feel terrible",
    "I barely sleep anymore and my mind cannot switch off",
    "I have not had more than two hours of sleep in weeks",
    "I feel delirious from the lack of continuous sleep",
    "Even when I close my eyes my mind keeps racing",
    "I wake up multiple times a night and feel destroyed",
    "The sleep deprivation is making me emotional and unstable",
    "I cannot get my baby to sleep and I am exhausted",
    "I feel like a walking zombie from no proper sleep",
    "I lie awake worrying even when I have a chance to sleep",
    "I cannot fall asleep and it is making me anxious",
    "My insomnia is making everything feel worse than it is",
    "I am struggling to function on so little sleep daily",
    "I have chronic sleep deprivation and my body is suffering",
    "I feel irritable and tearful because I am so sleep deprived",
    "Every night is a battle and I dread going to bed",
    "I feel desperate for just one full night of unbroken sleep",
    "The exhaustion from no sleep is breaking my mental health",
    "I cannot nap during the day even though I am desperate",
    "Sleep deprivation feels like a form of torture",
    "I am so tired but cannot sleep and it is so frustrating",
    "My baby wakes up constantly and I have no energy left",
    "I feel like I am losing my mind from sleep deprivation",
    "I cannot remember what a good night sleep feels like",
    "I am so tired I could cry but I still cannot sleep",
    "Sleep feels like a luxury I am no longer allowed to have",
    "The night feeds are destroying me mentally and physically",
]
SLEEP_REASONS = ["sleep_problems"] * len(SLEEP_TEXTS)
SLEEP_EMOTIONS = ["stressed"] * len(SLEEP_TEXTS)

# ──────────────────────────────────────────────────────────────
# LOSS OF CONFIDENCE  (emotion: sad)
# ──────────────────────────────────────────────────────────────
CONFIDENCE_TEXTS = [
    "I feel like a terrible mother and I am failing my baby",
    "I have lost all confidence in myself as a parent",
    "I feel useless and completely incapable of doing this",
    "I doubt every single decision I make for my baby",
    "I feel like I am getting everything wrong all the time",
    "I am not the mother I wanted to be and I hate myself",
    "I feel worthless and like I contribute nothing",
    "I cannot trust my own instincts as a mother",
    "I feel like other mothers are doing so much better than me",
    "I compare myself to others and always feel less than",
    "My confidence has completely disappeared since giving birth",
    "I feel like a fraud pretending to be a good mother",
    "I cannot do anything right no matter how hard I try",
    "I feel incompetent and ashamed of my parenting",
    "I worry constantly that I am damaging my baby",
    "I feel small and inadequate in every area of my life",
    "I used to feel capable but now I doubt everything",
    "I feel like I am not enough for my baby or anyone",
    "My self-worth has hit rock bottom since becoming a mother",
    "I feel broken and unsure about everything I do",
    "I am constantly second-guessing myself as a mother",
    "I feel like a failure and I cannot shake this feeling",
    "I have lost my sense of self and feel so unsure",
    "I feel humiliated by my own inability to cope",
    "I used to be confident but now I feel like nobody",
    "I do not trust myself to make the right choices",
    "I feel like my identity has been completely erased",
    "I am ashamed of how much I struggle every day",
    "I feel defeated and have given up on believing in myself",
    "I feel like everyone can see how bad of a mother I am",
]
CONFIDENCE_REASONS = ["loss_of_confidence"] * len(CONFIDENCE_TEXTS)
CONFIDENCE_EMOTIONS = ["sad"] * len(CONFIDENCE_TEXTS)

# ──────────────────────────────────────────────────────────────
# OVERWHELMED  (emotion: stressed)
# ──────────────────────────────────────────────────────────────
OVERWHELMED_TEXTS = [
    "Everything feels like too much and I cannot cope",
    "I feel overwhelmed by all my responsibilities at once",
    "I cannot handle all this pressure and I am breaking down",
    "I am drowning in responsibilities and cannot breathe",
    "I feel like I am about to completely break down",
    "There is too much to do and not enough of me to do it",
    "I feel crushed under the weight of everything I must do",
    "I cannot keep up with everything and feel like I am sinking",
    "My to-do list never ends and I feel paralyzed by it",
    "I feel like I am constantly failing at everything at once",
    "The demands of motherhood are too much for me right now",
    "I feel like I am being pulled in every direction at once",
    "I cannot manage the baby the house and my own needs",
    "Everything is falling apart and I cannot fix any of it",
    "I feel so overwhelmed I want to run away from everything",
    "I cannot find a moment of peace or calm in my day",
    "I feel like I am always behind and can never catch up",
    "The weight of everything I must do is crushing me",
    "I feel like I am at my absolute breaking point right now",
    "I have too many responsibilities and zero capacity left",
    "I feel suffocated by all the demands placed on me",
    "Everything feels urgent and important and I cannot focus",
    "I feel overwhelmed to tears nearly every single day",
    "I cannot prioritize because everything feels critical",
    "I feel like I need help with everything but get none",
    "I am maxed out and have nothing left to give anyone",
    "I feel like a hamster in a wheel going nowhere",
    "The chaos of my life feels unmanageable and endless",
    "I feel overwhelmed by even the smallest tasks now",
    "I cannot see a way through this mountain of responsibilities",
]
OVERWHELMED_REASONS = ["overwhelmed"] * len(OVERWHELMED_TEXTS)
OVERWHELMED_EMOTIONS = ["stressed"] * len(OVERWHELMED_TEXTS)

# ──────────────────────────────────────────────────────────────
# PHYSICAL DISCOMFORT  (emotion: stressed)
# ──────────────────────────────────────────────────────────────
PHYSICAL_TEXTS = [
    "My body is in constant pain since giving birth",
    "I feel sore and very uncomfortable all the time",
    "My recovery from birth has been extremely painful",
    "I cannot move properly because of the pain in my body",
    "My body hurts all the time and I cannot get relief",
    "My c-section wound is painful and healing very slowly",
    "I am struggling with severe physical pain after delivery",
    "My stitches are uncomfortable and make everything harder",
    "Breastfeeding is causing me a lot of physical pain",
    "My back hurts constantly from carrying and nursing my baby",
    "I have headaches every day and my body feels broken",
    "My physical recovery is much harder than I expected",
    "I feel physical pain every time I try to do something",
    "My body does not feel like my own anymore after birth",
    "I am in pain and no one seems to take it seriously",
    "The physical discomfort is affecting my mood and mental state",
    "I feel like my body is falling apart after childbirth",
    "I have aches and pains in places I never expected",
    "My pelvic floor is so sore and daily tasks are agony",
    "I feel physically weak and cannot do basic things",
    "The pain is constant and it is wearing me down mentally",
    "I feel like my body betrayed me during and after birth",
    "I am struggling with physical discomfort around the clock",
    "I cannot sleep comfortably because of the physical pain",
    "My body needs rest but my baby needs me and I cannot stop",
    "I have not felt physically comfortable in a very long time",
    "The soreness is relentless and I do not know how to cope",
    "I feel like I am trapped in a body that is constantly hurting",
    "My physical symptoms are being dismissed by my doctor",
    "I feel broken physically and I do not know when it will end",
]
PHYSICAL_REASONS = ["physical_discomfort"] * len(PHYSICAL_TEXTS)
PHYSICAL_EMOTIONS = ["stressed"] * len(PHYSICAL_TEXTS)

# ──────────────────────────────────────────────────────────────
# NEGATIVE THOUGHTS  (emotion: sad)
# ──────────────────────────────────────────────────────────────
NEGATIVE_TEXTS = [
    "I feel completely hopeless and cannot see any future",
    "I have dark thoughts that scare and frighten me",
    "I feel like giving up on everything in my life",
    "I cannot see any light at the end of this tunnel",
    "I feel mentally broken and beyond the point of repair",
    "I have thoughts that I wish I could make disappear",
    "I feel like the world would be fine without me",
    "I feel deep despair that I cannot shake off",
    "I feel worthless and like nothing will ever improve",
    "I have intrusive thoughts that I am ashamed of",
    "I feel like I am stuck in a dark hole I cannot escape",
    "I feel a heavy sadness that never seems to lift",
    "I am having thoughts about not wanting to be here",
    "I feel like I have lost all hope and purpose in life",
    "Dark and scary thoughts come to me when I least expect it",
    "I feel like a burden to everyone around me",
    "I feel like no one would miss me if I disappeared",
    "I feel like I cannot go on much longer like this",
    "I have thoughts that frighten me and I cannot stop them",
    "I feel mentally unwell and I do not know who to tell",
    "I feel so low that I wonder what the point of anything is",
    "I cannot escape the darkness in my mind",
    "I feel numb and detached from everything and everyone",
    "I feel grief for who I was before all of this",
    "I feel like I am disappearing into a very dark place",
    "I have given up hope that things will ever get better",
    "I feel deep sadness and emptiness all the time",
    "I feel like my brain is working against me",
    "I feel trapped in negative thoughts with no way out",
    "I feel devastated and broken in ways I cannot explain",
]
NEGATIVE_REASONS = ["negative_thoughts"] * len(NEGATIVE_TEXTS)
NEGATIVE_EMOTIONS = ["sad"] * len(NEGATIVE_TEXTS)

# ──────────────────────────────────────────────────────────────
# HAPPY  (emotion: happy)
# ──────────────────────────────────────────────────────────────
HAPPY_TEXTS = [
    "I feel happy and peaceful and grateful today",
    "My baby smiled at me and it made my whole day beautiful",
    "I feel blessed to have this little one in my life",
    "Today was a calm and genuinely lovely day",
    "I feel hopeful and positive about the future ahead",
    "I had a wonderful moment with my baby today",
    "I feel content and at peace with where I am right now",
    "My heart is full of love for my little family",
    "I feel joyful and happy despite the challenges",
    "Today I felt like myself again and it was wonderful",
    "I am grateful for the small beautiful moments with my baby",
    "I feel optimistic and energetic today which is amazing",
    "My baby laughed today and I cried happy tears",
    "I feel like I am finally finding my rhythm as a mother",
    "Today was a good day and I feel proud of myself",
    "I feel loved and supported by my partner today",
    "I had a moment of pure joy playing with my baby",
    "I feel more confident today than I have in weeks",
    "Things are looking up and I feel hopeful again",
    "I feel a deep sense of purpose and love in my role",
    "Today I noticed the beauty in the simple quiet moments",
    "I feel recharged and more like myself today",
    "My baby is healthy and I feel overwhelming gratitude",
    "I feel warmth and connection with my baby today",
    "Today felt manageable and even enjoyable at times",
    "I am starting to feel like myself again and that is wonderful",
    "I feel calm and present in this beautiful moment",
    "I feel so much love it fills me completely",
    "Today I smiled and laughed and it felt so good",
    "I am proud of myself for getting through another day well",
]
HAPPY_REASONS = ["loneliness"] * len(HAPPY_TEXTS)   # fallback reason for happy
HAPPY_EMOTIONS = ["happy"] * len(HAPPY_TEXTS)

# ──────────────────────────────────────────────────────────────
# COMBINE ALL DATA
# ──────────────────────────────────────────────────────────────
TRAIN_TEXTS = (
    LONELINESS_TEXTS + FATIGUE_TEXTS + ANXIETY_TEXTS + BONDING_TEXTS +
    SUPPORT_TEXTS + SLEEP_TEXTS + CONFIDENCE_TEXTS + OVERWHELMED_TEXTS +
    PHYSICAL_TEXTS + NEGATIVE_TEXTS + HAPPY_TEXTS
)

TRAIN_REASONS = (
    LONELINESS_REASONS + FATIGUE_REASONS + ANXIETY_REASONS + BONDING_REASONS +
    SUPPORT_REASONS + SLEEP_REASONS + CONFIDENCE_REASONS + OVERWHELMED_REASONS +
    PHYSICAL_REASONS + NEGATIVE_REASONS + HAPPY_REASONS
)

TRAIN_EMOTIONS = (
    LONELINESS_EMOTIONS + FATIGUE_EMOTIONS + ANXIETY_EMOTIONS + BONDING_EMOTIONS +
    SUPPORT_EMOTIONS + SLEEP_EMOTIONS + CONFIDENCE_EMOTIONS + OVERWHELMED_EMOTIONS +
    PHYSICAL_EMOTIONS + NEGATIVE_EMOTIONS + HAPPY_EMOTIONS
)

assert len(TRAIN_TEXTS) == len(TRAIN_REASONS) == len(TRAIN_EMOTIONS), \
    "Mismatch: texts/reasons/emotions must have equal length!"

TOTAL_EXAMPLES = len(TRAIN_TEXTS)

# ============================================================
# STANDALONE MODEL EVALUATION
# ============================================================
if __name__ == "__main__":
    """
    Run this file directly (python training_data.py) to compare
    the accuracy of different ML models on this dataset.
    """
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.svm import LinearSVC
        from sklearn.tree import DecisionTreeClassifier
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.pipeline import Pipeline
        from sklearn.model_selection import cross_val_score
        import numpy as np
        import re

        def simple_clean(text):
            return re.sub(r"[^\w\s]", " ", text.lower().strip())

        print(f"\n🌸 BLOOM ML EVALUATION")
        print(f"📊 Dataset Size: {TOTAL_EXAMPLES} examples\n")

        cleaned = [simple_clean(t) for t in TRAIN_TEXTS]

        MODELS = {
            "SVM (LinearSVC)": LinearSVC(
                class_weight='balanced', 
                random_state=42, 
                max_iter=3000
            ),
            "Decision Tree": DecisionTreeClassifier(
                max_depth=20, 
                min_samples_split=4, 
                class_weight='balanced', 
                random_state=42
            ),
            "Random Forest": RandomForestClassifier(
                n_estimators=200, 
                max_depth=25, 
                min_samples_split=4, 
                class_weight='balanced', 
                random_state=42,
                n_jobs=-1
            )
        }

        for name, clf in MODELS.items():
            pipeline = Pipeline([
                ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
                ("clf", clf)
            ])

            # Evaluate Emotion Prediction
            e_scores = cross_val_score(pipeline, cleaned, TRAIN_EMOTIONS, cv=5)
            # Evaluate Reason Prediction
            r_scores = cross_val_score(pipeline, cleaned, TRAIN_REASONS, cv=5)

            print(f"✅ {name}:")
            print(f"   - Emotion Accuracy: {np.mean(e_scores):.3f}")
            print(f"   - Reason Accuracy:  {np.mean(r_scores):.3f}\n")

    except ImportError:
        print("❌ Scikit-learn not found. Please install: pip install scikit-learn")
