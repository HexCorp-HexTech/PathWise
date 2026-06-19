/* ============================================
   VIDYA AI — Localization (English & Hindi)
   ============================================ */
import { useAppStore } from '../store/appStore';

export const TRANSLATIONS = {
  en: {
    // Sidebar/Nav
    dashboard: 'Dashboard',
    subjects: 'Subjects',
    aiTutor: 'AI Tutor',
    achievements: 'Achievements',
    doubtRoom: 'Doubt Room',
    settings: 'Settings',
    overview: 'Overview',
    students: 'Students',
    analytics: 'Analytics',
    assignments: 'Assignments',
    content: 'Content',
    aiInsights: 'AI Insights',
    reports: 'Reports',
    logout: 'Logout',
    // Student Dashboard
    streak: 'Day Streak',
    totalXp: 'Total XP',
    level: 'Level',
    continueLearning: 'Continue Learning',
    resumeLesson: 'Resume lesson',
    yourSubjects: 'Your Subjects',
    recommended: 'Recommended For You',
    reviseWeak: 'Revise Weak Areas',
    askGyani: 'Ask Gyani to solve specific questions',
    viewAll: 'View All',
    // Parent Dashboard
    parentDashboard: "Parent's Dashboard",
    childProgress: "Child's Progress",
    weeklyReport: 'Weekly Report',
    studyTime: 'Study Time',
    quizzesFinished: 'Quizzes Finished',
    weeklyStudyHours: 'Weekly Study Hours',
    childStrengths: "Child's Strengths",
    childWeaknesses: "Child's Weaknesses",
    whatsappShare: 'Share via WhatsApp',
    mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
    // Settings
    appearance: 'Appearance',
    theme: 'Theme',
    fontSize: 'Font Size',
    langVoice: 'Language & Voice',
    language: 'Language',
    voice: 'Voice',
    offlineStorage: 'Offline Storage',
    privacy: 'Privacy',
    editProfile: 'Edit Profile',
    // Quiz / Results
    quiz: 'Quiz',
    timeTaken: 'Time Taken',
    correct: 'Correct',
    conceptMastery: 'Concept Mastery Analysis',
    needsPractice: 'Needs Practice',
    mastered: 'Mastered',
    backToChapter: 'Back to Chapter',
    askAiTutor: 'Ask AI Tutor',
    questionReview: 'Question Review',
    yourAnswer: 'Your Answer',
    correctAnswer: 'Correct Answer',
    // Teacher Overview
    classroomCode: 'Classroom Code',
    totalStudents: 'Total Students',
    activeToday: 'Active Today',
    avgScore: 'Avg. Score',
    doubts: 'Doubts',
    performanceOverview: 'Performance Overview',
    recentActivity: 'Recent Activity',
    masteryHeatmap: 'Chapter Mastery Heatmap',
    atRiskStudents: 'At Risk Students',
    topPerformers: 'Top Performers',

    // Subjects
    'Mathematics': 'Mathematics',
    'Science': 'Science',
    'English': 'English',
    'Social Science': 'Social Science',
    'Physics': 'Physics',
    'Chemistry': 'Chemistry',
    'Biology': 'Biology',
    'Algebra (Math I)': 'Algebra (Math I)',
    'Geometry (Math II)': 'Geometry (Math II)',
    'Math': 'Mathematics',

    // Greetings
    'Good Night': 'Good Night',
    'Good Morning': 'Good Morning',
    'Good Afternoon': 'Good Afternoon',
    'Good Evening': 'Good Evening',

    // Dashboard dynamic messages
    'letsWorkOn': "Let's work on",
    'today': 'today!',
    'amazingReady': "You are doing amazing. Ready to explore a new chapter??",
    'adventureMap': 'Your Adventure Map',
    'continue': 'Continue',
  },
  hi: {
    // Sidebar/Nav
    dashboard: 'डैशबोर्ड',
    subjects: 'विषय',
    aiTutor: 'एआई ट्यूटर',
    achievements: 'उपलब्धियां',
    doubtRoom: 'संदेह कक्ष',
    settings: 'सेटिंग्स',
    overview: 'अवलोकन',
    students: 'छात्र',
    analytics: 'विश्लेषण',
    assignments: 'गृहकार्य',
    content: 'सामग्री',
    aiInsights: 'एआई अंतर्दृष्टि',
    reports: 'रिपोर्ट',
    logout: 'लॉगआउट',
    // Student Dashboard
    streak: 'लगातार दिन',
    totalXp: 'कुल एक्सपी',
    level: 'स्तर',
    continueLearning: 'पढ़ना जारी रखें',
    resumeLesson: 'पाठ फिर से शुरू करें',
    yourSubjects: 'आपके विषय',
    recommended: 'आपके लिए अनुशंसित',
    reviseWeak: 'कमजोर क्षेत्रों को दोहराएं',
    askGyani: 'विशिष्ट प्रश्नों को हल करने के लिए ज्ञानी से पूछें',
    viewAll: 'सभी देखें',
    // Parent Dashboard
    parentDashboard: "अभिभावक डैशबोर्ड",
    childProgress: "बच्चे की प्रगति",
    weeklyReport: 'साप्ताहिक रिपोर्ट',
    studyTime: 'पढ़ाई का समय',
    quizzesFinished: 'पूरी की गई प्रश्नोत्तरियाँ',
    weeklyStudyHours: 'साप्ताहिक अध्ययन के घंटे',
    childStrengths: "बच्चे की ताकत",
    childWeaknesses: "बच्चे की कमजोरियां",
    whatsappShare: 'व्हाट्सएप पर साझा करें',
    mon: 'सोम', tue: 'मंगल', wed: 'बुध', thu: 'गुरु', fri: 'शुक्र', sat: 'शनि', sun: 'रवि',
    // Settings
    appearance: 'दिखावट',
    theme: 'थीम',
    fontSize: 'फ़ॉन्ट आकार',
    langVoice: 'भाषा और आवाज',
    language: 'भाषा',
    voice: 'आवाज',
    offlineStorage: 'ऑफ़लाइन संग्रहण',
    privacy: 'गोपनीयता',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    // Quiz / Results
    quiz: 'प्रश्नोत्तरी',
    timeTaken: 'लिया गया समय',
    correct: 'सही',
    conceptMastery: 'अवधारणा महारत विश्लेषण',
    needsPractice: 'अभ्यास की आवश्यकता है',
    mastered: 'महारत हासिल की',
    backToChapter: 'अध्याय पर वापस जाएं',
    askAiTutor: 'एआई ट्यूटर से पूछें',
    questionReview: 'प्रश्नों की समीक्षा',
    yourAnswer: 'आपका उत्तर',
    correctAnswer: 'सही उत्तर',
    // Teacher Overview
    classroomCode: 'कक्षा कोड',
    totalStudents: 'कुल छात्र',
    activeToday: 'आज सक्रिय',
    avgScore: 'औसत स्कोर',
    doubts: 'संदेह',
    performanceOverview: 'प्रदर्शन का अवलोकन',
    recentActivity: 'हाल की गतिविधि',
    masteryHeatmap: 'अध्याय महारत हीटमैप',
    atRiskStudents: 'जोखिम वाले छात्र',
    topPerformers: 'शीर्ष प्रदर्शन करने वाले',

    // Subjects
    'Mathematics': 'गणित',
    'Science': 'विज्ञान',
    'English': 'अंग्रेज़ी',
    'Social Science': 'सामाजिक विज्ञान',
    'Physics': 'भौतिक विज्ञान',
    'Chemistry': 'रसायन विज्ञान',
    'Biology': 'जीव विज्ञान',
    'Algebra (Math I)': 'बीजगणित',
    'Geometry (Math II)': 'ज्यामिति',
    'Math': 'गणित',

    // Greetings
    'Good Night': 'शुभ रात्रि',
    'Good Morning': 'शुभ प्रभात',
    'Good Afternoon': 'नमस्कार',
    'Good Evening': 'शुभ संध्या',

    // Dashboard dynamic messages
    'letsWorkOn': 'आइए आज ',
    'today': ' पर काम करते हैं!',
    'amazingReady': "आप बहुत अच्छा कर रहे हैं। क्या आप नया अध्याय सीखने के लिए तैयार हैं?",
    'adventureMap': 'आपका साहसिक मानचित्र',
    'continue': 'जारी रखें',
  }
};

export type TranslationKey = keyof typeof TRANSLATIONS.en;

export function getTranslation(key: string, lang: 'en' | 'hi'): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return (dict as any)[key] || (TRANSLATIONS.en as any)[key] || key;
}

export function useTranslation() {
  const language = useAppStore(state => state.language);
  return {
    t: (key: string) => getTranslation(key, language),
    language
  };
}
