/* ============================================
   PATHWISE — Seed Data: Subjects & Chapters
   ============================================ */
import type { Subject, Chapter, AvatarOption, Achievement, User, StudentProfile, TeacherProfile, Classroom } from '../types';

// ---- Base Subjects ----
const baseSubjects: Subject[] = [
  // CBSE Grade 10
  { id: 'cbse-10-math', name: 'Mathematics', nameHi: 'गणित', icon: 'calculator', color: '#FF6B6B', grade: 10, board: 'CBSE', sortOrder: 1 },
  { id: 'cbse-10-science', name: 'Science', nameHi: 'विज्ञान', icon: 'flask-conical', color: '#4ECDC4', grade: 10, board: 'CBSE', sortOrder: 2 },
  { id: 'cbse-10-english', name: 'English', nameHi: 'अंग्रेज़ी', icon: 'book-open', color: '#45B7D1', grade: 10, board: 'CBSE', sortOrder: 3 },
  { id: 'cbse-10-social', name: 'Social Science', nameHi: 'सामाजिक विज्ञान', icon: 'globe-2', color: '#BB8FCE', grade: 10, board: 'CBSE', sortOrder: 4 },

  // CBSE Grade 7
  { id: 'cbse-7-math', name: 'Mathematics', nameHi: 'गणित', icon: 'calculator', color: '#FF6B6B', grade: 7, board: 'CBSE', sortOrder: 1 },
  { id: 'cbse-7-science', name: 'Science', nameHi: 'विज्ञान', icon: 'flask-conical', color: '#4ECDC4', grade: 7, board: 'CBSE', sortOrder: 2 },
  { id: 'cbse-7-english', name: 'English', nameHi: 'अंग्रेज़ी', icon: 'book-open', color: '#45B7D1', grade: 7, board: 'CBSE', sortOrder: 3 },

  // CBSE Grade 5
  { id: 'cbse-5-math', name: 'Mathematics', nameHi: 'गणित', icon: 'calculator', color: '#FF6B6B', grade: 5, board: 'CBSE', sortOrder: 1 },
  { id: 'cbse-5-science', name: 'Science', nameHi: 'विज्ञान', icon: 'flask-conical', color: '#4ECDC4', grade: 5, board: 'CBSE', sortOrder: 2 },

  // ICSE Grade 10
  { id: 'icse-10-math', name: 'Mathematics', nameHi: 'गणित', icon: 'calculator', color: '#FF6B6B', grade: 10, board: 'ICSE', sortOrder: 1 },
  { id: 'icse-10-physics', name: 'Physics', nameHi: 'भौतिक विज्ञान', icon: 'zap', color: '#FF8C42', grade: 10, board: 'ICSE', sortOrder: 2 },
  { id: 'icse-10-chemistry', name: 'Chemistry', nameHi: 'रसायन विज्ञान', icon: 'flask-conical', color: '#4ECDC4', grade: 10, board: 'ICSE', sortOrder: 3 },
  { id: 'icse-10-biology', name: 'Biology', nameHi: 'जीव विज्ञान', icon: 'heart', color: '#82E0AA', grade: 10, board: 'ICSE', sortOrder: 4 },

  // Maharashtra State Board (STATE_MH) Grade 10
  { id: 'mh-10-math-1', name: 'Algebra (Math I)', nameHi: 'बीजगणित', icon: 'calculator', color: '#FF6B6B', grade: 10, board: 'STATE_MH', sortOrder: 1 },
  { id: 'mh-10-math-2', name: 'Geometry (Math II)', nameHi: 'ज्यामिति', icon: 'compass', color: '#45B7D1', grade: 10, board: 'STATE_MH', sortOrder: 2 },
  { id: 'mh-10-science-1', name: 'Science & Tech I', nameHi: 'विज्ञान और प्रौद्योगिकी १', icon: 'zap', color: '#FF8C42', grade: 10, board: 'STATE_MH', sortOrder: 3 },
  { id: 'mh-10-science-2', name: 'Science & Tech II', nameHi: 'विज्ञान और प्रौद्योगिकी २', icon: 'heart', color: '#82E0AA', grade: 10, board: 'STATE_MH', sortOrder: 4 },
];

