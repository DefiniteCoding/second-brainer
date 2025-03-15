
import { v4 as uuidv4 } from 'uuid';
import { Note, Tag } from '@/contexts/NotesContext';

// Sample tags for demo notes
export const demoTags: Tag[] = [
  { id: uuidv4(), name: 'Work', color: '#3B82F6' },
  { id: uuidv4(), name: 'Personal', color: '#10B981' },
  { id: uuidv4(), name: 'Ideas', color: '#8B5CF6' },
  { id: uuidv4(), name: 'Research', color: '#F59E0B' },
  { id: uuidv4(), name: 'Meeting', color: '#EC4899' },
  { id: uuidv4(), name: 'Book', color: '#6366F1' },
  { id: uuidv4(), name: 'Article', color: '#14B8A6' },
  { id: uuidv4(), name: 'Project', color: '#EF4444' },
  { id: uuidv4(), name: 'Course', color: '#84CC16' },
  { id: uuidv4(), name: 'Recipe', color: '#F97316' },
  { id: uuidv4(), name: 'Health', color: '#06B6D4' },
  { id: uuidv4(), name: 'Finance', color: '#64748B' }
];

// Create a function to generate random dates within the past 3 months
const getRandomDate = () => {
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  
  return new Date(
    threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime())
  );
};

// Get random tags for a note
const getRandomTags = (tags: Tag[], min = 1, max = 3) => {
  const numTags = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...tags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTags);
};

