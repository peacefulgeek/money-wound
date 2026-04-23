export interface Product {
  asin: string;
  name: string;
  category: string;
  tags: string[];
}

export const productCatalog: Product[] = [
  // Books - Money Psychology
  { asin: '1626566445', name: 'The Soul of Money by Lynne Twist', category: 'books-money', tags: ['money-psychology', 'abundance', 'scarcity', 'values'] },
  { asin: '0062435612', name: 'Lost and Found: Unexpected Revelations About Food and Money by Geneen Roth', category: 'books-money', tags: ['money-psychology', 'self-worth', 'emotional-eating'] },
  { asin: '1608684296', name: 'The Art of Money by Bari Tessler', category: 'books-money', tags: ['financial-therapy', 'money-healing', 'budgeting'] },
  { asin: '0143115766', name: 'Your Money or Your Life by Vicki Robin', category: 'books-money', tags: ['financial-independence', 'values', 'frugality'] },
  { asin: '0385527454', name: 'Sacred Success by Barbara Huson', category: 'books-money', tags: ['women-money', 'underearning', 'wealth'] },
  { asin: '1401938221', name: 'Money: A Love Story by Kate Northrup', category: 'books-money', tags: ['money-healing', 'women-money', 'abundance'] },
  { asin: '1594484929', name: 'The Gifts of Imperfection by Brene Brown', category: 'books-money', tags: ['shame', 'vulnerability', 'self-worth'] },
  { asin: '1401952844', name: 'Daring Greatly by Brene Brown', category: 'books-money', tags: ['shame', 'vulnerability', 'courage'] },
  { asin: '0062407341', name: 'Mind Over Money by Brad Klontz', category: 'books-money', tags: ['money-scripts', 'financial-psychology', 'money-disorders'] },
  { asin: '1608680541', name: 'Overcoming Underearning by Barbara Huson', category: 'books-money', tags: ['underearning', 'women-money', 'salary'] },
  { asin: '0525534237', name: 'I Will Teach You to Be Rich by Ramit Sethi', category: 'books-money', tags: ['personal-finance', 'investing', 'automation'] },
  { asin: '1612680194', name: 'Rich Dad Poor Dad by Robert Kiyosaki', category: 'books-money', tags: ['wealth-mindset', 'investing', 'financial-education'] },
  { asin: '0316346624', name: 'The Psychology of Money by Morgan Housel', category: 'books-money', tags: ['money-psychology', 'investing', 'wealth-mindset'] },
  { asin: '0062316109', name: 'The Total Money Makeover by Dave Ramsey', category: 'books-money', tags: ['debt', 'budgeting', 'financial-recovery'] },
  { asin: '1250301696', name: 'Get Good with Money by Tiffany Aliche', category: 'books-money', tags: ['budgeting', 'financial-planning', 'women-money'] },

  // Financial Planning Tools
  { asin: '1250309476', name: 'Budget Planner and Monthly Bill Organizer', category: 'planners', tags: ['budgeting', 'financial-planning', 'organization'] },
  { asin: '1647397723', name: 'Clever Fox Budget Planner', category: 'planners', tags: ['budgeting', 'financial-planning', 'debt-payoff'] },
  { asin: 'B08BHXV2FX', name: 'Financial Planner and Expense Tracker Journal', category: 'planners', tags: ['budgeting', 'expense-tracking', 'financial-goals'] },
  { asin: '1250229006', name: 'Debt Free Chart Tracker Notebook', category: 'planners', tags: ['debt', 'debt-payoff', 'financial-goals'] },

  // Stress and Anxiety Supplements
  { asin: 'B07CQKRPQM', name: 'Nature Made Magnesium Glycinate 200mg', category: 'supplements', tags: ['anxiety', 'stress', 'sleep', 'nervous-system'] },
  { asin: 'B00YQZXHQO', name: 'Ashwagandha Root Powder Supplement', category: 'supplements', tags: ['anxiety', 'stress', 'cortisol', 'nervous-system'] },
  { asin: 'B001GAOTSW', name: 'NOW Supplements L-Theanine 200mg', category: 'supplements', tags: ['anxiety', 'stress', 'focus', 'calm'] },
  { asin: 'B07BNVWX2P', name: 'Calm Magnesium Powder Supplement', category: 'supplements', tags: ['anxiety', 'stress', 'sleep', 'nervous-system'] },

  // Nervous System Regulation Tools
  { asin: 'B07D93JFGS', name: 'YnM Weighted Blanket 15lbs', category: 'nervous-system', tags: ['anxiety', 'stress', 'sleep', 'nervous-system', 'somatic'] },
  { asin: 'B07JQFBXNQ', name: 'Acupressure Mat and Pillow Set', category: 'nervous-system', tags: ['stress', 'nervous-system', 'somatic', 'body-healing'] },
  { asin: 'B07GZLQ5VJ', name: 'Muse 2 Brain Sensing Headband Meditation Device', category: 'nervous-system', tags: ['meditation', 'stress', 'nervous-system', 'mindfulness'] },

  // Meditation and Mindfulness
  { asin: 'B07BWMKFQD', name: 'Zafu Meditation Cushion Set', category: 'meditation', tags: ['meditation', 'mindfulness', 'practice'] },
  { asin: 'B07YJGZX3V', name: 'Five Minute Journal for Daily Gratitude', category: 'meditation', tags: ['gratitude', 'journaling', 'mindfulness', 'morning-practice'] },
  { asin: 'B07NQBQB3K', name: 'Insight Timer Meditation App Gift Card', category: 'meditation', tags: ['meditation', 'mindfulness', 'practice'] },
  { asin: '0593135652', name: 'Radical Acceptance by Tara Brach', category: 'books-spiritual', tags: ['acceptance', 'shame', 'meditation', 'healing'] },

  // Investment and Education
  { asin: '0143127101', name: 'A Random Walk Down Wall Street by Burton Malkiel', category: 'books-investing', tags: ['investing', 'stocks', 'financial-education'] },
  { asin: '0316453382', name: 'The Little Book of Common Sense Investing by John Bogle', category: 'books-investing', tags: ['investing', 'index-funds', 'financial-education'] },
  { asin: '1400202019', name: 'The Intelligent Investor by Benjamin Graham', category: 'books-investing', tags: ['investing', 'value-investing', 'financial-education'] },

  // Office/Workspace
  { asin: 'B07RLMKFGZ', name: 'Blue Light Blocking Glasses', category: 'workspace', tags: ['focus', 'eye-strain', 'productivity'] },
  { asin: 'B07NQKX6WR', name: 'LectroFan White Noise Sound Machine', category: 'workspace', tags: ['focus', 'sleep', 'stress', 'concentration'] },

  // Self-Help
  { asin: '0062457713', name: 'You Are a Badass at Making Money by Jen Sincero', category: 'books-selfhelp', tags: ['money-mindset', 'abundance', 'wealth'] },
  { asin: '1401952895', name: 'The Big Leap by Gay Hendricks', category: 'books-selfhelp', tags: ['self-sabotage', 'upper-limit', 'success'] },
  { asin: '0062965204', name: 'Untamed by Glennon Doyle', category: 'books-selfhelp', tags: ['authenticity', 'self-worth', 'women'] },
  { asin: '0525559477', name: 'The Body Keeps the Score by Bessel van der Kolk', category: 'books-trauma', tags: ['trauma', 'somatic', 'healing', 'body'] },
  { asin: '1250301920', name: 'What My Mother and I Don\'t Talk About', category: 'books-trauma', tags: ['family', 'inheritance', 'generational-trauma'] },
  { asin: '0062820699', name: 'It Didn\'t Start with You by Mark Wolynn', category: 'books-trauma', tags: ['generational-trauma', 'inherited-patterns', 'family'] },
];

export default productCatalog;