// ---- Base Chapters ----
const baseChapters: Chapter[] = [
  // --- CBSE Grade 10 Mathematics ---
  {
    id: 'cbse-10-math-ch1',
    subjectId: 'cbse-10-math',
    title: 'Real Numbers',
    titleHi: 'वास्तविक संख्याएँ',
    description: 'Fundamental Theorem of Arithmetic, irrationality proofs, and decimal expansions of rational numbers.',
    sortOrder: 1,
    estimatedTimeMin: 60,
    difficulty: 0.35,
    prerequisites: [],
    learningObjectives: ['Apply Fundamental Theorem of Arithmetic', 'Prove irrationality of root 2, 3, 5', 'Analyze rational decimal expansions'],
    isAvailableOffline: true
  },
  {
    id: 'cbse-10-math-ch2',
    subjectId: 'cbse-10-math',
    title: 'Polynomials',
    titleHi: 'बहुपद',
    description: 'Geometrical meaning of zeroes, relationship between coefficients and zeroes of quadratic polynomials.',
    sortOrder: 2,
    estimatedTimeMin: 50,
    difficulty: 0.4,
    prerequisites: ['cbse-10-math-ch1'],
    learningObjectives: ['Find geometrical zeroes of polynomials', 'Relate coefficients and zeroes', 'Form quadratic equations'],
    isAvailableOffline: true
  },
  {
    id: 'cbse-10-math-ch3',
    subjectId: 'cbse-10-math',
    title: 'Linear Equations',
    titleHi: 'रैखिक समीकरण',
    description: 'Pair of linear equations in two variables. Graphical and algebraic methods of solution.',
    sortOrder: 3,
    estimatedTimeMin: 75,
    difficulty: 0.5,
    prerequisites: ['cbse-10-math-ch2'],
    learningObjectives: ['Solve graphically', 'Apply substitution and elimination', 'Model word problems'],
    isAvailableOffline: true
  },
  {
    id: 'cbse-10-math-ch4',
    subjectId: 'cbse-10-math',
    title: 'Quadratic Equations',
    titleHi: 'द्विघात समीकरण',
    description: 'Standard form, factorization, quadratic formula, discriminant, and nature of roots.',
    sortOrder: 4,
    estimatedTimeMin: 80,
    difficulty: 0.55,
    prerequisites: ['cbse-10-math-ch2'],
    learningObjectives: ['Solve by factorization', 'Apply quadratic formula', 'Compute discriminant and nature of roots'],
    isAvailableOffline: true
  },
  {
    id: 'cbse-10-math-ch5',
    subjectId: 'cbse-10-math',
    title: 'Arithmetic Progressions',
    titleHi: 'समांतर श्रेढ़ी',
    description: 'Derivation of the nth term and sum of first n terms of an Arithmetic Progression.',
    sortOrder: 5,
    estimatedTimeMin: 70,
    difficulty: 0.45,
    prerequisites: [],
    learningObjectives: ['Find the nth term of an AP', 'Calculate the sum of n terms', 'Solve daily life AP problems'],
    isAvailableOffline: true
  },

  // --- CBSE Grade 10 Science ---
  {
    id: 'cbse-10-science-ch1',
    subjectId: 'cbse-10-science',
    title: 'Chemical Reactions',
    titleHi: 'रासायनिक अभिक्रियाएँ',
    description: 'Chemical equations, balanced chemical equations, types of chemical reactions, corrosion, and rancidity.',
    sortOrder: 1,
    estimatedTimeMin: 65,
    difficulty: 0.4,
    prerequisites: [],
    learningObjectives: ['Balance chemical equations', 'Identify combination and decomposition reactions', 'Distinguish displacement and redox'],
    isAvailableOffline: true
  },
  {
    id: 'cbse-10-science-ch2',
    subjectId: 'cbse-10-science',
    title: 'Acids, Bases, and Salts',
    titleHi: 'अम्ल, क्षारक और लवण',
    description: 'Definitions, properties, pH scale, indicator reactions, preparation and uses of common salts.',
    sortOrder: 2,
    estimatedTimeMin: 70,
    difficulty: 0.45,
    prerequisites: [],
    learningObjectives: ['Explain chemical properties of acids & bases', 'Measure pH levels', 'Identify common sodium salts'],
    isAvailableOffline: true
  },
  {
    id: 'cbse-10-science-ch6',
    subjectId: 'cbse-10-science',
    title: 'Life Processes',
    titleHi: 'जैव प्रक्रम',
    description: 'Nutrition, respiration, transportation, and excretion in plants and human beings.',
    sortOrder: 3,
    estimatedTimeMin: 90,
    difficulty: 0.6,
    prerequisites: [],
    learningObjectives: ['Detail human digestive system', 'Differentiate aerobic and anaerobic respiration', 'Explain circulatory and renal systems'],
    isAvailableOffline: true
  },
  {
    id: 'cbse-10-science-ch10',
    subjectId: 'cbse-10-science',
    title: 'Light Reflection and Refraction',
    titleHi: 'प्रकाश - परावर्तन तथा अपवर्तन',
    description: 'Reflection of light by spherical mirrors, refraction, lens formula, and magnification.',
    sortOrder: 4,
    estimatedTimeMin: 85,
    difficulty: 0.65,
    prerequisites: [],
    learningObjectives: ['Draw mirror ray diagrams', 'Apply mirror and lens formulas', 'Calculate refractive indices'],
    isAvailableOffline: true
  },

  // --- CBSE Grade 7 Mathematics ---
  {
    id: 'cbse-7-math-ch1',
    subjectId: 'cbse-7-math',
    title: 'Integers',
    titleHi: 'पूर्णांक',
    description: 'Properties of addition, subtraction, multiplication, and division of integers.',
    sortOrder: 1,
    estimatedTimeMin: 45,
    difficulty: 0.3,
    prerequisites: [],
    learningObjectives: ['Operate on integers', 'Understand commutative and associative properties', 'Solve integer word problems'],
    isAvailableOffline: true
  },
  {
    id: 'cbse-7-math-ch2',
    subjectId: 'cbse-7-math',
    title: 'Fractions and Decimals',
    titleHi: 'भिन्न एवं दशमलव',
    description: 'Multiplication and division of fractions, conversion and operations on decimal numbers.',
    sortOrder: 2,
    estimatedTimeMin: 50,
    difficulty: 0.35,
    prerequisites: ['cbse-7-math-ch1'],
    learningObjectives: ['Multiply and divide fractions', 'Solve operations on decimals', 'Interpret fraction models'],
    isAvailableOffline: true
  },

  // --- CBSE Grade 7 Science ---
  {
    id: 'cbse-7-science-ch1',
    subjectId: 'cbse-7-science',
    title: 'Nutrition in Plants',
    titleHi: 'पादपों में पोषण',
    description: 'Autotrophic and heterotrophic nutrition, photosynthesis, and nutrients replenishment in soil.',
    sortOrder: 1,
    estimatedTimeMin: 40,
    difficulty: 0.3,
    prerequisites: [],
    learningObjectives: ['Explain photosynthesis inputs & outputs', 'Identify parasitic and saprotrophic plants', 'Understand nitrogen fixation'],
    isAvailableOffline: true
  },

  // --- Maharashtra Board Grade 10 Algebra ---
  {
    id: 'mh-10-math-1-ch1',
    subjectId: 'mh-10-math-1',
    title: 'Linear Equations in Two Variables',
    titleHi: 'दोन चलांतील रेषीय समीकरणे',
    description: 'Graphical method, Cramer\'s rule, and equations reducible to linear equations.',
    sortOrder: 1,
    estimatedTimeMin: 70,
    difficulty: 0.5,
    prerequisites: [],
    learningObjectives: ['Solve using determinants (Cramer\'s Rule)', 'Plot linear graphs', 'Model simultaneous situations'],
    isAvailableOffline: true
  },
  {
    id: 'mh-10-math-1-ch2',
    subjectId: 'mh-10-math-1',
    title: 'Quadratic Equations',
    titleHi: 'वर्गसमीकरणे',
    description: 'Solution by factorization, formula method, and relation between roots and coefficients.',
    sortOrder: 2,
    estimatedTimeMin: 75,
    difficulty: 0.55,
    prerequisites: ['mh-10-math-1-ch1'],
    learningObjectives: ['Factorize quadratic polynomials', 'Apply quadratic formula', 'Find relation between roots & coefficients'],
    isAvailableOffline: true
  },
];