// Generate sample notes
export const generateDemoNotes = (tags: Tag[]): Note[] => {
  const notes: Note[] = [];
  const noteIds: string[] = Array(100).fill(0).map(() => uuidv4());
  
  // Work notes
  notes.push({
    id: noteIds[0],
    title: "Project Kickoff Meeting",
    content: "# Project Kickoff Notes\n\nAttendees: John, Sarah, Michael\n\n## Agenda\n1. Project overview\n2. Timeline discussion\n3. Resource allocation\n\nNext meeting scheduled for next Thursday. Need to prepare initial mockups by then.\n\nConnect this with the [[Design System]] documentation.",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Work')!, tags.find(t => t.name === 'Meeting')!],
    connections: [],
    mentions: []
  });
  
  notes.push({
    id: noteIds[1],
    title: "Design System",
    content: "# Our Design System\n\n## Colors\n- Primary: #3B82F6\n- Secondary: #10B981\n- Accent: #8B5CF6\n\n## Typography\n- Headings: Inter Bold\n- Body: Inter Regular\n- Monospace: Fira Code\n\nThis system should be implemented across all products to maintain consistency.",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Work')!, tags.find(t => t.name === 'Project')!],
    connections: [noteIds[0]],
    mentions: []
  });
  
  notes.push({
    id: noteIds[2],
    title: "Quarterly Strategy Review",
    content: "# Q2 Strategy Review\n\n## Key Metrics\n- Revenue: $1.2M (+15% YoY)\n- User Growth: 22% increase\n- Churn: Reduced to 3.5%\n\n## Focus Areas for Q3\n1. Mobile experience enhancement\n2. Enterprise customer acquisition\n3. Platform performance\n\nNext steps: Schedule follow-up with product team on the [[Product Roadmap]].",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Work')!, tags.find(t => t.name === 'Meeting')!],
    connections: [],
    mentions: []
  });
  
  notes.push({
    id: noteIds[3],
    title: "Product Roadmap",
    content: "# Product Roadmap 2023-2024\n\n## Q3 2023\n- Launch mobile app v2.0\n- Implement AI-based recommendations\n- Improve dashboard performance\n\n## Q4 2023\n- Enterprise SSO integration\n- Advanced analytics module\n- Custom reporting features\n\n## Q1 2024\n- API v3 with new endpoints\n- Collaborative editing features\n- White-label solutions\n\nThis aligns with our discussion in the [[Quarterly Strategy Review]].",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Work')!, tags.find(t => t.name === 'Project')!],
    connections: [noteIds[2]],
    mentions: [noteIds[2]]
  });
  
  notes.push({
    id: noteIds[4],
    title: "Interview Questions for Frontend Developer",
    content: "# Frontend Developer Interview Questions\n\n1. Explain the virtual DOM and its benefits\n2. How would you optimize a React application?\n3. Explain CSS specificity and the box model\n4. How do you handle state management in large applications?\n5. Describe your experience with TypeScript\n6. How would you implement responsive design?\n\nTechnical assessment: Build a simple component that fetches and displays data from an API.",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Work')!],
    connections: [],
    mentions: []
  });
  
  // Research notes
  notes.push({
    id: noteIds[5],
    title: "Machine Learning Research",
    content: "# Machine Learning Models Overview\n\n## Supervised Learning\n- Linear Regression\n- Decision Trees\n- Neural Networks\n\n## Unsupervised Learning\n- K-means Clustering\n- Principal Component Analysis\n- Autoencoders\n\n## Reinforcement Learning\n- Q-Learning\n- Deep Q Networks\n- Policy Gradients\n\nPotential applications for our product recommendations system. Connect with [[Product Roadmap]].",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Research')!, tags.find(t => t.name === 'Work')!],
    connections: [noteIds[3]],
    mentions: [noteIds[3]]
  });
  
  notes.push({
    id: noteIds[6],
    title: "Competitive Analysis",
    content: "# Competitor Analysis\n\n## Competitor A\n- Strengths: User interface, mobile experience\n- Weaknesses: Limited integrations, pricing\n\n## Competitor B\n- Strengths: Enterprise features, security\n- Weaknesses: Outdated UI, poor performance\n\n## Competitor C\n- Strengths: API flexibility, developer tools\n- Weaknesses: Learning curve, customer support\n\nInsights to inform our [[Product Roadmap]] and [[Marketing Strategy]].",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Research')!, tags.find(t => t.name === 'Work')!],
    connections: [noteIds[3]],
    mentions: [noteIds[3]]
  });
  
  notes.push({
    id: noteIds[7],
    title: "Marketing Strategy",
    content: "# Marketing Strategy 2023\n\n## Target Audiences\n1. Small to medium businesses\n2. Creative professionals\n3. Education sector\n\n## Channels\n- Content marketing: Focus on SEO and thought leadership\n- Social: LinkedIn and Twitter campaigns\n- Partnerships: Integrate with popular tools\n\n## Messaging\n\"Organize your thoughts, amplify your productivity\"\n\nBase this on insights from our [[Competitive Analysis]].",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Work')!, tags.find(t => t.name === 'Project')!],
    connections: [noteIds[6]],
    mentions: [noteIds[6]]
  });
  
  // Personal notes
  notes.push({
    id: noteIds[8],
    title: "Reading List",
    content: "# Books to Read\n\n- \"Atomic Habits\" by James Clear\n- \"The Psychology of Money\" by Morgan Housel\n- \"Deep Work\" by Cal Newport\n- \"Designing Data-Intensive Applications\" by Martin Kleppmann\n- \"The Almanack of Naval Ravikant\"\n- \"Four Thousand Weeks\" by Oliver Burkeman\n\nStarted reading [[Atomic Habits Notes]]",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Personal')!, tags.find(t => t.name === 'Book')!],
    connections: [],
    mentions: []
  });
  
  notes.push({
    id: noteIds[9],
    title: "Atomic Habits Notes",
    content: "# Atomic Habits by James Clear\n\n## Key Concepts\n\n1. **Habit Loop**: Cue, Craving, Response, Reward\n2. **Four Laws of Behavior Change**:\n   - Make it obvious (cue)\n   - Make it attractive (craving)\n   - Make it easy (response)\n   - Make it satisfying (reward)\n\n## Practical Applications\n- Identity-based habits: Focus on becoming the type of person who does the habit\n- Environment design: Set up your environment to make good habits obvious and easy\n- Habit stacking: Pair a new habit with an existing one\n\nConnect to [[Personal Development Plan]]",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Personal')!, tags.find(t => t.name === 'Book')!],
    connections: [noteIds[8]],
    mentions: [noteIds[8]]
  });
  
  notes.push({
    id: noteIds[10],
    title: "Personal Development Plan",
    content: "# Personal Development Plan\n\n## Goals for This Year\n\n1. **Technical Skills**\n   - Complete advanced TypeScript course\n   - Build one side project using new technologies\n   - Contribute to open source monthly\n\n2. **Soft Skills**\n   - Improve public speaking (join Toastmasters)\n   - Practice negotiation techniques\n   - Enhance written communication\n\n3. **Health**\n   - Exercise 4 times per week\n   - Meditate daily for 10 minutes\n   - Maintain consistent sleep schedule\n\nUse principles from [[Atomic Habits Notes]] to implement these changes.",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Personal')!],
    connections: [noteIds[9]],
    mentions: [noteIds[9]]
  });
  
  notes.push({
    id: noteIds[11],
    title: "Investment Notes",
    content: "# Investment Strategy\n\n## Portfolio Allocation\n- 60% Index funds (VTI, VXUS)\n- 20% Individual stocks\n- 10% Bonds (BND)\n- 10% Alternative investments\n\n## Principles\n1. Long-term focus (10+ years horizon)\n2. Regular dollar-cost averaging\n3. Tax-efficient placement\n4. Rebalance annually\n\nRevisit this after reading [[The Psychology of Money]]",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Personal')!, tags.find(t => t.name === 'Finance')!],
    connections: [],
    mentions: []
  });
  
  // Ideas notes
  notes.push({
    id: noteIds[12],
    title: "App Idea: Meal Planner",
    content: "# Meal Planner App Concept\n\n## Core Features\n1. Recipe database with nutritional information\n2. Drag-and-drop weekly meal planning\n3. Automatic grocery list generation\n4. Dietary restriction filters\n5. Integration with grocery delivery services\n\n## Unique Selling Points\n- AI-based recommendations based on preferences and past meals\n- Waste reduction suggestions using ingredients you already have\n- Family collaboration features\n\nResearch potential competitors and create mockups next week.",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Ideas')!, tags.find(t => t.name === 'Project')!],
    connections: [],
    mentions: []
  });
  
  notes.push({
    id: noteIds[13],
    title: "Browser Extension Idea",
    content: "# Browser Extension: Knowledge Clipper\n\n## Functionality\n- Highlight and save text from any webpage\n- Automatically categorize and tag saved content\n- Extract key insights using NLP\n- Generate flashcards for learning\n\n## Technical Requirements\n- Browser API compatibility (Chrome, Firefox, Edge)\n- Backend for processing and storage\n- User authentication\n- Offline capabilities\n\nPossible connection with [[Second Brain Methodology]]",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Ideas')!, tags.find(t => t.name === 'Project')!],
    connections: [],
    mentions: []
  });
  
  notes.push({
    id: noteIds[14],
    title: "Second Brain Methodology",
    content: "# Building a Second Brain Methodology\n\n## PARA Method\n- Projects: Active projects you're working on\n- Areas: Ongoing responsibilities\n- Resources: Topics of interest\n- Archives: Inactive items\n\n## CODE Method\n- Capture: Save interesting information\n- Organize: Sort into PARA categories\n- Distill: Extract the key points\n- Express: Create something with the information\n\nImplement these principles in my note-taking system. This relates to the [[Browser Extension Idea]] for capturing information.",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Research')!, tags.find(t => t.name === 'Personal')!],
    connections: [noteIds[13]],
    mentions: [noteIds[13]]
  });
  
  // Work meeting notes
  notes.push({
    id: noteIds[15],
    title: "UX Feedback Session",
    content: "# UX Feedback Session\n\n## User Testing Results\n- Navigation: Users struggled with finding the settings menu\n- Onboarding: First-time user experience needs improvement\n- Mobile: Touch targets too small on certain screens\n\n## Action Items\n1. Redesign navigation panel (Assigned: Sarah)\n2. Create onboarding tutorial sequence (Assigned: Michael)\n3. Audit all mobile interfaces for accessibility (Assigned: Tyler)\n\nDeadline for initial mockups: August 15th\nConnect to [[Design System]] for UI consistency.",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Work')!, tags.find(t => t.name === 'Meeting')!],
    connections: [noteIds[1]],
    mentions: [noteIds[1]]
  });
  
  // Recipe notes
  notes.push({
    id: noteIds[16],
    title: "Banana Bread Recipe",
    content: "# The Perfect Banana Bread\n\n## Ingredients\n- 3 ripe bananas, mashed\n- 1/3 cup melted butter\n- 1 teaspoon baking soda\n- Pinch of salt\n- 3/4 cup sugar\n- 1 large egg, beaten\n- 1 teaspoon vanilla extract\n- 1 1/2 cups all-purpose flour\n\n## Instructions\n1. Preheat oven to 350°F (175°C)\n2. Mix mashed bananas and melted butter\n3. Mix in baking soda and salt\n4. Stir in sugar, beaten egg, and vanilla\n5. Mix in flour\n6. Pour into greased loaf pan\n7. Bake for 50-60 minutes\n\nVariation: Add chocolate chips or walnuts for extra flavor.",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Recipe')!, tags.find(t => t.name === 'Personal')!],
    connections: [],
    mentions: []
  });
  
  notes.push({
    id: noteIds[17],
    title: "Overnight Oats",
    content: "# Overnight Oats Base Recipe\n\n## Ingredients (per serving)\n- 1/2 cup rolled oats\n- 1/2 cup milk (any kind)\n- 1/4 cup yogurt (optional)\n- 1 tablespoon chia seeds\n- 1 tablespoon sweetener (honey, maple syrup)\n- Pinch of salt\n\n## Instructions\n1. Combine all ingredients in a jar or container\n2. Stir well until combined\n3. Cover and refrigerate overnight (at least 4 hours)\n4. Add toppings before serving\n\n## Flavor Combinations\n- Banana + peanut butter + chocolate chips\n- Berries + vanilla + almonds\n- Apple + cinnamon + walnuts\n- Pumpkin purée + pumpkin spice + pecans",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Recipe')!, tags.find(t => t.name === 'Personal')!],
    connections: [],
    mentions: []
  });
  
  // Course notes
  notes.push({
    id: noteIds[18],
    title: "TypeScript Advanced Types",
    content: "# TypeScript Advanced Types\n\n## Union and Intersection Types\n```typescript\ntype Admin = { id: string, role: 'admin' };\ntype User = { id: string, email: string };\n\ntype Person = Admin | User; // Union type\ntype SuperAdmin = Admin & { permissions: string[] }; // Intersection type\n```\n\n## Generics\n```typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\nconst value = identity<string>('hello');\n```\n\n## Utility Types\n- `Partial<T>`: Makes all properties optional\n- `Required<T>`: Makes all properties required\n- `Pick<T, K>`: Picks selected properties\n- `Omit<T, K>`: Removes selected properties\n\nConnect to my [[Personal Development Plan]]",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Course')!, tags.find(t => t.name === 'Work')!],
    connections: [noteIds[10]],
    mentions: [noteIds[10]]
  });
  
  // Create 80+ additional demo notes with various content
  const topics = [
    { title: "Morning Routine Ideas", 
      content: "# Optimal Morning Routine\n\n1. Wake up at 6:00 AM\n2. Drink a full glass of water\n3. 10 minutes meditation\n4. 20 minutes light exercise\n5. Healthy breakfast\n6. 30 minutes reading\n7. Plan the day ahead\n\nTry this for 30 days and track progress in my [[Personal Development Plan]].",
      contentType: "text",
      tags: [tags.find(t => t.name === 'Personal')!, tags.find(t => t.name === 'Health')!]
    },
    { title: "Workout Plan", 
      content: "# Weekly Workout Schedule\n\n## Monday: Upper Body\n- Bench press: 3 sets x 8 reps\n- Rows: 3 sets x 10 reps\n- Shoulder press: 3 sets x 8 reps\n- Pull-ups: 3 sets to failure\n\n## Wednesday: Lower Body\n- Squats: 3 sets x 8 reps\n- Deadlifts: 3 sets x 6 reps\n- Lunges: 3 sets x 10 reps per leg\n- Calf raises: 3 sets x 15 reps\n\n## Friday: Full Body\n- Kettlebell swings: 3 sets x 15 reps\n- Push-ups: 3 sets to failure\n- Bodyweight squats: 3 sets x 20 reps\n- Plank: 3 sets x 1 minute\n\nTrack progress in fitness journal.",
      contentType: "text",
      tags: [tags.find(t => t.name === 'Personal')!, tags.find(t => t.name === 'Health')!]
    },
    { title: "React Performance Optimization", 
      content: "# React Performance Optimization Techniques\n\n## Component Optimization\n- Use React.memo for pure functional components\n- Implement shouldComponentUpdate for class components\n- Utilize useMemo and useCallback hooks\n\n## State Management\n- Use context API efficiently\n- Consider state colocation\n- Avoid unnecessary rerenders with proper state structure\n\n## Code Splitting\n- Implement lazy loading with Suspense\n- Use dynamic imports for routes\n- Split large bundles into smaller chunks\n\nApply these techniques to our current project. Reference [[Product Roadmap]] for implementation timeline.",
      contentType: "text",
      tags: [tags.find(t => t.name === 'Work')!, tags.find(t => t.name === 'Research')!]
    },
    { title: "Meditation Techniques", 
      content: "# Effective Meditation Techniques\n\n## Mindfulness Meditation\n- Focus on breath\n- Observe thoughts without judgment\n- Start with 5 minutes, gradually increase\n\n## Body Scan\n- Progressive relaxation from head to toe\n- Notice sensations and tension\n- Good for stress reduction\n\n## Loving-Kindness Meditation\n- Direct positive wishes to self and others\n- Cultivate feelings of compassion\n- Improves emotional well-being\n\nIncorporate into my [[Morning Routine Ideas]] for at least 10 minutes daily.",
      contentType: "text",
      tags: [tags.find(t => t.name === 'Personal')!, tags.find(t => t.name === 'Health')!]
    },
    { title: "Gardening Notes", 
      content: "# Vegetable Garden Planning\n\n## Spring Planting (March-May)\n- Lettuce, spinach, peas\n- Radishes, carrots, beets\n- Broccoli, cauliflower\n\n## Summer Planting (June-August)\n- Tomatoes, peppers, eggplant\n- Cucumbers, zucchini, squash\n- Beans, corn\n\n## Fall Planting (September-October)\n- Kale, Swiss chard, arugula\n- Garlic, onions\n- Cover crops\n\nConsider companion planting: tomatoes with basil, carrots with onions, beans with corn.",
      contentType: "text",
      tags: [tags.find(t => t.name === 'Personal')!]
    },
    { title: "Database Design Principles", 
      content: "# Database Design Best Practices\n\n## Normalization\n- First Normal Form (1NF): No repeating groups\n- Second Normal Form (2NF): No partial dependencies\n- Third Normal Form (3NF): No transitive dependencies\n\n## Indexing Strategy\n- Index primary and foreign keys\n- Index frequently queried columns\n- Avoid over-indexing (affects writes)\n\n## Schema Design\n- Use appropriate data types\n- Implement constraints\n- Consider denormalization for read-heavy operations\n\nApply these principles to our upcoming database refactoring mentioned in the [[Product Roadmap]].",
      contentType: "text",
      tags: [tags.find(t => t.name === 'Work')!, tags.find(t => t.name === 'Research')!]
    },
    { title: "User Onboarding Flow", 
      content: "# User Onboarding Redesign\n\n## Current Issues\n- Too many steps (currently 7)\n- High drop-off at account creation\n- Confusing navigation\n\n## Proposed Solution\n1. Simplify to 3-4 key steps\n2. Allow \"try before signup\" option\n3. Progressive disclosure of features\n4. Personalized experience based on user role\n\n## Success Metrics\n- Increase completion rate by 25%\n- Reduce time-to-value by 40%\n- Improve 7-day retention by 15%\n\nPresent this proposal at next [[UX Feedback Session]].",
      contentType: "text",
      tags: [tags.find(t => t.name === 'Work')!, tags.find(t => t.name === 'Project')!]
    },
    { title: "Travel Bucket List", 
      content: "# Places to Visit\n\n## Europe\n- Iceland: Northern Lights, Blue Lagoon\n- Italy: Rome, Florence, Venice\n- Switzerland: Alps, Lake Geneva\n\n## Asia\n- Japan: Tokyo, Kyoto, Osaka\n- Thailand: Bangkok, Chiang Mai, islands\n- Vietnam: Hanoi, Ha Long Bay, Ho Chi Minh City\n\n## Americas\n- Peru: Machu Picchu, Lima\n- Canada: Banff, Toronto, Montreal\n- Argentina: Buenos Aires, Patagonia\n\nStart planning Japan trip for cherry blossom season next spring.",
      contentType: "text",
      tags: [tags.find(t => t.name === 'Personal')!]
    },
    { title: "CSS Grid Cheatsheet", 
      content: "# CSS Grid Quick Reference\n\n## Container Properties\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-template-rows: auto 1fr auto;\n  gap: 10px;\n  grid-template-areas:\n    \"header header header\"\n    \"sidebar main main\"\n    \"footer footer footer\";\n}\n```\n\n## Item Properties\n```css\n.item {\n  grid-column: 1 / 3; /* start / end */\n  grid-row: 2 / 4; /* start / end */\n  grid-area: main; /* named area */\n}\n```\n\n## Alignment\n```css\n.container {\n  justify-items: center; /* horizontal alignment of items */\n  align-items: center; /* vertical alignment of items */\n  justify-content: space-between; /* horizontal alignment of grid */\n  align-content: space-between; /* vertical alignment of grid */\n}\n```\n\nReference for our [[Design System]] implementation.",
      contentType: "text",
      tags: [tags.find(t => t.name === 'Work')!, tags.find(t => t.name === 'Research')!]
    },
    { title: "Pasta Carbonara Recipe", 
      content: "# Authentic Pasta Carbonara\n\n## Ingredients (serves 2)\n- 200g spaghetti or bucatini\n- 100g pancetta or guanciale, diced\n- 2 large eggs\n- 50g Pecorino Romano, grated\n- 30g Parmigiano Reggiano, grated\n- Freshly ground black pepper\n- Salt for pasta water\n\n## Instructions\n1. Bring salted water to boil, cook pasta al dente\n2. While pasta cooks, fry pancetta until crispy\n3. In a bowl, whisk eggs and cheeses with black pepper\n4. Reserve 1/2 cup pasta water, then drain pasta\n5. Working quickly, toss hot pasta with pancetta\n6. Off heat, add egg mixture, tossing constantly\n7. Add pasta water as needed for creamy consistency\n8. Serve immediately with more cheese and pepper\n\nKey: Never let eggs scramble - remove from heat before adding!",
      contentType: "text",
      tags: [tags.find(t => t.name === 'Recipe')!, tags.find(t => t.name === 'Personal')!]
    }
  ];
  
  // Generate more notes from topics
  for (let i = 0; i < topics.length; i++) {
    const topicIndex = i % topics.length;
    const noteId = noteIds[19 + i];
    const topic = topics[topicIndex];
    
    // Add random connections and mentions
    const connections: string[] = [];
    const mentions: string[] = [];
    
    // Randomly connect to existing notes
    if (Math.random() > 0.7) {
      const randomNoteId = noteIds[Math.floor(Math.random() * 19)];
      connections.push(randomNoteId);
    }
    
    // Create the note
    notes.push({
      id: noteId,
      title: `${topic.title} ${i > topics.length ? i - topics.length + 1 : ''}`.trim(),
      content: topic.content,
      contentType: topic.contentType as 'text' | 'image' | 'link' | 'audio' | 'video',
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
      tags: topic.tags,
      connections,
      mentions
    });
  }
  
  // Add some image and link type notes
  notes.push({
    id: noteIds[90],
    title: "Product Design Inspiration",
    content: "# Design Inspiration Resources\n\nCollecting UI design patterns for our next product iteration.\n\n![Design Mockup](https://images.unsplash.com/photo-1581091226825-a6a2a5aee158)",
    contentType: "image",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Work')!, tags.find(t => t.name === 'Research')!],
    connections: [noteIds[1]],
    mentions: [],
    mediaUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
  });
  
  notes.push({
    id: noteIds[91],
    title: "Coding Tutorial Series",
    content: "# Recommended JavaScript Tutorial\n\nExcellent resource for advanced JS concepts and patterns.\n\nLink: https://javascript.info/",
    contentType: "link",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Work')!, tags.find(t => t.name === 'Course')!],
    connections: [],
    mentions: [],
    source: "https://javascript.info/"
  });
  
  notes.push({
    id: noteIds[92],
    title: "Home Office Setup",
    content: "# My Productive Workspace\n\nFinally organized my home office for maximum productivity.\n\n![Office Setup](https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d)",
    contentType: "image",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Personal')!],
    connections: [],
    mentions: [],
    mediaUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
  });
  
  // Add a few more with interesting connections
  notes.push({
    id: noteIds[93],
    title: "Knowledge Management Framework",
    content: "# Personal Knowledge Management System\n\n## Capture\n- Use quick entry tools for ideas on the go\n- Save articles with browser extension\n- Voice notes for spoken ideas\n\n## Process\n- Regular review of captured items\n- Summarize and extract key points\n- Connect to existing knowledge\n\n## Organize\n- Use [[Second Brain Methodology]] with PARA system\n- Tag by project, area, and concept\n- Maintain bidirectional links\n\n## Use\n- Weekly review of important notes\n- Project-specific knowledge bases\n- Share insights through newsletter\n\nImplement this framework with our note-taking application.",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Personal')!, tags.find(t => t.name === 'Research')!],
    connections: [noteIds[14], noteIds[13]],
    mentions: [noteIds[14]]
  });
  
  notes.push({
    id: noteIds[94],
    title: "Team Communication Guidelines",
    content: "# Communication Best Practices\n\n## Channels\n- Slack: Quick questions and updates\n- Email: Formal communications and external contacts\n- Meetings: Complex discussions and decisions\n- Documents: Long-form information and reference\n\n## Expectations\n- Response times: 4 hours for Slack, 24 hours for email\n- Meeting agendas shared 24 hours in advance\n- Decisions documented and shared\n- Status updates on [[Project Kickoff Meeting]] items every Tuesday\n\n## Documentation\n- Meeting notes in shared workspace\n- Decision log maintained for all projects\n- Central knowledge repository updated weekly\n\nReview in next [[Quarterly Strategy Review]]",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Work')!],
    connections: [noteIds[0], noteIds[2]],
    mentions: [noteIds[0], noteIds[2]]
  });
  
  notes.push({
    id: noteIds[95],
    title: "Programming Language Comparison",
    content: "# Comparing Programming Languages\n\n## JavaScript/TypeScript\n- Pros: Ubiquitous, versatile, large ecosystem\n- Cons: Historical quirks, type safety issues (TS helps)\n- Best for: Web development, full-stack applications\n\n## Python\n- Pros: Readable, extensive libraries, great for beginners\n- Cons: Performance, GIL limitations, packaging\n- Best for: Data science, scripting, prototyping\n\n## Rust\n- Pros: Memory safety, performance, modern design\n- Cons: Steep learning curve, compile times, ecosystem maturity\n- Best for: Systems programming, performance-critical applications\n\n## Go\n- Pros: Simplicity, concurrency, fast compilation\n- Cons: Verbose error handling, limited generics\n- Best for: Microservices, networked applications\n\nConsider Rust for our performance-critical components mentioned in [[Product Roadmap]].",
    contentType: "text",
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    tags: [tags.find(t => t.name === 'Work')!, tags.find(t => t.name === 'Research')!],
    connections: [noteIds[3]],
    mentions: [noteIds[3]]
  });
  
  return notes;
};

