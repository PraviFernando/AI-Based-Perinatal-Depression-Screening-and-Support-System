const transliterateMap = {
    // basic transliteration map for phonetic Sinhala typing
    'a': 'අ', 'aa': 'ආ', 'i': 'ඉ', 'ii': 'ඊ', 'u': 'උ', 'uu': 'ඌ',
    'e': 'එ', 'ee': 'ඒ', 'o': 'ඔ', 'oo': 'ඕ',
    'k': 'ක්', 'ka': 'ක', 'kaa': 'කා', 'ki': 'කි', 'kii': 'කී', 'ku': 'කු', 'kuu': 'කූ',
    'm': 'ම්', 'ma': 'ම', 'maa': 'මා', 'mi': 'මි', 'mii': 'මී', 'mu': 'මු', 'muu': 'මූ',
    'n': 'න්', 'na': 'න', 'l': 'ල්', 'la': 'ල', 'r': 'ර්', 'ra': 'ර',
    's': 'ස්', 'sa': 'ස', 't': 'ට්', 'ta': 'ට', 'b': 'බ්', 'ba': 'බ',
    'g': 'ග්', 'ga': 'ග', 'd': 'ඩ්', 'da': 'ඩ', 'p': 'ප්', 'pa': 'ප',
    // Add more as needed
};

export const transliterate = (text) => {
    let lower = text.toLowerCase();
    // A simplified phonetic mapping
    for (const key of Object.keys(transliterateMap).sort((a, b) => b.length - a.length)) {
        if (lower.startsWith(key)) {
            return transliterateMap[key] + text.slice(key.length);
        }
    }
    // simple fallback
    return transliterateMap[lower] || text;
};