export const SUBJECTS: Subject[] = [...baseSubjects];
export const CHAPTERS: Chapter[] = [...baseChapters];

// ---- Dynamic Syllabus Seeding Engine ----
function generateDynamicSyllabus() {
  const boards: ('CBSE' | 'ICSE' | 'STATE_MH')[] = ['CBSE', 'ICSE', 'STATE_MH'];
  const grades = Array.from({ length: 12 }, (_, i) => i + 1);

  const hindiTranslationMap: Record<string, string> = {
    'Mathematics': 'गणित',
    'Algebra (Math I)': 'बीजगणित',
    'Geometry (Math II)': 'ज्यामिति',
    'Science': 'विज्ञान',
    'Science & Tech I': 'विज्ञान और प्रौद्योगिकी १',
    'Science & Tech II': 'विज्ञान और प्रौद्योगिकी २',
    'Physics': 'भौतिक विज्ञान',
    'Chemistry': 'रसायन विज्ञान',
    'Biology': 'जीव विज्ञान',
    'English': 'अंग्रेज़ी',
    'Social Science': 'सामाजिक विज्ञान',
    'History & Civics': 'इतिहास और नागरिक शास्त्र',
    'Geography': 'भूगोल',
    'Real Numbers': 'वास्तविक संख्याएँ',
    'Polynomials': 'बहुपद',
    'Linear Equations': 'रैखिक समीकरण',
    'Quadratic Equations': 'द्विघात समीकरण',
    'Arithmetic Progressions': 'समांतर श्रेढ़ी',
    'Chemical Reactions': 'रासायनिक अभिक्रियाएँ',
    'Acids, Bases, and Salts': 'अम्ल, क्षारक और लवण',
    'Life Processes': 'जैव प्रक्रम',
    'Light Reflection and Refraction': 'प्रकाश - परावर्तन तथा अपवर्तन',
    'Integers': 'पूर्णांक',
    'Fractions and Decimals': 'भिन्न एवं दशमलव',
    'Nutrition in Plants': 'पादपों में पोषण',
    'Linear Equations in Two Variables': 'दोन चलांतील रेषीय समीकरणे',
  };

  const getHi = (text: string) => {
    if (hindiTranslationMap[text]) return hindiTranslationMap[text];
    let translated = text;
    Object.keys(hindiTranslationMap).forEach(key => {
      translated = translated.replace(new RegExp(key, 'gi'), hindiTranslationMap[key]);
    });
    return translated === text ? `पाठ - ${text}` : translated;
  };

  const getSubjectsForGradeBoard = (board: 'CBSE' | 'ICSE' | 'STATE_MH', grade: number): Omit<Subject, 'id' | 'grade' | 'board'>[] => {
    if (grade >= 11) {
      return [
        { name: 'Mathematics', nameHi: 'गणित', icon: 'calculator', color: '#FF6B6B', sortOrder: 1 },
        { name: 'Physics', nameHi: 'भौतिक विज्ञान', icon: 'zap', color: '#FF8C42', sortOrder: 2 },
        { name: 'Chemistry', nameHi: 'रसायन विज्ञान', icon: 'flask-conical', color: '#4ECDC4', sortOrder: 3 },
        { name: 'Biology', nameHi: 'जीव विज्ञान', icon: 'heart', color: '#82E0AA', sortOrder: 4 },
        { name: 'English', nameHi: 'अंग्रेज़ी', icon: 'book-open', color: '#45B7D1', sortOrder: 5 }
      ];
    }
    if (grade >= 9) {
      if (board === 'ICSE') {
        return [
          { name: 'Mathematics', nameHi: 'गणित', icon: 'calculator', color: '#FF6B6B', sortOrder: 1 },
          { name: 'Physics', nameHi: 'भौतिक विज्ञान', icon: 'zap', color: '#FF8C42', sortOrder: 2 },
          { name: 'Chemistry', nameHi: 'रसायन विज्ञान', icon: 'flask-conical', color: '#4ECDC4', sortOrder: 3 },
          { name: 'Biology', nameHi: 'जीव विज्ञान', icon: 'heart', color: '#82E0AA', sortOrder: 4 },
          { name: 'English', nameHi: 'अंग्रेज़ी', icon: 'book-open', color: '#45B7D1', sortOrder: 5 }
        ];
      }
      if (board === 'STATE_MH') {
        return [
          { name: 'Algebra (Math I)', nameHi: 'बीजगणित', icon: 'calculator', color: '#FF6B6B', sortOrder: 1 },
          { name: 'Geometry (Math II)', nameHi: 'ज्यामिति', icon: 'compass', color: '#45B7D1', sortOrder: 2 },
          { name: 'Science & Tech I', nameHi: 'विज्ञान और प्रौद्योगिकी १', icon: 'zap', color: '#FF8C42', sortOrder: 3 },
          { name: 'Science & Tech II', nameHi: 'विज्ञान और प्रौद्योगिकी २', icon: 'heart', color: '#82E0AA', sortOrder: 4 },
          { name: 'English', nameHi: 'अंग्रेज़ी', icon: 'book-open', color: '#BB8FCE', sortOrder: 5 }
        ];
      }
      return [
        { name: 'Mathematics', nameHi: 'गणित', icon: 'calculator', color: '#FF6B6B', sortOrder: 1 },
        { name: 'Science', nameHi: 'विज्ञान', icon: 'flask-conical', color: '#4ECDC4', sortOrder: 2 },
        { name: 'English', nameHi: 'अंग्रेज़ी', icon: 'book-open', color: '#45B7D1', sortOrder: 3 },
        { name: 'Social Science', nameHi: 'सामाजिक विज्ञान', icon: 'globe-2', color: '#BB8FCE', sortOrder: 4 }
      ];
    }
    return [
      { name: 'Mathematics', nameHi: 'गणित', icon: 'calculator', color: '#FF6B6B', sortOrder: 1 },
      { name: 'Science', nameHi: 'विज्ञान', icon: 'flask-conical', color: '#4ECDC4', sortOrder: 2 },
      { name: 'English', nameHi: 'अंग्रेज़ी', icon: 'book-open', color: '#45B7D1', sortOrder: 3 }
    ];
  };

  const getChaptersForSubject = (subjName: string, board: string, grade: number): string[] => {
    const isMath = subjName.includes('Math') || subjName.includes('Algebra') || subjName.includes('Geometry');
    const isScience = subjName.includes('Science') || subjName.includes('Physics') || subjName.includes('Chemistry') || subjName.includes('Biology');
    
    if (isMath) {
      if (grade === 10) {
        if (board === 'CBSE') return ['Real Numbers', 'Polynomials', 'Linear Equations', 'Quadratic Equations', 'Arithmetic Progressions'];
        if (board === 'ICSE') return ['GST and Taxes', 'Banking Accounts', 'Linear Inequations', 'Quadratic Equations Solver', 'Ratio and Proportion'];
        return ['Linear Equations in Two Variables', 'Quadratic Equations', 'Arithmetic Progression', 'Financial Planning'];
      }
      if (grade === 7) return ['Integers', 'Fractions and Decimals', 'Simple Equations', 'Lines and Angles'];
      if (grade === 1) return ['Numbers 1 to 9', 'Addition Basics', 'Subtraction Basics', 'Shapes and Space'];
      if (grade === 2) return ['Numbers up to 100', 'Group Counting', 'Addition of Tens', 'Tens and Ones'];
      if (grade === 3) return ['Where to Look From', 'Fun with Numbers', 'Give and Take Addition', 'Long and Short'];
      if (grade === 4) return ['Building with Bricks', 'Long and Short Measurement', 'Bhopal Trip Math', 'Tick-Tick-Tick Time'];
      if (grade === 5) return ['The Fish Tale Shapes', 'Shapes and Angles', 'How Many Squares', 'Parts and Wholes'];
      if (grade === 6) return ['Knowing Our Numbers', 'Whole Numbers', 'Playing with Numbers', 'Basic Geometrical Ideas'];
      if (grade === 8) return ['Rational Numbers', 'Linear Equations in One Variable', 'Understanding Quadrilaterals', 'Practical Geometry'];
      if (grade === 9) return ['Number Systems', 'Polynomial Basics', 'Coordinate Geometry', 'Linear Equations in Two Variables'];
      if (grade === 11) return ['Sets Theory', 'Relations and Functions', 'Trigonometric Functions', 'Mathematical Induction'];
      return ['Relations and Functions 12', 'Inverse Trigonometric Functions', 'Matrices Algebra', 'Determinants Algebra'];
    }
    
    if (isScience) {
      if (grade === 10) {
        if (subjName.includes('Chemistry')) return ['Periodic Properties', 'Chemical Bonding', 'Acids Bases Salts', 'Analytical Chemistry'];
        if (subjName.includes('Physics')) return ['Force Mechanics', 'Work Energy Power', 'Refraction of Light', 'Spectrum Optics'];
        if (subjName.includes('Biology')) return ['Cell Cycle', 'Structure of Chromosome', 'Genetics Principles', 'Transpiration in Plants'];
        if (subjName.includes('Science & Tech I')) return ['Gravitation', 'Periodic Classification', 'Chemical Reactions', 'Effects of Electric Current'];
        if (subjName.includes('Science & Tech II')) return ['Heredity and Evolution', 'Life Processes 1', 'Life Processes 2', 'Environmental Management'];
        return ['Chemical Reactions', 'Acids, Bases, and Salts', 'Life Processes', 'Light Reflection and Refraction'];
      }
      if (grade === 7) return ['Nutrition in Plants', 'Nutrition in Animals', 'Fibre to Fabric', 'Heat Transfer'];
      if (grade === 1) return ['Living and Non-Living', 'Plants Around Us', 'Animals Around Us', 'My Body Organs'];
      if (grade === 2) return ['Types of Plants', 'Uses of Plants', 'Domestic Animals', 'Wild Animals World'];
      if (grade === 3) return ['Things Around Us', 'Parts of a Plant', 'Food We Eat', 'Water Resources Life'];
      if (grade === 4) return ['Plant Adaptations', 'Animal Life Cycles', 'Food and Digestion', 'Force & Work Science'];
      if (grade === 5) return ['Seeds and Germination', 'Animal Habitation', 'Bones and Muscles', 'Nervous System Biology'];
      if (grade === 6) return ['Food Components', 'Fibre to Fabric', 'Sorting Materials', 'Separation of Substances'];
      if (grade === 8) return ['Crop Management', 'Microorganisms World', 'Metals and Non-Metals', 'Combustion and Flame'];
      if (grade === 9) return ['Matter in Our Surroundings', 'Is Matter Pure', 'Atoms and Molecules', 'Structure of the Atom'];
      if (grade === 11 || grade === 12) {
        if (subjName.includes('Physics')) return ['Units and Measurements', 'Motion in a Straight Line', 'Laws of Motion', 'Gravitation Physics'];
        if (subjName.includes('Chemistry')) return ['Basic Concepts of Chemistry', 'Structure of Atom', 'Chemical Bonding', 'Thermodynamics'];
        return ['Cell Biology', 'Biomolecules Structure', 'Plant Physiology', 'Cell Division Cycle'];
      }
    }
    
    if (subjName.includes('English')) {
      return ['Nouns and Pronouns', 'Tenses and Verbs', 'Active and Passive Voice', 'Direct and Indirect Speech'];
    }
    return ['Our Past History', 'Resources and Development', 'Social and Political Life', 'Democratic Politics'];
  };

  boards.forEach(board => {
    grades.forEach(grade => {
      const templates = getSubjectsForGradeBoard(board, grade);
      templates.forEach(t => {
        let suffix = t.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (suffix.includes('mathematics')) suffix = 'math';
        if (suffix.includes('algebra')) suffix = 'math-1';
        if (suffix.includes('geometry')) suffix = 'math-2';
        if (suffix.includes('scienceandtechi')) suffix = 'science-1';
        if (suffix.includes('scienceandtechii')) suffix = 'science-2';
        if (suffix.includes('socialscience') || suffix.includes('social')) suffix = 'social';
        
        const boardPrefix = board === 'STATE_MH' ? 'mh' : board.toLowerCase();
        const subjId = `${boardPrefix}-${grade}-${suffix}`;
        
        const exists = SUBJECTS.some(s => s.id === subjId);
        if (!exists) {
          SUBJECTS.push({
            id: subjId,
            name: t.name,
            nameHi: t.nameHi,
            icon: t.icon,
            color: t.color,
            grade,
            board,
            sortOrder: t.sortOrder
          });
        }
        
        const chapNames = getChaptersForSubject(t.name, board, grade);
        chapNames.forEach((chName, chIdx) => {
          const chId = `${subjId}-ch${chIdx + 1}`;
          
          const chExists = CHAPTERS.some(c => c.id === chId);
          if (!chExists) {
            CHAPTERS.push({
              id: chId,
              subjectId: subjId,
              title: chName,
              titleHi: getHi(chName),
              description: `A detailed study of ${chName} covering definitions, formulas, and visual concepts for ${board} Grade ${grade} ${t.name}.`,
              sortOrder: chIdx + 1,
              estimatedTimeMin: 40 + chIdx * 5,
              difficulty: parseFloat((0.2 + chIdx * 0.08).toFixed(2)),
              prerequisites: chIdx > 0 ? [`${subjId}-ch${chIdx}`] : [],
              learningObjectives: [`Grades curriculum goals for ${chName}`, `Solve standard board problems on ${chName}`, `Pass diagnostic review`],
              isAvailableOffline: true
            });
          }
        });
      });
    });
  });
}

