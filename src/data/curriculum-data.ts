/* ============================================
   VIDYA AI — Curriculum Knowledge Database
   ============================================ */

export interface CurriculumChapter {
  id: string;
  topicName: string;
  subject: string;
  board: string;
  grade: number;
  overview: string;
  theorySections: { title: string; content: string }[];
  formulas: { name: string; formula: string; explanation: string }[];
  workedExamples: { question: string; stepByStep: string[]; solution: string }[];
  commonMistakes: { mistake: string; correction: string; explanation: string }[];
  examTricks: string[];
  memoryTips: string[];
  summaryPoints: string[];
  diagramSvg: string;
  questionsPool: {
    questionText: string;
    questionType: 'mcq' | 'true_false' | 'fill_blank';
    options?: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: number;
    bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze';
    tags: string[];
  }[];
  flashcardPool: {
    front: string;
    back: string;
    difficulty: number;
  }[];
}

export const CURRICULUM_DATA: Record<string, CurriculumChapter> = {
  'cbse-10-math-ch1': {
    id: 'cbse-10-math-ch1',
    topicName: 'Real Numbers',
    subject: 'Mathematics',
    board: 'CBSE',
    grade: 10,
    overview: 'This chapter covers the classification of real numbers, prime factorization, properties of HCF and LCM, and proofs of irrationality of numbers like root 2, 3, and 5.',
    theorySections: [
      {
        title: '1. The Fundamental Theorem of Arithmetic',
        content: 'Every composite number can be expressed (factorized) as a product of primes, and this factorization is unique, apart from the order in which the prime factors occur. Formally, any composite integer $n$ can be written uniquely as:\n\n$$n = p_1^{a_1} \\cdot p_2^{a_2} \\cdots p_k^{a_k}$$\n\nwhere $p_1 < p_2 < \\dots < p_k$ are prime numbers and $a_i$ are positive integers.'
      },
      {
        title: '2. Proof of Irrationality',
        content: 'An irrational number is a number that cannot be written in the form $p/q$ where $p$ and $q$ are integers and $q \\neq 0$. To prove that a number like $\\sqrt{2}$ is irrational, we use the method of contradiction: we assume it is rational, write it as a simplified fraction $a/b$, show that both $a$ and $b$ must share a factor of 2, contradicting that the fraction was simplified.'
      }
    ],
    formulas: [
      { name: 'HCF and LCM Relation', formula: '\\text{HCF}(a, b) \\times \\text{LCM}(a, b) = a \\times b', explanation: 'The product of the Highest Common Factor and Least Common Multiple of two positive integers is equal to the product of the numbers.' }
    ],
    workedExamples: [
      {
        question: 'Find the HCF and LCM of 96 and 404 by the prime factorization method.',
        stepByStep: [
          'Perform prime factorization of 96: $96 = 2^5 \\times 3$.',
          'Perform prime factorization of 404: $404 = 2^2 \\times 101$.',
          'Find HCF by taking the product of the smallest power of each common prime factor: $\\text{HCF} = 2^2 = 4$.',
          'Find LCM using the formula: $\\text{LCM} = (96 \\times 404) / \\text{HCF} = 38784 / 4 = 9696$.'
        ],
        solution: 'HCF is 4 and LCM is 9696.'
      }
    ],
    commonMistakes: [
      { mistake: 'Assuming the HCF-LCM relation holds for three numbers.', correction: 'Use prime factors directly for three numbers; HCF(a,b,c) * LCM(a,b,c) is NOT equal to a * b * c.', explanation: 'The product formula only applies to pairs of numbers.' }
    ],
    examTricks: ['Always write the prime factors in ascending order to avoid missing common elements.'],
    memoryTips: ['HCF stands for Highest Common Factor, so take the LOWEST power of common prime factors.'],
    summaryPoints: ['Real numbers consist of rational and irrational numbers.', 'The product of two positive integers equals the product of their HCF and LCM.'],
    diagramSvg: `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" />
      <line x1="30" y1="60" x2="370" y2="60" stroke="var(--color-text-primary)" stroke-width="2" />
      <polygon points="370,55 380,60 370,65" fill="var(--color-text-primary)" />
      <polygon points="30,55 20,60 30,65" fill="var(--color-text-primary)" />
      <circle cx="200" cy="60" r="4" fill="var(--color-primary)" />
      <text x="195" y="80" fill="var(--color-text-primary)" font-size="12">0</text>
      <circle cx="100" cy="60" r="3" fill="var(--color-text-secondary)" />
      <text x="92" y="80" fill="var(--color-text-secondary)" font-size="12">-1</text>
      <circle cx="300" cy="60" r="3" fill="var(--color-text-secondary)" />
      <text x="295" y="80" fill="var(--color-text-secondary)" font-size="12">1</text>
      <circle cx="341.4" cy="60" r="4" fill="#FF8C42" />
      <text x="330" y="45" fill="#FF8C42" font-size="12" font-weight="bold">√2 ≈ 1.414</text>
    </svg>`,
    questionsPool: [
      { questionText: 'If two positive integers a and b are written as a = x^3 y^2 and b = x y^3, where x, y are prime numbers, then HCF(a, b) is:', questionType: 'mcq', options: ['x y', 'x y^2', 'x^3 y^3', 'x^2 y^2'], correctAnswer: 'x y^2', explanation: 'HCF is the product of the terms with the lowest powers: x^1 and y^2.', difficulty: 0.35, bloomLevel: 'apply', tags: ['real-numbers', 'hcf'] },
      { questionText: 'The decimal expansion of the rational number 14587/1250 will terminate after how many decimal places?', questionType: 'mcq', options: ['One decimal place', 'Two decimal places', 'Three decimal places', 'Four decimal places'], correctAnswer: 'Four decimal places', explanation: '1250 = 2^1 * 5^4. The power of 5 is 4, which is the highest. Thus, it terminates after 4 places.', difficulty: 0.45, bloomLevel: 'analyze', tags: ['real-numbers', 'decimals'] }
    ],
    flashcardPool: [
      { front: 'What does the Fundamental Theorem of Arithmetic state?', back: 'Every composite number can be uniquely factorized as a product of prime numbers, up to order.', difficulty: 0.2 },
      { front: 'What is the relationship between HCF and LCM of two numbers a and b?', back: 'HCF(a, b) * LCM(a, b) = a * b', difficulty: 0.2 }
    ]
  },
  'cbse-10-math-ch2': {
    id: 'cbse-10-math-ch2',
    topicName: 'Polynomials',
    subject: 'Mathematics',
    board: 'CBSE',
    grade: 10,
    overview: 'This chapter discusses polynomials of various degrees, geometrical representations of quadratic polynomials, and the algebraic relationship between their zeroes and coefficients.',
    theorySections: [
      {
        title: '1. Zeroes of a Polynomial',
        content: 'A real number $\\alpha$ is a zero of a polynomial $p(x)$ if $p(\\alpha) = 0$. Graphically, the zeroes of a polynomial are the x-coordinates of the points where the graph of $y = p(x)$ intersects the x-axis.'
      },
      {
        title: '2. Coefficient and Zeroes Relationships',
        content: 'For a quadratic polynomial $ax^2 + bx + c$:\n- Sum of zeroes: $\\alpha + \\beta = -b/a$\n- Product of zeroes: $\\alpha\\beta = c/a$'
      }
    ],
    formulas: [
      { name: 'Sum of Zeroes', formula: '\\alpha + \\beta = -\\frac{b}{a}', explanation: 'Sum of the roots of a quadratic polynomial.' },
      { name: 'Product of Zeroes', formula: '\\alpha\\beta = \\frac{c}{a}', explanation: 'Product of the roots of a quadratic polynomial.' },
      { name: 'Quadratic Polynomial from Zeroes', formula: 'x^2 - (\\alpha + \\beta)x + \\alpha\\beta = 0', explanation: 'Constructs the polynomial when zeroes are known.' }
    ],
    workedExamples: [
      {
        question: 'Find the zeroes of the quadratic polynomial $x^2 - 2x - 8$, and verify the relationship between zeroes and coefficients.',
        stepByStep: [
          'Factorize the polynomial: $x^2 - 2x - 8 = (x - 4)(x + 2) = 0$.',
          'Zeroes are $\\alpha = 4$ and $\\beta = -2$.',
          'Verify Sum: $\\alpha + \\beta = 4 + (-2) = 2$. Coefficient formula: $-b/a = -(-2)/1 = 2$. Match.',
          'Verify Product: $\\alpha\\beta = 4 \\times (-2) = -8$. Coefficient formula: $c/a = -8/1 = -8$. Match.'
        ],
        solution: 'Zeroes are 4 and -2; relationships verified.'
      }
    ],
    commonMistakes: [
      { mistake: 'Forgetting the negative sign in the sum formula.', correction: 'Always check if your b term has its own negative sign, e.g., sum is -b/a, not b/a.', explanation: 'The sign is opposite to the linear coefficient.' }
    ],
    examTricks: ['Check the degree of the polynomial: a polynomial of degree n can have at most n zeroes.'],
    memoryTips: ['Sum starts with subtraction (S is negative b/a); Product has positive c/a.'],
    summaryPoints: ['A quadratic polynomial represents a parabola.', 'The zeroes are where it crosses the x-axis.'],
    diagramSvg: `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" />
      <line x1="20" y1="100" x2="380" y2="100" stroke="var(--color-text-secondary)" stroke-width="1.5" />
      <line x1="200" y1="10" x2="200" y2="110" stroke="var(--color-text-secondary)" stroke-width="1.5" />
      <path d="M 100 20 Q 200 120 300 20" stroke="var(--color-primary)" stroke-width="3.5" fill="none" />
      <circle cx="140" cy="74.4" r="5" fill="#4ECDC4" />
      <circle cx="260" cy="74.4" r="5" fill="#4ECDC4" />
      <text x="120" y="60" fill="#4ECDC4" font-size="11" font-weight="bold">α</text>
      <text x="270" y="60" fill="#4ECDC4" font-size="11" font-weight="bold">β</text>
      <text x="350" y="90" fill="var(--color-text-primary)" font-size="12">x-axis</text>
    </svg>`,
    questionsPool: [
      { questionText: 'If one zero of the quadratic polynomial x^2 + 3x + k is 2, then the value of k is:', questionType: 'mcq', options: ['10', '-10', '-7', '-2'], correctAnswer: '-10', explanation: 'Substitute x=2: 2^2 + 3(2) + k = 0 => 4 + 6 + k = 0 => k = -10.', difficulty: 0.3, bloomLevel: 'apply', tags: ['polynomials', 'zeroes'] }
    ],
    flashcardPool: [
      { front: 'What is the sum of the zeroes of quadratic ax^2+bx+c?', back: 'Sum = -b/a', difficulty: 0.1 },
      { front: 'What is the product of zeroes of ax^2+bx+c?', back: 'Product = c/a', difficulty: 0.1 }
    ]
  },
  'cbse-10-math-ch3': {
    id: 'cbse-10-math-ch3',
    topicName: 'Linear Equations',
    subject: 'Mathematics',
    board: 'CBSE',
    grade: 10,
    overview: 'Covers pairs of linear equations in two variables. Focuses on graphical solutions and algebraic methods (substitution and elimination) to determine consistency or inconsistency.',
    theorySections: [
      {
        title: '1. Pair of Linear Equations',
        content: 'A pair of linear equations in two variables $x$ and $y$ is represented as:\n\n$$a_1x + b_1y + c_1 = 0$$\n$$a_2x + b_2y + c_2 = 0$$\n\nwhere coefficients are real and $a_1^2 + b_1^2 \\neq 0$, $a_2^2 + b_2^2 \\neq 0$.'
      },
      {
        title: '2. Conditions of Consistency',
        content: '- **Unique Solution (Intersecting Lines)**: $a_1/a_2 \\neq b_1/b_2$\n- **Infinitely Many Solutions (Coincident Lines)**: $a_1/a_2 = b_1/b_2 = c_1/c_2$\n- **No Solution (Parallel Lines)**: $a_1/a_2 = b_1/b_2 \\neq c_1/c_2$ (Inconsistent)'
      }
    ],
    formulas: [
      { name: 'Intersection Condition', formula: '\\frac{a_1}{a_2} \\neq \\frac{b_1}{b_2}', explanation: 'Ensures the lines intersect at exactly one point.' },
      { name: 'Parallel Condition', formula: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2}', explanation: 'Lines are parallel, meaning no common coordinates exist.' }
    ],
    workedExamples: [
      {
        question: 'Solve using elimination: $9x - 4y = 2000$ and $7x - 3y = 2000$.',
        stepByStep: [
          'Multiply equation 1 by 3: $27x - 12y = 6000$.',
          'Multiply equation 2 by 4: $28x - 12y = 8000$.',
          'Subtract: $(28x - 27x) + (-12y - (-12y)) = 8000 - 6000$.',
          'This yields $x = 2000$. Substitute back to find $y = 4000$.'
        ],
        solution: 'x = 2000, y = 4000.'
      }
    ],
    commonMistakes: [
      { mistake: 'Forgetting to arrange standard equations in the same order before comparing ratios.', correction: 'Line up ax + by + c terms vertically.', explanation: 'Mismatched order creates ratio errors.' }
    ],
    examTricks: ['Substitute choices in MCQs to find solutions faster.'],
    memoryTips: ['Parallel lines run side by side, never touching, hence they have "No Solution".'],
    summaryPoints: ['Linear systems can have 1, 0, or infinite solutions.', 'Consistency means at least one solution exists.'],
    diagramSvg: `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" />
      <line x1="200" y1="10" x2="200" y2="110" stroke="var(--color-text-secondary)" stroke-width="1.5" />
      <line x1="20" y1="60" x2="380" y2="60" stroke="var(--color-text-secondary)" stroke-width="1.5" />
      <line x1="60" y1="100" x2="340" y2="20" stroke="#FF6B6B" stroke-width="2.5" />
      <line x1="60" y1="20" x2="340" y2="100" stroke="#4ECDC4" stroke-width="2.5" />
      <circle cx="200" cy="60" r="5" fill="#F4B400" />
      <text x="215" y="55" fill="#F4B400" font-size="11" font-weight="bold">Point of Intersection (Unique Solution)</text>
    </svg>`,
    questionsPool: [
      { questionText: 'For what value of k will the equations 3x - y - 5 = 0 and 6x - 2y - k = 0 have no solution?', questionType: 'mcq', options: ['k = 10', 'k != 10', 'k = -10', 'k != -10'], correctAnswer: 'k != 10', explanation: 'No solution: a1/a2 = b1/b2 != c1/c2. 3/6 = -1/-2 != -5/-k => 1/2 != 5/k => k != 10.', difficulty: 0.4, bloomLevel: 'apply', tags: ['linear-equations', 'solutions'] }
    ],
    flashcardPool: [
      { front: 'What is the graphical representation of a linear system with no solution?', back: 'Two parallel lines.', difficulty: 0.2 },
      { front: 'State condition for infinitely many solutions of linear equations.', back: 'a1/a2 = b1/b2 = c1/c2', difficulty: 0.3 }
    ]
  },
  'cbse-10-math-ch4': {
    id: 'cbse-10-math-ch4',
    topicName: 'Quadratic Equations',
    subject: 'Mathematics',
    board: 'CBSE',
    grade: 10,
    overview: 'A quadratic equation is a second-degree polynomial equation. This chapter covers algebraic methods to find roots and analyses root nature using the discriminant.',
    theorySections: [
      {
        title: '1. Standard Form and Roots',
        content: 'A quadratic equation in variable $x$ is written in standard form as:\n\n$$ax^2 + bx + c = 0$$\n\nwhere $a, b, c \\in \\mathbb{R}$ and $a \\neq 0$. Roots are the values of $x$ satisfying the equation.'
      },
      {
        title: '2. The Discriminant and Nature of Roots',
        content: 'The discriminant is $D = b^2 - 4ac$:\n- If $D > 0$: Two distinct real roots.\n- If $D = 0$: Two equal real roots.\n- If $D < 0$: No real roots.'
      }
    ],
    formulas: [
      { name: 'Quadratic Formula', formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', explanation: 'Sridharacharya\'s formula to compute roots of any quadratic equation.' },
      { name: 'Discriminant', formula: 'D = b^2 - 4ac', explanation: 'Determines root qualities.' }
    ],
    workedExamples: [
      {
        question: 'Solve $2x^2 - 7x + 3 = 0$.',
        stepByStep: [
          'Identify coefficients: $a=2, b=-7, c=3$.',
          'Calculate discriminant: $D = (-7)^2 - 4(2)(3) = 49 - 24 = 25$.',
          'Apply quadratic formula: $x = (-(-7) \\pm \\sqrt{25}) / 4$.',
          'Simplify: $x = (7 \\pm 5)/4$. Roots are $x = 3$ and $x = 1/2$.'
        ],
        solution: 'x = 3, x = 1/2.'
      }
    ],
    commonMistakes: [
      { mistake: 'Forgetting the complete division bar in formula.', correction: 'Divide the entire -b +- sqrt(D) expression by 2a.', explanation: 'Partial division leads to math errors.' }
    ],
    examTricks: ['If a and c have opposite signs, real roots are guaranteed since D is positive.'],
    memoryTips: ['D is the nature detector: positive = 2, zero = 1 (repeated), negative = none.'],
    summaryPoints: ['Quadratic equations have degree 2 and exactly 2 roots.', 'Roots can be rational, irrational, or imaginary.'],
    diagramSvg: `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" />
      <line x1="20" y1="80" x2="380" y2="80" stroke="var(--color-text-secondary)" stroke-width="1.5" />
      <path d="M 60 20 Q 130 140 200 20" stroke="#FF6B6B" stroke-width="2" fill="none" />
      <text x="135" y="45" fill="#FF6B6B" font-size="10">D > 0</text>
      <path d="M 230 20 Q 280 140 330 80" stroke="#4ECDC4" stroke-width="2" fill="none" />
      <text x="290" y="95" fill="#4ECDC4" font-size="10">D = 0</text>
    </svg>`,
    questionsPool: [
      { questionText: 'If the discriminant of ax^2 + bx + c = 0 is less than zero, then roots are:', questionType: 'mcq', options: ['Real and distinct', 'Real and equal', 'No real roots', 'Rational'], correctAnswer: 'No real roots', explanation: 'D < 0 corresponds to imaginary complex conjugates, meaning no real roots exist.', difficulty: 0.25, bloomLevel: 'remember', tags: ['quadratic', 'discriminant'] }
    ],
    flashcardPool: [
      { front: 'State the Quadratic Formula.', back: 'x = (-b +/- root(b^2 - 4ac)) / 2a', difficulty: 0.2 },
      { front: 'What is the nature of roots if D = 0?', back: 'Two equal real roots.', difficulty: 0.2 }
    ]
  },
  'cbse-10-math-ch5': {
    id: 'cbse-10-math-ch5',
    topicName: 'Arithmetic Progressions',
    subject: 'Mathematics',
    board: 'CBSE',
    grade: 10,
    overview: 'Focuses on number patterns where consecutive terms differ by a constant value. Covers formulas to compute nth terms and sum totals.',
    theorySections: [
      {
        title: '1. AP Definition',
        content: 'An Arithmetic Progression is a sequence of numbers in which each term is obtained by adding a fixed number $d$ to the preceding term. The sequence is: $a, a+d, a+2d, \\dots$.'
      }
    ],
    formulas: [
      { name: 'nth Term of AP', formula: 'a_n = a + (n-1)d', explanation: 'Calculates any specific term inside the AP sequence.' },
      { name: 'Sum of n Terms', formula: 'S_n = \\frac{n}{2}[2a + (n-1)d]', explanation: 'Finds cumulative total.' }
    ],
    workedExamples: [
      {
        question: 'Find sum of first 20 terms of AP: 3, 7, 11, 15...',
        stepByStep: [
          'Identify variables: $a = 3$, $d = 4$, $n = 20$.',
          'Use formula: $S_n = (n/2)[2a + (n-1)d]$.',
          'Substitute: $S_{20} = 10 [6 + 19(4)] = 10 [6 + 76] = 820$.'
        ],
        solution: 'Sum is 820.'
      }
    ],
    commonMistakes: [
      { mistake: 'Confusing n (term index) with an (term value).', correction: 'n is index (e.g. 5th), an is value (e.g. 19).', explanation: 'They represent different concepts.' }
    ],
    examTricks: ['Consecutive terms relation: If a, b, c are in AP, then 2b = a + c.'],
    memoryTips: ['AP adds common difference repeatedly.'],
    summaryPoints: ['Common difference d can be positive, negative, or zero.'],
    diagramSvg: `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" />
      <rect x="50" y="80" width="40" height="20" rx="2" fill="var(--color-primary)" />
      <text x="65" y="95" fill="#FFF" font-size="10">a</text>
      <rect x="120" y="60" width="40" height="40" rx="2" fill="var(--color-primary)" opacity="0.8" />
      <text x="128" y="85" fill="#FFF" font-size="10">a+d</text>
      <rect x="190" y="40" width="40" height="60" rx="2" fill="var(--color-primary)" opacity="0.6" />
      <text x="198" y="75" fill="#FFF" font-size="10">a+2d</text>
      <path d="M 90 80 Q 105 70 120 70" stroke="#FF8C42" stroke-width="1.5" fill="none" marker-end="url(#arrow)" />
      <text x="102" y="65" fill="#FF8C42" font-size="9">+d</text>
    </svg>`,
    questionsPool: [
      { questionText: 'If common difference is 5, then a18 - a13 is:', questionType: 'mcq', options: ['5', '20', '25', '30'], correctAnswer: '25', explanation: 'a18 - a13 = (a + 17d) - (a + 12d) = 5d = 5(5) = 25.', difficulty: 0.35, bloomLevel: 'apply', tags: ['ap', 'difference'] }
    ],
    flashcardPool: [
      { front: 'Formula for sum of AP when first and last terms are known.', back: 'Sn = n/2 * (a + l)', difficulty: 0.2 }
    ]
  },
  'cbse-10-science-ch1': {
    id: 'cbse-10-science-ch1',
    topicName: 'Chemical Reactions',
    subject: 'Science',
    board: 'CBSE',
    grade: 10,
    overview: 'Explains chemical equations, stoichiometry, balancing, reaction modes (combination, decomposition, redox), and oxidation effects (corrosion).',
    theorySections: [
      {
        title: '1. Balanced Equations',
        content: 'A balanced equation has equal atoms of each element on reactants and products. This satisfies the **Law of Conservation of Mass**.'
      },
      {
        title: '2. Reaction Types',
        content: '- **Combination**: Two or more reactants form one product.\n- **Decomposition**: Single reactant splits into multiple products.\n- **Displacement**: Highly reactive metal displaces lesser reactive metal.'
      }
    ],
    formulas: [
      { name: 'Photosynthesis Reaction', formula: '6\\text{CO}_2 + 12\\text{H}_2\\text{O} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 + 6\\text{H}_2\\text{O}', explanation: 'Light reaction storing solar energy.' }
    ],
    workedExamples: [
      {
        question: 'Balance: $\\text{Fe} + \\text{H}_2\\text{O} \\rightarrow \\text{Fe}_3\\text{O}_4 + \\text{H}_2$',
        stepByStep: [
          'List atoms: Reactant (Fe=1, H=2, O=1), Product (Fe=3, H=2, O=4).',
          'Balance Fe by multiplying reactant Fe by 3: $3\\text{Fe}$.',
          'Balance O by multiplying reactant water by 4: $4\\text{H}_2\\text{O}$.',
          'Now hydrogen has 8 atoms on reactant side; balance product H2 by multiplying by 4.'
        ],
        solution: '$3\\text{Fe} + 4\\text{H}_2\\text{O} \\rightarrow \\text{Fe}_3\\text{O}_4 + 4\\text{H}_2$'
      }
    ],
    commonMistakes: [
      { mistake: 'Changing formula subscripts while balancing coefficients.', correction: 'Only insert coefficients in front of formulas, e.g., 2H2O, not H4O2.', explanation: 'Subscripts determine molecular identities.' }
    ],
    examTricks: ['Precipitate reactions usually belong to double displacement.'],
    memoryTips: ['Oxidation is loss of electrons, Reduction is gain (OIL RIG).'],
    summaryPoints: ['Corrosion is metal surface damage by moisture/oxygen.', 'Rancidity degrades fats.'],
    diagramSvg: `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" />
      <circle cx="80" cy="60" r="10" fill="#FF6B6B" />
      <circle cx="120" cy="60" r="10" fill="#4ECDC4" />
      <text x="96" y="64" fill="var(--color-text-primary)" font-size="14">+</text>
      <path d="M 160 60 L 220 60" stroke="var(--color-text-secondary)" stroke-width="2" marker-end="url(#arrow)" />
      <circle cx="270" cy="60" r="10" fill="#FF6B6B" />
      <circle cx="288" cy="60" r="10" fill="#4ECDC4" />
      <text x="80" y="90" fill="var(--color-text-primary)" font-size="10">Reactants (A + B)</text>
      <text x="260" y="90" fill="var(--color-text-primary)" font-size="10">Product (AB)</text>
    </svg>`,
    questionsPool: [
      { questionText: 'Which of the following indicates a chemical reaction has taken place?', questionType: 'mcq', options: ['Change in state', 'Evolution of gas', 'Change in temperature', 'All of the above'], correctAnswer: 'All of the above', explanation: 'All listed options are standard physical indicators of chemical reactivity.', difficulty: 0.2, bloomLevel: 'remember', tags: ['reactions', 'indicators'] }
    ],
    flashcardPool: [
      { front: 'Define double displacement reaction.', back: 'A reaction where two compounds exchange ions to form two new compounds.', difficulty: 0.3 }
    ]
  },
  'cbse-10-science-ch2': {
    id: 'cbse-10-science-ch2',
    topicName: 'Acids, Bases, and Salts',
    subject: 'Science',
    board: 'CBSE',
    grade: 10,
    overview: 'Analyzes acid/base properties, pH indicator responses, and chemical derivations of major sodium salts (e.g. baking soda, bleaching powder).',
    theorySections: [
      {
        title: '1. pH scale',
        content: 'pH measures hydrogen ion concentration. Neutral solutions measure 7, acidic ranges 0-7, basic ranges 7-14.'
      }
    ],
    formulas: [
      { name: 'Neutralization', formula: '\\text{Acid} + \\text{Base} \\rightarrow \\text{Salt} + \\text{Water}', explanation: 'Exothermic salt formation.' }
    ],
    workedExamples: [
      {
        question: 'Explain Chlor-alkali process with balanced equation.',
        stepByStep: [
          'Pass electricity through brine (aq NaCl).',
          'Produces chlorine gas at anode and hydrogen at cathode.',
          'Sodium hydroxide forms near cathode.'
        ],
        solution: '$2\\text{NaCl} + 2\\text{H}_2\\text{O} \\rightarrow 2\\text{NaOH} + \\text{Cl}_2 + \\text{H}_2$'
      }
    ],
    commonMistakes: [
      { mistake: 'Adding water to concentrated acid directly.', correction: 'Always pour acid into water slowly with continuous stirring.', explanation: 'Direct hydration releases high explosive heat.' }
    ],
    examTricks: ['Indicators color: Phenolphthalein turns pink in base, remains colorless in acid.'],
    memoryTips: ['Acid turns blue litmus Red (A-R), Base turns red litmus Blue (B-B).'],
    summaryPoints: ['Salts have various household and medical applications.'],
    diagramSvg: `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" />
      <defs>
        <linearGradient id="phGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#FF0000" />
          <stop offset="50%" stop-color="#00FF00" />
          <stop offset="100%" stop-color="#0000FF" />
        </linearGradient>
      </defs>
      <rect x="40" y="40" width="320" height="30" rx="4" fill="url(#phGrad)" />
      <text x="40" y="90" fill="var(--color-text-secondary)" font-size="11">0 (Acidic)</text>
      <text x="190" y="90" fill="var(--color-text-secondary)" font-size="11">7 (Neutral)</text>
      <text x="310" y="90" fill="var(--color-text-secondary)" font-size="11">14 (Alkaline)</text>
    </svg>`,
    questionsPool: [
      { questionText: 'What gas is released when acids react with metals?', questionType: 'mcq', options: ['Oxygen', 'Hydrogen', 'Carbon Dioxide', 'Nitrogen'], correctAnswer: 'Hydrogen', explanation: 'Metal + Acid -> Salt + Hydrogen gas (proven by pop test).', difficulty: 0.25, bloomLevel: 'remember', tags: ['acids', 'properties'] }
    ],
    flashcardPool: [
      { front: 'Chemical formula of Baking Soda.', back: 'NaHCO3 (Sodium Hydrogen Carbonate)', difficulty: 0.3 }
    ]
  },
  'cbse-10-science-ch6': {
    id: 'cbse-10-science-ch6',
    topicName: 'Life Processes',
    subject: 'Science',
    board: 'CBSE',
    grade: 10,
    overview: 'Explores standard biological systems (nutrition, aerobic/anaerobic respiration, human blood double circulation, and nephron excretion pathways).',
    theorySections: [
      {
        title: '1. Human Respiration',
        content: 'Glucose splits into Pyruvate in cytoplasm. Aerobic respiration in mitochondria generates 36-38 ATP molecules; anaerobic pathway yields lactate/ethanol.'
      }
    ],
    formulas: [
      { name: 'Anaerobic Yeast Glycolysis', formula: '\\text{Glucose} \\rightarrow \\text{Pyruvate} \\rightarrow \\text{Ethanol} + \\text{CO}_2 + 2\\text{ ATP}', explanation: 'Occurs without oxygen.' }
    ],
    workedExamples: [
      {
        question: 'Explain double circulation.',
        stepByStep: [
          'Deoxygenated blood enters right chambers from body.',
          'Pumped to lungs for oxygenation.',
          'Oxygenated blood returns to left chambers, then pumped to rest of body.'
        ],
        solution: 'Blood passes through the heart twice in one complete cycle.'
      }
    ],
    commonMistakes: [
      { mistake: 'Mismatching arterial and venous flow directions.', correction: 'Arteries carry blood AWAY from heart, veins carry TOWARDS.', explanation: 'Defines anatomical flow paths.' }
    ],
    examTricks: ['Nephrons filter waste; alveoli exchange gases; both maximize surface area.'],
    memoryTips: ['Aorta: Away, Vein: Visit.'],
    summaryPoints: ['Excretion is vital for toxin management.'],
    diagramSvg: `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" />
      <rect x="60" y="30" width="80" height="50" rx="4" fill="#FF8C42" fill-opacity="0.3" stroke="#FF8C42" stroke-width="2" />
      <text x="80" y="60" fill="var(--color-text-primary)" font-size="12">Lungs</text>
      <rect x="260" y="30" width="80" height="50" rx="4" fill="#4ECDC4" fill-opacity="0.3" stroke="#4ECDC4" stroke-width="2" />
      <text x="280" y="60" fill="var(--color-text-primary)" font-size="12">Body</text>
      <path d="M 140 45 L 260 45" stroke="#FF6B6B" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 260 65 L 140 65" stroke="#45B7D1" stroke-width="2" marker-end="url(#arrow)" />
    </svg>`,
    questionsPool: [
      { questionText: 'Which chamber of the human heart receives oxygenated blood from the lungs?', questionType: 'mcq', options: ['Right Atrium', 'Left Atrium', 'Right Ventricle', 'Left Ventricle'], correctAnswer: 'Left Atrium', explanation: 'Pulmonary veins dump oxygen-rich blood into the Left Atrium.', difficulty: 0.4, bloomLevel: 'understand', tags: ['biology', 'circulation'] }
    ],
    flashcardPool: [
      { front: 'Where does the breakdown of pyruvate into carbon dioxide and water take place?', back: 'Mitochondria.', difficulty: 0.3 }
    ]
  },
  'cbse-10-science-ch10': {
    id: 'cbse-10-science-ch10',
    topicName: 'Light Reflection and Refraction',
    subject: 'Science',
    board: 'CBSE',
    grade: 10,
    overview: 'Explains optical behaviors including lens/mirror transformations, sign conventions, refractive index boundaries, and magnification calculation.',
    theorySections: [
      {
        title: '1. Refraction Snell Law',
        content: 'Snell\'s law states the ratio of sine of angle of incidence to sine of angle of refraction is constant for a given pair of media.'
      }
    ],
    formulas: [
      { name: 'Mirror Formula', formula: '\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}', explanation: 'Focal relationships.' },
      { name: 'Lens Formula', formula: '\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}', explanation: 'Refractive focal relationships.' },
      { name: 'Snell Law', formula: '\\frac{\\sin i}{\\sin r} = n_{21}', explanation: 'Angle boundaries.' }
    ],
    workedExamples: [
      {
        question: 'Solve image location: Object placed 10cm from concave mirror of focal length 15cm.',
        stepByStep: [
          'Given: $u = -10\\text{cm}$, $f = -15\\text{cm}$.',
          'Formula: $1/v = 1/f - 1/u$.',
          'Calculate: $1/v = -1/15 - (-1/10) = -1/15 + 1/10 = 1/30$.',
          'So $v = +30\\text{cm}$ (Virtual image behind mirror).'
        ],
        solution: '$v = +30\\text{cm}$ (Virtual and erect).'
      }
    ],
    commonMistakes: [
      { mistake: 'Forgetting mirror vs lens sign difference.', correction: 'Mirror formula uses + sign, lens formula uses - sign.', explanation: 'Crucial for optical calculations.' }
    ],
    examTricks: ['Virtual images are always erect; real images are always inverted.'],
    memoryTips: ['ConCave goes inwards (like a cave).'],
    summaryPoints: ['Power of a lens is measured in Dioptres.'],
    diagramSvg: `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" />
      <line x1="30" y1="60" x2="370" y2="60" stroke="var(--color-text-secondary)" stroke-dasharray="4" />
      <path d="M 300 20 C 280 40 280 80 300 100" stroke="var(--color-text-primary)" stroke-width="3.5" fill="none" />
      <line x1="150" y1="30" x2="290" y2="60" stroke="#FF6B6B" stroke-width="2" />
      <line x1="290" y1="60" x2="150" y2="90" stroke="#FF6B6B" stroke-width="2" stroke-dasharray="2" />
      <circle cx="210" cy="60" r="3" fill="#4ECDC4" />
      <text x="205" y="75" fill="#4ECDC4" font-size="10">F</text>
    </svg>`,
    questionsPool: [
      { questionText: 'A spherical mirror and a thin spherical lens have each a focal length of -15 cm. The mirror and the lens are likely to be:', questionType: 'mcq', options: ['Both concave', 'Both convex', 'Mirror is concave and lens is convex', 'Mirror is convex and lens is concave'], correctAnswer: 'Both concave', explanation: 'By Cartesian sign convention, concave mirrors and concave lenses both have negative focal lengths.', difficulty: 0.45, bloomLevel: 'analyze', tags: ['physics', 'optics'] }
    ],
    flashcardPool: [
      { front: 'Formula for power of a lens.', back: 'P = 1/f (f in meters). Unit is Dioptre (D).', difficulty: 0.2 }
    ]
  },
  'cbse-7-math-ch1': {
    id: 'cbse-7-math-ch1',
    topicName: 'Integers',
    subject: 'Mathematics',
    board: 'CBSE',
    grade: 7,
    overview: 'Introduces operations on signed numbers. Covers rules of signs, properties of integers, and division patterns.',
    theorySections: [
      {
        title: '1. Integer Properties',
        content: 'Integers represent negative numbers, zero, and positive numbers. Multiplication rules:\n- Positive * Negative = Negative\n- Negative * Negative = Positive'
      }
    ],
    formulas: [
      { name: 'Distributive Rule', formula: 'a \\times (b + c) = (a \\times b) + (a \\times c)', explanation: 'Simplifies complex multiplications.' }
    ],
    workedExamples: [
      {
        question: 'Solve: $(-20) \\times (-5) + (-30)$.',
        stepByStep: [
          'Multiply: $(-20) \\times (-5) = 100$.',
          'Add: $100 + (-30) = 70$.'
        ],
        solution: '70.'
      }
    ],
    commonMistakes: [
      { mistake: 'Adding signs incorrectly in subtraction.', correction: '-5 - (-3) becomes -5 + 3 = -2.', explanation: 'Double negatives cancel.' }
    ],
    examTricks: ['Multiplying an odd number of negative integers yields a negative result.'],
    memoryTips: ['Same signs multiply to Positive; different signs multiply to Negative.'],
    summaryPoints: ['Zero is neither positive nor negative.'],
    diagramSvg: `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" />
      <line x1="40" y1="60" x2="360" y2="60" stroke="var(--color-text-primary)" stroke-width="2" />
      <text x="200" y="85" fill="var(--color-text-primary)" font-size="12">0</text>
      <text x="100" y="85" fill="var(--color-text-primary)" font-size="12">-5</text>
      <text x="300" y="85" fill="var(--color-text-primary)" font-size="12">+5</text>
    </svg>`,
    questionsPool: [
      { questionText: 'Evaluate: (-30) / 10 is equal to:', questionType: 'mcq', options: ['3', '-3', '300', '-300'], correctAnswer: '-3', explanation: '-30 divided by 10 is -3 since negative divided by positive is negative.', difficulty: 0.2, bloomLevel: 'apply', tags: ['integers', 'operations'] }
    ],
    flashcardPool: [
      { front: 'Is division of integers commutative?', back: 'No. For example, a / b is not equal to b / a.', difficulty: 0.2 }
    ]
  },
  'cbse-7-math-ch2': {
    id: 'cbse-7-math-ch2',
    topicName: 'Fractions and Decimals',
    subject: 'Mathematics',
    board: 'CBSE',
    grade: 7,
    overview: 'Explains proper/improper rational divisions, decimal multiplications, and structural fraction parts.',
    theorySections: [
      {
        title: '1. Fraction Operations',
        content: 'To divide by a fraction, multiply by its reciprocal:\n\n$$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$$'
      }
    ],
    formulas: [
      { name: 'Reciprocal Product', formula: '\\frac{a}{b} \\times \\frac{b}{a} = 1', explanation: 'Reciprocals cancel.' }
    ],
    workedExamples: [
      {
        question: 'Find product of $0.2 \\times 0.3$.',
        stepByStep: [
          'Multiply integers: $2 \\times 3 = 6$.',
          'Count decimal places: one in each, total two places.',
          'Insert decimal point: $0.06$.'
        ],
        solution: '0.06.'
      }
    ],
    commonMistakes: [
      { mistake: 'Adding denominators during fraction addition.', correction: 'Find common LCD denominator first.', explanation: 'Denominators index slice size.' }
    ],
    examTricks: ['Simplify fractions before multiplying to save time.'],
    memoryTips: ['Denominator is down.'],
    summaryPoints: ['Improper fractions have larger numerators.'],
    diagramSvg: `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" />
      <circle cx="200" cy="60" r="40" stroke="var(--color-text-primary)" stroke-width="2" />
      <path d="M 200 20 L 200 100" stroke="var(--color-text-primary)" stroke-width="2" />
      <path d="M 160 60 L 240 60" stroke="var(--color-text-primary)" stroke-width="2" />
      <path d="M 200 60 L 240 100 A 40 40 0 0 1 160 60 Z" fill="#4ECDC4" opacity="0.5" />
      <text x="270" y="65" fill="#4ECDC4" font-size="14" font-weight="bold">1/4 shaded</text>
    </svg>`,
    questionsPool: [
      { questionText: 'What is the reciprocal of 2/3?', questionType: 'mcq', options: ['2/3', '3/2', '-2/3', '1'], correctAnswer: '3/2', explanation: 'Reciprocal of a fraction is obtained by swapping numerator and denominator.', difficulty: 0.2, bloomLevel: 'remember', tags: ['fractions'] }
    ],
    flashcardPool: [
      { front: 'How do you multiply two decimals?', back: 'Multiply as whole numbers and place the decimal point by counting total decimal places in factors.', difficulty: 0.3 }
    ]
  },
  'cbse-7-science-ch1': {
    id: 'cbse-7-science-ch1',
    topicName: 'Nutrition in Plants',
    subject: 'Science',
    board: 'CBSE',
    grade: 7,
    overview: 'Discusses autotrophic/heterotrophic nutrition, stomata activities, and nitrogen soil replenishment.',
    theorySections: [
      {
        title: '1. Photosynthesis',
        content: 'Green plants synthesize food from carbon dioxide and water using solar energy captured by chlorophyll.'
      }
    ],
    formulas: [
      { name: 'Photosynthesis Reaction', formula: '\\text{Carbon dioxide} + \\text{Water} \\xrightarrow{\\text{Light, Chlorophyll}} \\text{Carbohydrate} + \\text{Oxygen}', explanation: 'Base energy cycle.' }
    ],
    workedExamples: [
      {
        question: 'Explain symbiotic relations in lichens.',
        stepByStep: [
          'Lichen consists of alga and fungus living together.',
          'Alga provides organic food via photosynthesis.',
          'Fungus provides shelter, water, and minerals.'
        ],
        solution: 'Mutualistic symbiosis.'
      }
    ],
    commonMistakes: [
      { mistake: 'Believing all plants are complete autotrophs.', correction: 'Cuscuta (parasite) and Pitcher plant (insectivorous) are heterotrophic.', explanation: 'Exceptions exist.' }
    ],
    examTricks: ['Starch test uses iodine solution; blue-black color indicates starch presence.'],
    memoryTips: ['Chlorophyll is green like grass.'],
    summaryPoints: ['Plants are primary organic producers.'],
    diagramSvg: `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" />
      <circle cx="80" cy="40" r="20" fill="#F4B400" />
      <text x="70" y="45" fill="#FFF" font-size="10">Sunlight</text>
      <path d="M 110 50 L 160 70" stroke="#FF8C42" stroke-width="2" marker-end="url(#arrow)" />
      <rect x="180" y="60" width="60" height="40" rx="4" fill="#82E0AA" />
      <text x="190" y="85" fill="#FFF" font-size="10">Plant</text>
    </svg>`,
    questionsPool: [
      { questionText: 'Which raw material is absorbed from soil by roots for photosynthesis?', questionType: 'mcq', options: ['Carbon dioxide', 'Water', 'Oxygen', 'Chlorophyll'], correctAnswer: 'Water', explanation: 'Roots pull water and dissolved nitrogen minerals from soil.', difficulty: 0.2, bloomLevel: 'remember', tags: ['biology', 'photosynthesis'] }
    ],
    flashcardPool: [
      { front: 'What is the role of guard cells?', back: 'Guard cells surround stomatal pores to regulate opening and closing.', difficulty: 0.3 }
    ]
  },
  'mh-10-math-1-ch1': {
    id: 'mh-10-math-1-ch1',
    topicName: 'Linear Equations in Two Variables',
    subject: 'Mathematics',
    board: 'STATE_MH',
    grade: 10,
    overview: 'Detailed algebraic structures covering simultaneous equations, Cramer\'s determinant rules, and reducible systems matching MSBSHSE syllabus.',
    theorySections: [
      {
        title: '1. Cramer\'s Rule',
        content: 'Solve simultaneous equations $a_1x + b_1y = c_1$ and $a_2x + b_2y = c_2$ by determinants. Define:\n\n$$D = \\begin{vmatrix} a_1 & b_1 \\\\ a_2 & b_2 \\end{vmatrix}, \\quad D_x = \\begin{vmatrix} c_1 & b_1 \\\\ c_2 & b_2 \\end{vmatrix}, \\quad D_y = \\begin{vmatrix} a_1 & c_1 \\\\ a_2 & c_2 \\end{vmatrix}$$\n\nThen: $x = D_x/D$, $y = D_y/D$.'
      }
    ],
    formulas: [
      { name: 'Determinant Solution', formula: 'D = a_1b_2 - a_2b_1', explanation: 'Base factor.' },
      { name: 'Cramer Formula', formula: 'x = \\frac{D_x}{D}, \\quad y = \\frac{D_y}{D}', explanation: 'Coordinates.' }
    ],
    workedExamples: [
      {
        question: 'Solve using Cramer\'s rule: $3x - 4y = 10$, $4x + 3y = 5$.',
        stepByStep: [
          'Find $D = (3)(3) - (-4)(4) = 9 + 16 = 25$.',
          'Find $D_x = (10)(3) - (-4)(5) = 30 + 20 = 50$.',
          'Find $D_y = (3)(5) - (10)(4) = 15 - 40 = -25$.',
          'Calculate: $x = D_x/D = 50/25 = 2$, $y = D_y/D = -25/25 = -1$.'
        ],
        solution: 'x = 2, y = -1.'
      }
    ],
    commonMistakes: [
      { mistake: 'Mixing signs while calculating determinants.', correction: 'Use parenthetical math, e.g. a1b2 - (a2b1).', explanation: 'Negative signs cause sign flips.' }
    ],
    examTricks: ['Ensure equations are in ax + by = c form before writing Cramer matrices.'],
    memoryTips: ['D uses coefficients of x and y. Dx swaps x-column with constant numbers.'],
    summaryPoints: ['Cramer method requires non-zero D.'],
    diagramSvg: `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" />
      <text x="140" y="55" fill="var(--color-text-primary)" font-size="14">| a₁  b₁ |</text>
      <text x="140" y="85" fill="var(--color-text-primary)" font-size="14">| a₂  b₂ |</text>
      <path d="M 230 45 L 290 85" stroke="#FF6B6B" stroke-width="2" />
      <path d="M 290 45 L 230 85" stroke="#4ECDC4" stroke-width="2" />
      <text x="310" y="70" fill="var(--color-text-primary)" font-size="12">a₁b₂ - a₂b₁</text>
    </svg>`,
    questionsPool: [
      { questionText: 'For simultaneous equations in x and y, if Dx = 49, Dy = -63 and D = 7, then x is:', questionType: 'mcq', options: ['7', '-9', '1/7', '-1/9'], correctAnswer: '7', explanation: 'x = Dx / D = 49 / 7 = 7.', difficulty: 0.3, bloomLevel: 'apply', tags: ['cramer', 'determinant'] }
    ],
    flashcardPool: [
      { front: 'What is Cramer\'s Rule formula for y?', back: 'y = Dy / D', difficulty: 0.2 }
    ]
  },
  'mh-10-math-1-ch2': {
    id: 'mh-10-math-1-ch2',
    topicName: 'Quadratic Equations',
    subject: 'Mathematics',
    board: 'STATE_MH',
    grade: 10,
    overview: 'Maharashtra Board quadratic equation syllabus focusing on solutions by factorization, formula method, and relations of roots/coefficients.',
    theorySections: [
      {
        title: '1. Root Symmetric Relations',
        content: 'If $\\alpha, \\beta$ are roots of $ax^2 + bx + c = 0$:\n- $\\alpha^2 + \\beta^2 = (\\alpha+\\beta)^2 - 2\\alpha\\beta = (-b/a)^2 - 2c/a$.'
      }
    ],
    formulas: [
      { name: 'Root Relation Sum', formula: '\\alpha + \\beta = -\\frac{b}{a}', explanation: 'Symmetric relation.' },
      { name: 'Symmetric Squares', formula: '\\alpha^2 + \\beta^2 = (\\alpha+\\beta)^2 - 2\\alpha\\beta', explanation: 'Expansion calculation.' }
    ],
    workedExamples: [
      {
        question: 'Solve $x^2 + 8x + 15 = 0$ by factorization.',
        stepByStep: [
          'Find numbers multiplying to 15 and adding to 8: 3 and 5.',
          'Factor: $(x + 3)(x + 5) = 0$.',
          'Set to zero: $x = -3$ or $x = -5$.'
        ],
        solution: 'x = -3, -5.'
      }
    ],
    commonMistakes: [
      { mistake: 'Writing positive factors directly as roots.', correction: 'If factors are (x+3)(x+5)=0, roots are x = -3, -5.', explanation: 'Solve for x by setting factor to zero.' }
    ],
    examTricks: ['Check if D is perfect square to verify factorization feasibility.'],
    memoryTips: ['Factoring is splitting: sum is middle, product is end.'],
    summaryPoints: ['Roots can form symmetric polynomials.'],
    diagramSvg: `<svg viewBox="0 0 400 120" class="w-full h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" rx="8" fill="var(--color-bg-tertiary)" />
      <text x="180" y="45" fill="var(--color-text-primary)" font-size="14">x² + 8x + 15 = 0</text>
      <path d="M 200 60 L 160 90" stroke="var(--color-text-secondary)" stroke-width="1.5" />
      <path d="M 200 60 L 240 90" stroke="var(--color-text-secondary)" stroke-width="1.5" />
      <text x="140" y="105" fill="#4ECDC4" font-size="12" font-weight="bold">(x + 3)</text>
      <text x="230" y="105" fill="#4ECDC4" font-size="12" font-weight="bold">(x + 5)</text>
    </svg>`,
    questionsPool: [
      { questionText: 'If alpha and beta are roots of x^2 - 5x + 6 = 0, find alpha^2 + beta^2:', questionType: 'mcq', options: ['13', '25', '12', '19'], correctAnswer: '13', explanation: 'alpha+beta = 5, alpha*beta = 6. alpha^2+beta^2 = (5)^2 - 2(6) = 25 - 12 = 13.', difficulty: 0.45, bloomLevel: 'apply', tags: ['roots', 'symmetric'] }
    ],
    flashcardPool: [
      { front: 'Formula for discriminant D in Marathi board syllabus.', back: 'D = b^2 - 4ac. Denoted as Delta.', difficulty: 0.2 }
    ]
  }
};