// Function to load demo notes into the application
export const loadDemoData = (addNoteFn: Function, addTagFn: Function, existingTags: Tag[]) => {
  // First, add the tags if they don't exist
  const existingTagNames = existingTags.map(t => t.name);
  const tagsToAdd = demoTags.filter(tag => !existingTagNames.includes(tag.name));
  
  const addedTagsMap = new Map<string, string>();
  tagsToAdd.forEach(tag => {
    const newTagId = addTagFn({ name: tag.name, color: tag.color });
    addedTagsMap.set(tag.id, newTagId);
  });
  
  // Combine existing and newly added tags
  const allTags = [
    ...existingTags,
    ...tagsToAdd.map(tag => ({
      ...tag,
      id: addedTagsMap.get(tag.id) || tag.id
    }))
  ];
  
  // Generate demo notes
  const demoNotes = generateDemoNotes(allTags);
  
  // Add demo notes to the application
  demoNotes.forEach(note => {
    // Need to map tag IDs if they were changed
    const mappedTags = note.tags.map(tag => {
      const newId = addedTagsMap.get(tag.id);
      return newId ? { ...tag, id: newId } : tag;
    });
    
    // Add the note
    addNoteFn({
      title: note.title,
      content: note.content,
      contentType: note.contentType,
      tags: mappedTags,
      source: note.source,
      mediaUrl: note.mediaUrl,
      location: note.location
    });
  });
  
  return demoNotes.length;
};