// Execute expansion
generateDynamicSyllabus();

// ---- Avatars (Emoji-Free) ----
export const AVATARS: AvatarOption[] = [
  { id: 'owl', name: 'Wise Owl', emoji: '', color: '#C80018' },
  { id: 'rocket', name: 'Rocket Star', emoji: '', color: '#FF6B6B' },
  { id: 'lion', name: 'Brave Lion', emoji: '', color: '#F4B400' },
  { id: 'dolphin', name: 'Smart Dolphin', emoji: '', color: '#45B7D1' },
  { id: 'panda', name: 'Calm Panda', emoji: '', color: '#4B4E53' },
  { id: 'star', name: 'Super Star', emoji: '', color: '#F7DC6F' },
  { id: 'butterfly', name: 'Free Butterfly', emoji: '', color: '#BB8FCE' },
  { id: 'tree', name: 'Wise Tree', emoji: '', color: '#00B87C' },
  { id: 'lightning', name: 'Lightning Fast', emoji: '', color: '#FF8C42' },
  { id: 'book', name: 'Bookworm', emoji: '', color: '#4ECDC4' },
  { id: 'gem', name: 'Gem Finder', emoji: '', color: '#82E0AA' },
  { id: 'fire', name: 'On Fire', emoji: '', color: '#D93025' },
];

// ---- Achievements (Emoji-Free) ----
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-login', badgeId: 'first-login', title: 'Welcome Explorer', description: 'Log in for the first time', icon: 'first-login', xpReward: 50, condition: 'first_login', rarity: 'common' },
  { id: 'streak-3', badgeId: 'streak-3', title: 'Getting Started', description: 'Maintain a 3-day study streak', icon: 'streak-3', xpReward: 100, condition: 'streak_3', rarity: 'common' },
  { id: 'streak-7', badgeId: 'streak-7', title: 'Week Warrior', description: 'Maintain a 7-day study streak', icon: 'streak-7', xpReward: 250, condition: 'streak_7', rarity: 'rare' },
  { id: 'streak-30', badgeId: 'streak-30', title: 'Monthly Master', description: 'Maintain a 30-day study streak', icon: 'streak-30', xpReward: 1000, condition: 'streak_30', rarity: 'epic' },
  { id: 'streak-100', badgeId: 'streak-100', title: 'Century Legend', description: 'Maintain a 100-day study streak', icon: 'streak-100', xpReward: 5000, condition: 'streak_100', rarity: 'legendary' },
  { id: 'quiz-perfect', badgeId: 'quiz-perfect', title: 'Perfect Score', description: 'Score 100% on any quiz', icon: 'quiz-perfect', xpReward: 200, condition: 'quiz_perfect', rarity: 'rare' },
  { id: 'quiz-10', badgeId: 'quiz-10', title: 'Quiz Enthusiast', description: 'Complete 10 quizzes', icon: 'quiz-10', xpReward: 150, condition: 'quiz_count_10', rarity: 'common' },
  { id: 'quiz-50', badgeId: 'quiz-50', title: 'Quiz Master', description: 'Complete 50 quizzes', icon: 'quiz-50', xpReward: 500, condition: 'quiz_count_50', rarity: 'rare' },
  { id: 'chapter-5', badgeId: 'chapter-5', title: 'Knowledge Seeker', description: 'Complete 5 chapters', icon: 'chapter-5', xpReward: 200, condition: 'chapters_5', rarity: 'common' },
  { id: 'chapter-20', badgeId: 'chapter-20', title: 'Scholar', description: 'Complete 20 chapters', icon: 'chapter-20', xpReward: 800, condition: 'chapters_20', rarity: 'rare' },
  { id: 'mastery-first', badgeId: 'mastery-first', title: 'First Mastery', description: 'Master your first chapter', icon: 'mastery-first', xpReward: 300, condition: 'mastery_first', rarity: 'rare' },
  { id: 'ai-chat-10', badgeId: 'ai-chat-10', title: 'Curious Mind', description: 'Ask the AI Tutor 10 questions', icon: 'ai-chat-10', xpReward: 100, condition: 'ai_chat_10', rarity: 'common' },
  { id: 'all-subjects', badgeId: 'all-subjects', title: 'Renaissance Student', description: 'Study all subjects in one day', icon: 'all-subjects', xpReward: 400, condition: 'all_subjects_day', rarity: 'epic' },
  { id: 'speed-demon', badgeId: 'speed-demon', title: 'Speed Demon', description: 'Complete a quiz in under 2 minutes with 80% score', icon: 'speed-demon', xpReward: 300, condition: 'speed_quiz', rarity: 'rare' },
  { id: 'night-owl', badgeId: 'night-owl', title: 'Night Owl', description: 'Study after 10 PM', icon: 'night-owl', xpReward: 50, condition: 'study_late', rarity: 'common' },
  { id: 'early-bird', badgeId: 'early-bird', title: 'Early Bird', description: 'Study before 7 AM', icon: 'early-bird', xpReward: 50, condition: 'study_early', rarity: 'common' },
];

// ---- Demo Classrooms ----
export const DEMO_CLASSROOMS: Classroom[] = [
  { id: '7A-XR92K', name: 'Class 7A', teacherId: 'teacher-priya-001', grade: 7, createdAt: Date.now() },
  { id: '7B-QT41M', name: 'Class 7B', teacherId: 'teacher-priya-001', grade: 7, createdAt: Date.now() },
  { id: '8A-XT82K', name: 'Class 8A', teacherId: 'teacher-priya-001', grade: 8, createdAt: Date.now() },
  { id: '8B-LT12M', name: 'Class 8B', teacherId: 'teacher-priya-001', grade: 8, createdAt: Date.now() },
  { id: '9S-SC90S', name: 'Class 9 Science', teacherId: 'teacher-priya-001', grade: 9, createdAt: Date.now() },
  { id: '10M-MA10M', name: 'Class 10 Maths', teacherId: 'teacher-priya-001', grade: 10, createdAt: Date.now() },
];

// ---- Demo Student Data ----
export const DEMO_STUDENT: { user: User; profile: StudentProfile } = {
  user: {
    id: 'student-aarav-001',
    role: 'student',
    name: 'Aarav',
    avatarId: 'owl',
    language: 'en',
    theme: 'dark',
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now(),
    lastLoginAt: Date.now(),
  },
  profile: {
    userId: 'student-aarav-001',
    grade: 10,
    board: 'CBSE',
    learningStyle: 'visual',
    difficultyLevel: 0.5,
    streakCurrent: 15,
    streakBest: 23,
    xpTotal: 2480,
    level: 5,
    lastStudyDate: new Date().toISOString().split('T')[0],
    learningMode: 'classroom',
    classCode: '10M-MA10M'
  },
};

// ---- Demo Teacher Data ----
export const DEMO_TEACHER: { user: User; profile: TeacherProfile } = {
  user: {
    id: 'teacher-priya-001',
    role: 'teacher',
    name: 'Priya Sharma',
    email: 'priya.sharma@school.edu',
    avatarId: 'star',
    language: 'en',
    theme: 'dark',
    createdAt: Date.now() - 180 * 86400000,
    updatedAt: Date.now(),
    lastLoginAt: Date.now(),
  },
  profile: {
    userId: 'teacher-priya-001',
    schoolCode: 'DPS-001',
    schoolName: 'Delhi Public School',
    subjects: ['cbse-10-math', 'cbse-10-science'],
    grades: [9, 10],
    isVerified: true,
    activeClassroomCode: '10M-MA10M'
  },
};

// ---- Demo Class Data for Teacher (Mapped to Classrooms) ----
export const DEMO_STUDENTS: { name: string; avatarId: string; mastery: number; streak: number; riskLevel: 'low' | 'medium' | 'high'; classCode: string }[] = [
  // Class 7A (7A-XR92K)
  { name: 'Aarav Sharma', avatarId: 'owl', mastery: 0.82, streak: 15, riskLevel: 'low', classCode: '7A-XR92K' },
  { name: 'Riya Patel', avatarId: 'butterfly', mastery: 0.91, streak: 23, riskLevel: 'low', classCode: '7A-XR92K' },
  { name: 'Rohan Verma', avatarId: 'rocket', mastery: 0.67, streak: 5, riskLevel: 'medium', classCode: '7A-XR92K' },

  // Class 7B (7B-QT41M)
  { name: 'Ananya Gupta', avatarId: 'dolphin', mastery: 0.78, streak: 12, riskLevel: 'low', classCode: '7B-QT41M' },
  { name: 'Ishaan Kumar', avatarId: 'lion', mastery: 0.45, streak: 2, riskLevel: 'high', classCode: '7B-QT41M' },
  { name: 'Priya Singh', avatarId: 'star', mastery: 0.88, streak: 19, riskLevel: 'low', classCode: '7B-QT41M' },

  // Class 8A (8A-XT82K)
  { name: 'Karan Mehta', avatarId: 'lightning', mastery: 0.55, streak: 3, riskLevel: 'medium', classCode: '8A-XT82K' },
  { name: 'Diya Reddy', avatarId: 'gem', mastery: 0.73, streak: 8, riskLevel: 'low', classCode: '8A-XT82K' },

  // Class 8B (8B-LT12M)
  { name: 'Arjun Nair', avatarId: 'fire', mastery: 0.62, streak: 6, riskLevel: 'medium', classCode: '8B-LT12M' },
  { name: 'Meera Joshi', avatarId: 'book', mastery: 0.85, streak: 14, riskLevel: 'low', classCode: '8B-LT12M' },

  // Class 10 Maths (10M-MA10M)
  { name: 'Vivaan Rao', avatarId: 'panda', mastery: 0.39, streak: 1, riskLevel: 'high', classCode: '10M-MA10M' },
  { name: 'Anika Desai', avatarId: 'tree', mastery: 0.76, streak: 10, riskLevel: 'low', classCode: '10M-MA10M' },
];

// Subject progress (demo fallback data for student dashboard calculations)
export const DEMO_SUBJECT_PROGRESS = [
  { subjectId: 'cbse-10-math', subjectName: 'Mathematics', color: '#FF6B6B', totalChapters: 5, completedChapters: 2, mastery: 0.72, weakChapters: ['cbse-10-math-ch3', 'cbse-10-math-ch4'] },
  { subjectId: 'cbse-10-science', subjectName: 'Science', color: '#4ECDC4', totalChapters: 4, completedChapters: 3, mastery: 0.86, weakChapters: [] },
  { subjectId: 'cbse-10-english', subjectName: 'English', color: '#45B7D1', totalChapters: 0, completedChapters: 0, mastery: 0.0, weakChapters: [] },
  { subjectId: 'cbse-10-social', subjectName: 'Social Science', color: '#BB8FCE', totalChapters: 0, completedChapters: 0, mastery: 0.0, weakChapters: [] },
];
