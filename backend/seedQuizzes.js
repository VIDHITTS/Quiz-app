const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/user");
const Quiz = require("./models/quiz");
const Attempt = require("./models/attempt");

const sampleQuizzes = [
  // QUIZ 1 - Basic Mathematics
  {
    title: "Basic Mathematics",
    description: "Test your fundamental math skills with derivatives, algebra, and calculus!",
    isPublic: true,
    questions: [
      {
        text: "What is the derivative of x³?",
        options: [
          { text: "2x", correct: false },
          { text: "3x²", correct: true },
          { text: "x²", correct: false },
          { text: "x³", correct: false },
        ],
      },
      {
        text: "What is 2 + 5 × 3?",
        options: [
          { text: "11", correct: false },
          { text: "15", correct: false },
          { text: "17", correct: true },
          { text: "21", correct: false },
        ],
      },
      {
        text: "What is ∫(1/x) dx?",
        options: [
          { text: "x", correct: false },
          { text: "ln|x| + C", correct: true },
          { text: "eˣ", correct: false },
          { text: "x²", correct: false },
        ],
      },
      {
        text: "What is the limit of sin(x)/x as x approaches 0?",
        options: [
          { text: "0", correct: false },
          { text: "1", correct: true },
          { text: "∞", correct: false },
          { text: "-1", correct: false },
        ],
      },
      {
        text: "What is 7 × 8?",
        options: [
          { text: "48", correct: false },
          { text: "54", correct: false },
          { text: "56", correct: true },
          { text: "64", correct: false },
        ],
      },
      {
        text: "Solve: 2x = 12",
        options: [
          { text: "4", correct: false },
          { text: "5", correct: false },
          { text: "6", correct: true },
          { text: "8", correct: false },
        ],
      },
      {
        text: "What is the square root of 144?",
        options: [
          { text: "10", correct: false },
          { text: "11", correct: false },
          { text: "12", correct: true },
          { text: "13", correct: false },
        ],
      },
      {
        text: "What is 3⁴?",
        options: [
          { text: "27", correct: false },
          { text: "81", correct: true },
          { text: "64", correct: false },
          { text: "256", correct: false },
        ],
      },
      {
        text: "What is 20% of 200?",
        options: [
          { text: "20", correct: false },
          { text: "30", correct: false },
          { text: "40", correct: true },
          { text: "60", correct: false },
        ],
      },
      {
        text: "What is the median of [1, 3, 5]?",
        options: [
          { text: "1", correct: false },
          { text: "3", correct: true },
          { text: "5", correct: false },
          { text: "None", correct: false },
        ],
      },
    ],
  },

  // QUIZ 2 - Advanced Mathematics
  {
    title: "Advanced Mathematics",
    description: "Challenge yourself with advanced calculus, trigonometry, and linear algebra!",
    isPublic: true,
    questions: [
      {
        text: "What is d/dx(eˣ)?",
        options: [
          { text: "eˣ", correct: true },
          { text: "x²", correct: false },
          { text: "1", correct: false },
          { text: "2ˣ", correct: false },
        ],
      },
      {
        text: "What is the integral of 2x?",
        options: [
          { text: "x", correct: false },
          { text: "x²", correct: false },
          { text: "x² + C", correct: true },
          { text: "x²/2", correct: false },
        ],
      },
      {
        text: "What is cos(0°)?",
        options: [
          { text: "0", correct: false },
          { text: "1", correct: true },
          { text: "-1", correct: false },
          { text: "Undefined", correct: false },
        ],
      },
      {
        text: "What is tan(45°)?",
        options: [
          { text: "0", correct: false },
          { text: "1", correct: true },
          { text: "√2", correct: false },
          { text: "∞", correct: false },
        ],
      },
      {
        text: "Solve: x² = 16. What is x?",
        options: [
          { text: "4", correct: false },
          { text: "-4", correct: false },
          { text: "±4", correct: true },
          { text: "None", correct: false },
        ],
      },
      {
        text: "What is log₁₀(100)?",
        options: [
          { text: "0", correct: false },
          { text: "1", correct: false },
          { text: "2", correct: true },
          { text: "3", correct: false },
        ],
      },
      {
        text: "What is the determinant of [[1,2],[3,4]]?",
        options: [
          { text: "-2", correct: true },
          { text: "2", correct: false },
          { text: "-5", correct: false },
          { text: "5", correct: false },
        ],
      },
      {
        text: "What is sin(90°)?",
        options: [
          { text: "0", correct: false },
          { text: "1", correct: true },
          { text: "√2/2", correct: false },
          { text: "Undefined", correct: false },
        ],
      },
      {
        text: "What is the limit of (1 + 1/n)ⁿ as n approaches infinity?",
        options: [
          { text: "1", correct: false },
          { text: "e", correct: true },
          { text: "∞", correct: false },
          { text: "0", correct: false },
        ],
      },
      {
        text: "If f(x) = x², what is f'(3)?",
        options: [
          { text: "3", correct: false },
          { text: "6", correct: true },
          { text: "9", correct: false },
          { text: "12", correct: false },
        ],
      },
    ],
  },

  // QUIZ 3 - AI Basics
  {
    title: "Artificial Intelligence Basics",
    description: "Explore fundamental concepts of AI, search algorithms, and intelligent agents!",
    isPublic: true,
    questions: [
      {
        text: "What does AI stand for?",
        options: [
          { text: "Automated Intelligence", correct: false },
          { text: "Artificial Intelligence", correct: true },
          { text: "Automated Information", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What type of search algorithm is BFS (Breadth-First Search)?",
        options: [
          { text: "Informed search", correct: false },
          { text: "Uninformed search", correct: true },
          { text: "Heuristic search", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does the Turing Test evaluate?",
        options: [
          { text: "Computer speed", correct: false },
          { text: "Machine intelligence", correct: true },
          { text: "Memory capacity", correct: false },
          { text: "Sound quality", correct: false },
        ],
      },
      {
        text: "What does a rational agent try to do?",
        options: [
          { text: "Act randomly", correct: false },
          { text: "Maximize performance measure", correct: true },
          { text: "Minimize utility", correct: false },
          { text: "Track time only", correct: false },
        ],
      },
      {
        text: "What does NLP stand for?",
        options: [
          { text: "Natural Language Processing", correct: true },
          { text: "New Logic Programming", correct: false },
          { text: "Neuro Programming", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does the A* algorithm use?",
        options: [
          { text: "Only cost", correct: false },
          { text: "Only heuristic", correct: false },
          { text: "Both cost and heuristic", correct: true },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does a knowledge base contain?",
        options: [
          { text: "Facts and rules", correct: true },
          { text: "Movies", correct: false },
          { text: "Music files", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does PEAS stand for in AI agent design?",
        options: [
          { text: "Performance, Environment, Actuators, Sensors", correct: true },
          { text: "Plan, Execute, Analyze, State", correct: false },
          { text: "Process, Evaluate, Act, Sense", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "Which of these are types of Machine Learning?",
        options: [
          { text: "Supervised only", correct: false },
          { text: "Unsupervised only", correct: false },
          { text: "Reinforcement only", correct: false },
          { text: "All of the above", correct: true },
        ],
      },
      {
        text: "What is GPU particularly good for in AI?",
        options: [
          { text: "Input/Output operations", correct: false },
          { text: "Parallel processing tasks", correct: true },
          { text: "Networking", correct: false },
          { text: "Database operations", correct: false },
        ],
      },
    ],
  },

  // QUIZ 4 - Machine Learning
  {
    title: "Machine Learning Fundamentals",
    description: "Master the basics of ML algorithms, training, and model evaluation!",
    isPublic: true,
    questions: [
      {
        text: "What does ML stand for?",
        options: [
          { text: "Machine Learning", correct: true },
          { text: "Main Logic", correct: false },
          { text: "Multi Layer", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does a machine learning model learn from?",
        options: [
          { text: "Food", correct: false },
          { text: "Data", correct: true },
          { text: "WiFi signals", correct: false },
          { text: "Games", correct: false },
        ],
      },
      {
        text: "What does regression predict?",
        options: [
          { text: "Category", correct: false },
          { text: "Continuous numerical value", correct: true },
          { text: "String", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does classification predict?",
        options: [
          { text: "Label or category", correct: true },
          { text: "Integer only", correct: false },
          { text: "Audio file", correct: false },
          { text: "Plot", correct: false },
        ],
      },
      {
        text: "What does overfitting mean?",
        options: [
          { text: "Model is undertrained", correct: false },
          { text: "Model fits training data too well", correct: true },
          { text: "Random predictions", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is a common train/test split ratio?",
        options: [
          { text: "70-30", correct: true },
          { text: "50-50", correct: false },
          { text: "100-0", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does a loss function measure?",
        options: [
          { text: "Time elapsed", correct: false },
          { text: "Prediction error", correct: true },
          { text: "Data size", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does Gradient Descent do?",
        options: [
          { text: "Goes uphill", correct: false },
          { text: "Goes downhill to minimize loss", correct: true },
          { text: "Stays constant", correct: false },
          { text: "Random movement", correct: false },
        ],
      },
      {
        text: "What does kNN stand for?",
        options: [
          { text: "K-Nearest Neighbors", correct: true },
          { text: "Kernel Neural Network", correct: false },
          { text: "K-Node Network", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does SVM use to classify data?",
        options: [
          { text: "Hyperplanes", correct: true },
          { text: "Decision trees", correct: false },
          { text: "Graphs", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
    ],
  },

  // QUIZ 5 - Deep Learning
  {
    title: "Deep Learning Essentials",
    description: "Dive into neural networks, CNNs, RNNs, and modern deep learning techniques!",
    isPublic: true,
    questions: [
      {
        text: "What does Deep Learning primarily use?",
        options: [
          { text: "Linear regression", correct: false },
          { text: "Neural Networks", correct: true },
          { text: "Sorting algorithms", correct: false },
          { text: "Graph algorithms", correct: false },
        ],
      },
      {
        text: "Which are common activation functions?",
        options: [
          { text: "Sigmoid", correct: false },
          { text: "ReLU", correct: false },
          { text: "Tanh", correct: false },
          { text: "All of the above", correct: true },
        ],
      },
      {
        text: "What is CNN primarily used for?",
        options: [
          { text: "Image processing", correct: true },
          { text: "Text only", correct: false },
          { text: "Audio only", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is RNN used for?",
        options: [
          { text: "Static data", correct: false },
          { text: "Sequential data", correct: true },
          { text: "Images only", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does backpropagation update?",
        options: [
          { text: "Weights", correct: true },
          { text: "Pixels", correct: false },
          { text: "Input data", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does softmax output represent?",
        options: [
          { text: "One-hot encoding", correct: false },
          { text: "Probability distribution", correct: true },
          { text: "Zero values", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is an epoch in training?",
        options: [
          { text: "One batch", correct: false },
          { text: "Full pass through training data", correct: true },
          { text: "Random step", correct: false },
          { text: "Half pass", correct: false },
        ],
      },
      {
        text: "What is dropout used for?",
        options: [
          { text: "Increase overfitting", correct: false },
          { text: "Prevent overfitting", correct: true },
          { text: "Delete data", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is batch size?",
        options: [
          { text: "Number of samples per batch", correct: true },
          { text: "Number of features", correct: false },
          { text: "Number of labels", correct: false },
          { text: "Number of epochs", correct: false },
        ],
      },
      {
        text: "Which are popular optimizers?",
        options: [
          { text: "Adam", correct: false },
          { text: "SGD", correct: false },
          { text: "RMSProp", correct: false },
          { text: "All of the above", correct: true },
        ],
      },
    ],
  },

  // QUIZ 6 - Data Science
  {
    title: "Data Science Fundamentals",
    description: "Learn about data analysis, statistics, and visualization techniques!",
    isPublic: true,
    questions: [
      {
        text: "What does EDA stand for?",
        options: [
          { text: "Electric Data Analysis", correct: false },
          { text: "Exploratory Data Analysis", correct: true },
          { text: "Edge Data Algorithm", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is an outlier?",
        options: [
          { text: "Normal value", correct: false },
          { text: "Far from other values", correct: true },
          { text: "Median value", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is the mean?",
        options: [
          { text: "Average", correct: true },
          { text: "Middle value", correct: false },
          { text: "Most frequent", correct: false },
          { text: "Largest value", correct: false },
        ],
      },
      {
        text: "What is the mode?",
        options: [
          { text: "Median", correct: false },
          { text: "Average", correct: false },
          { text: "Most frequent value", correct: true },
          { text: "Largest value", correct: false },
        ],
      },
      {
        text: "What does a histogram show?",
        options: [
          { text: "Frequency distribution", correct: true },
          { text: "Mean only", correct: false },
          { text: "Mode only", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does a scatter plot show?",
        options: [
          { text: "Relationship between variables", correct: true },
          { text: "Sum of values", correct: false },
          { text: "Matrix operations", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does 'null' mean in data?",
        options: [
          { text: "Zero", correct: false },
          { text: "Missing value", correct: true },
          { text: "Text", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does CSV stand for?",
        options: [
          { text: "Comma Separated Values", correct: true },
          { text: "Cloud Storage Vector", correct: false },
          { text: "Central System Value", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does standard deviation measure?",
        options: [
          { text: "Spread of data", correct: true },
          { text: "Central tendency", correct: false },
          { text: "Label", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does correlation indicate?",
        options: [
          { text: "Relationship strength", correct: true },
          { text: "Division", correct: false },
          { text: "Multiplication", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
    ],
  },

  // QUIZ 7 - Probability
  {
    title: "Probability & Statistics",
    description: "Test your understanding of probability theory and statistical concepts!",
    isPublic: true,
    questions: [
      {
        text: "What is the probability of getting heads on a fair coin?",
        options: [
          { text: "0", correct: false },
          { text: "0.5", correct: true },
          { text: "1", correct: false },
          { text: "2", correct: false },
        ],
      },
      {
        text: "What must the sum of all probabilities equal?",
        options: [
          { text: "0", correct: false },
          { text: "1", correct: true },
          { text: "2", correct: false },
          { text: "∞", correct: false },
        ],
      },
      {
        text: "What is conditional probability?",
        options: [
          { text: "P(A)", correct: false },
          { text: "P(A|B) - probability of A given B", correct: true },
          { text: "P(B|A)", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does Bayes' rule combine?",
        options: [
          { text: "Posterior and prior probabilities", correct: true },
          { text: "Only prior", correct: false },
          { text: "Only likelihood", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is the expected value of a fair six-sided die?",
        options: [
          { text: "2", correct: false },
          { text: "3.5", correct: true },
          { text: "4", correct: false },
          { text: "5", correct: false },
        ],
      },
      {
        text: "What does low variance indicate?",
        options: [
          { text: "High spread", correct: false },
          { text: "Low spread in data", correct: true },
          { text: "Random data", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What are independent events?",
        options: [
          { text: "A affects B", correct: false },
          { text: "A does not affect B", correct: true },
          { text: "Always equal", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is PDF used for?",
        options: [
          { text: "Discrete variables", correct: false },
          { text: "Continuous variables", correct: true },
          { text: "None", correct: false },
          { text: "Both", correct: false },
        ],
      },
      {
        text: "What is PMF used for?",
        options: [
          { text: "Continuous variables", correct: false },
          { text: "Discrete variables", correct: true },
          { text: "None", correct: false },
          { text: "Both", correct: false },
        ],
      },
      {
        text: "What is uniform probability?",
        options: [
          { text: "All outcomes equally likely", correct: true },
          { text: "Zero probability", correct: false },
          { text: "Infinite probability", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
    ],
  },

  // QUIZ 8 - Data Structures
  {
    title: "Data Structures",
    description: "Master fundamental data structures and their operations!",
    isPublic: true,
    questions: [
      {
        text: "What is a Stack?",
        options: [
          { text: "LIFO (Last In First Out)", correct: true },
          { text: "FIFO (First In First Out)", correct: false },
          { text: "Graph", correct: false },
          { text: "Tree", correct: false },
        ],
      },
      {
        text: "What is a Queue?",
        options: [
          { text: "LIFO", correct: false },
          { text: "FIFO (First In First Out)", correct: true },
          { text: "Graph", correct: false },
          { text: "Array", correct: false },
        ],
      },
      {
        text: "What is the average search time complexity in BST?",
        options: [
          { text: "O(1)", correct: false },
          { text: "O(log n)", correct: true },
          { text: "O(n)", correct: false },
          { text: "O(n²)", correct: false },
        ],
      },
      {
        text: "What is the average search time in a hash map?",
        options: [
          { text: "O(1)", correct: true },
          { text: "O(n)", correct: false },
          { text: "O(log n)", correct: false },
          { text: "O(n²)", correct: false },
        ],
      },
      {
        text: "What does DFS stand for?",
        options: [
          { text: "Depth-First Search", correct: true },
          { text: "Design-First Search", correct: false },
          { text: "Data-First Search", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does BFS stand for?",
        options: [
          { text: "Breadth-First Search", correct: true },
          { text: "Binary-First Search", correct: false },
          { text: "Block-First Search", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is the time complexity for random access in a linked list?",
        options: [
          { text: "O(1)", correct: false },
          { text: "O(n)", correct: true },
          { text: "O(log n)", correct: false },
          { text: "O(n²)", correct: false },
        ],
      },
      {
        text: "What is a heap typically used for?",
        options: [
          { text: "Finding max/min efficiently", correct: true },
          { text: "Graph traversal", correct: false },
          { text: "String sorting", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is a cycle in a graph?",
        options: [
          { text: "A loop or circular path", correct: true },
          { text: "A straight line", correct: false },
          { text: "A tree structure", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does a Trie typically store?",
        options: [
          { text: "Graphs", correct: false },
          { text: "Strings/Words", correct: true },
          { text: "Images", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
    ],
  },

  // QUIZ 9 - Algorithms
  {
    title: "Algorithm Analysis",
    description: "Understand sorting, searching, and graph algorithms with complexity analysis!",
    isPublic: true,
    questions: [
      {
        text: "What is the time complexity of Bubble Sort?",
        options: [
          { text: "O(n²)", correct: true },
          { text: "O(n)", correct: false },
          { text: "O(log n)", correct: false },
          { text: "O(n log n)", correct: false },
        ],
      },
      {
        text: "What is the average time complexity of Quick Sort?",
        options: [
          { text: "O(n)", correct: false },
          { text: "O(n log n)", correct: true },
          { text: "O(n²)", correct: false },
          { text: "O(log n)", correct: false },
        ],
      },
      {
        text: "What does Dijkstra's algorithm find?",
        options: [
          { text: "Minimum Spanning Tree", correct: false },
          { text: "Shortest path", correct: true },
          { text: "Longest path", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does Kruskal's algorithm find?",
        options: [
          { text: "Minimum Spanning Tree", correct: true },
          { text: "Sorting order", correct: false },
          { text: "Shortest path", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What technique does Dynamic Programming use?",
        options: [
          { text: "Memoization/memory", correct: true },
          { text: "No memory", correct: false },
          { text: "Graph traversal only", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does a greedy algorithm provide?",
        options: [
          { text: "Always optimal solution", correct: false },
          { text: "Locally optimal choice", correct: true },
          { text: "Random solution", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is the time complexity of Binary Search?",
        options: [
          { text: "O(log n)", correct: true },
          { text: "O(n)", correct: false },
          { text: "O(n²)", correct: false },
          { text: "O(1)", correct: false },
        ],
      },
      {
        text: "What does Merge Sort use?",
        options: [
          { text: "Divide", correct: false },
          { text: "Merge", correct: false },
          { text: "Both divide and merge", correct: true },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "Does BFS use a queue?",
        options: [
          { text: "Yes", correct: true },
          { text: "No", correct: false },
          { text: "Sometimes", correct: false },
          { text: "Never", correct: false },
        ],
      },
      {
        text: "Does DFS use a stack?",
        options: [
          { text: "Yes", correct: true },
          { text: "No", correct: false },
          { text: "Only for graphs", correct: false },
          { text: "Never", correct: false },
        ],
      },
    ],
  },

  // QUIZ 10 - Operating Systems
  {
    title: "Operating Systems",
    description: "Explore OS concepts including processes, scheduling, and memory management!",
    isPublic: true,
    questions: [
      {
        text: "What does OS stand for?",
        options: [
          { text: "Output System", correct: false },
          { text: "Operating System", correct: true },
          { text: "Option System", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does the kernel manage?",
        options: [
          { text: "Hardware resources", correct: true },
          { text: "Browser", correct: false },
          { text: "Video playback", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is a process?",
        options: [
          { text: "A program in execution", correct: true },
          { text: "A file", correct: false },
          { text: "An image", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is a thread?",
        options: [
          { text: "Lightweight process", correct: true },
          { text: "Heavy process", correct: false },
          { text: "A file", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "How many conditions are needed for deadlock?",
        options: [
          { text: "4 conditions", correct: true },
          { text: "2 conditions", correct: false },
          { text: "1 condition", correct: false },
          { text: "None", correct: false },
        ],
      },
      {
        text: "What does a scheduler do?",
        options: [
          { text: "Picks next process to run", correct: true },
          { text: "Manages files", correct: false },
          { text: "Allocates memory only", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does a semaphore prevent?",
        options: [
          { text: "Deadlock", correct: false },
          { text: "Race conditions", correct: true },
          { text: "Compilation errors", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does FCFS stand for?",
        options: [
          { text: "First-Come, First-Served", correct: true },
          { text: "Fast Call Function System", correct: false },
          { text: "File Control First System", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is priority scheduling based on?",
        options: [
          { text: "Process priority", correct: true },
          { text: "Random selection", correct: false },
          { text: "FIFO only", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does virtual memory use?",
        options: [
          { text: "RAM only", correct: false },
          { text: "Disk space as extended memory", correct: true },
          { text: "CPU cache", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
    ],
  },

  // QUIZ 11 - Computer Networks
  {
    title: "Computer Networks",
    description: "Learn about network protocols, layers, and communication standards!",
    isPublic: true,
    questions: [
      {
        text: "What does TCP stand for?",
        options: [
          { text: "Transmission Control Protocol", correct: true },
          { text: "Text Control Protocol", correct: false },
          { text: "Transfer Control Port", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "Is UDP reliable or unreliable?",
        options: [
          { text: "Reliable", correct: false },
          { text: "Unreliable", correct: true },
          { text: "Hardware-based", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does IP stand for?",
        options: [
          { text: "Internet Protocol", correct: true },
          { text: "Internal Port", correct: false },
          { text: "Interface Protocol", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What protocol does the ping command use?",
        options: [
          { text: "ICMP", correct: true },
          { text: "TCP", correct: false },
          { text: "UDP", correct: false },
          { text: "HTTP", correct: false },
        ],
      },
      {
        text: "What is the default port for HTTP?",
        options: [
          { text: "20", correct: false },
          { text: "21", correct: false },
          { text: "80", correct: true },
          { text: "443", correct: false },
        ],
      },
      {
        text: "What is the default port for HTTPS?",
        options: [
          { text: "80", correct: false },
          { text: "8080", correct: false },
          { text: "443", correct: true },
          { text: "25", correct: false },
        ],
      },
      {
        text: "What does DNS resolve?",
        options: [
          { text: "Domain name to IP address", correct: true },
          { text: "IP to MAC address", correct: false },
          { text: "Port numbers", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does a MAC address uniquely identify?",
        options: [
          { text: "Network switch", correct: false },
          { text: "Network device", correct: true },
          { text: "Operating system", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "At which OSI layer does a router operate?",
        options: [
          { text: "Layer 2 (Data Link)", correct: false },
          { text: "Layer 3 (Network)", correct: true },
          { text: "Layer 4 (Transport)", correct: false },
          { text: "Layer 7 (Application)", correct: false },
        ],
      },
      {
        text: "At which OSI layer does a switch operate?",
        options: [
          { text: "Layer 2 (Data Link)", correct: true },
          { text: "Layer 3 (Network)", correct: false },
          { text: "Layer 4 (Transport)", correct: false },
          { text: "Layer 7 (Application)", correct: false },
        ],
      },
    ],
  },

  // QUIZ 12 - Cloud Computing
  {
    title: "Cloud Computing",
    description: "Understand cloud services, deployment models, and popular platforms!",
    isPublic: true,
    questions: [
      {
        text: "What is cloud computing?",
        options: [
          { text: "Local computing", correct: false },
          { text: "Computing using remote servers", correct: true },
          { text: "Weather prediction", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does IaaS stand for?",
        options: [
          { text: "Infrastructure as a Service", correct: true },
          { text: "Intelligence as a Service", correct: false },
          { text: "Image as a Service", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does PaaS stand for?",
        options: [
          { text: "Platform as a Service", correct: true },
          { text: "Protocol as a Service", correct: false },
          { text: "Proxy as a Service", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does SaaS stand for?",
        options: [
          { text: "Software as a Service", correct: true },
          { text: "Server as a Service", correct: false },
          { text: "Storage as a Service", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does AWS stand for?",
        options: [
          { text: "Amazon Web Services", correct: true },
          { text: "Azure Web Services", correct: false },
          { text: "Automated Web System", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does VM stand for?",
        options: [
          { text: "Virtual Machine", correct: true },
          { text: "Video Module", correct: false },
          { text: "Variable Memory", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does scalability mean in cloud computing?",
        options: [
          { text: "Can only grow", correct: false },
          { text: "Can only shrink", correct: false },
          { text: "Can grow or shrink based on demand", correct: true },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does 'serverless' mean?",
        options: [
          { text: "No servers at all", correct: false },
          { text: "Servers are managed by cloud provider", correct: true },
          { text: "Only client-side code", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is AWS S3 used for?",
        options: [
          { text: "Object storage", correct: true },
          { text: "Compute only", correct: false },
          { text: "AI services", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is AWS Lambda?",
        options: [
          { text: "Serverless compute service", correct: true },
          { text: "Storage service", correct: false },
          { text: "Database service", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
    ],
  },

  // QUIZ 13 - SQL
  {
    title: "SQL Database Queries",
    description: "Master SQL syntax, queries, and database operations!",
    isPublic: true,
    questions: [
      {
        text: "What does SQL stand for?",
        options: [
          { text: "Structured Query Language", correct: true },
          { text: "Server Query Language", correct: false },
          { text: "System Query Language", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does SELECT retrieve?",
        options: [
          { text: "Only rows", correct: false },
          { text: "Only columns", correct: false },
          { text: "Both rows and columns", correct: true },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does COUNT(*) count?",
        options: [
          { text: "Only NULL values", correct: false },
          { text: "All rows", correct: true },
          { text: "Only non-NULL", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does PK stand for?",
        options: [
          { text: "Primary Key", correct: true },
          { text: "Public Key", correct: false },
          { text: "Private Key", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does FK stand for?",
        options: [
          { text: "Foreign Key", correct: true },
          { text: "Fake Key", correct: false },
          { text: "Function Key", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does ORDER BY do?",
        options: [
          { text: "Sorts rows", correct: true },
          { text: "Filters tables", correct: false },
          { text: "Groups columns", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does GROUP BY do?",
        options: [
          { text: "Groups rows", correct: true },
          { text: "Sorts columns", correct: false },
          { text: "Deletes rows", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does JOIN do?",
        options: [
          { text: "Combines tables", correct: true },
          { text: "Creates charts", correct: false },
          { text: "Generates forms", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does DELETE remove?",
        options: [
          { text: "Entire database", correct: false },
          { text: "Rows from a table", correct: true },
          { text: "Columns", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does UPDATE do?",
        options: [
          { text: "Modifies existing rows", correct: true },
          { text: "Deletes database", correct: false },
          { text: "Creates files", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
    ],
  },

  // QUIZ 14 - Object-Oriented Programming
  {
    title: "Object-Oriented Programming",
    description: "Learn OOP concepts including classes, inheritance, and polymorphism!",
    isPublic: true,
    questions: [
      {
        text: "What does OOP stand for?",
        options: [
          { text: "Object-Oriented Programming", correct: true },
          { text: "Open Object Programming", correct: false },
          { text: "Optimal Output Processing", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is a class?",
        options: [
          { text: "Blueprint for objects", correct: true },
          { text: "An instance", correct: false },
          { text: "A function", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is encapsulation?",
        options: [
          { text: "Hiding internal data", correct: true },
          { text: "Exposing all data", correct: false },
          { text: "Deleting data", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is inheritance?",
        options: [
          { text: "Code reuse from parent class", correct: true },
          { text: "Copying files", correct: false },
          { text: "Deleting classes", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is polymorphism?",
        options: [
          { text: "Objects taking many forms", correct: true },
          { text: "Single form only", correct: false },
          { text: "No forms", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is abstraction?",
        options: [
          { text: "Hiding implementation details", correct: true },
          { text: "Showing exact implementation", correct: false },
          { text: "Copying code", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is a constructor?",
        options: [
          { text: "Initializes objects", correct: true },
          { text: "Deletes objects", correct: false },
          { text: "Copies objects", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is method overloading?",
        options: [
          { text: "Same name, different parameters", correct: true },
          { text: "Same parameters always", correct: false },
          { text: "Different names", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is method overriding?",
        options: [
          { text: "Child class changes parent method", correct: true },
          { text: "Random changes", correct: false },
          { text: "Deletes methods", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is an object?",
        options: [
          { text: "Instance of a class", correct: true },
          { text: "A variable", correct: false },
          { text: "A function", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
    ],
  },

  // QUIZ 15 - Python Programming
  {
    title: "Python Programming",
    description: "Test your Python knowledge with syntax, data structures, and functions!",
    isPublic: false,
    questions: [
      {
        text: "What type of language is Python?",
        options: [
          { text: "Interpreted", correct: true },
          { text: "Compiled only", correct: false },
          { text: "Assembly", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "How is a list defined in Python?",
        options: [
          { text: "[ ]", correct: true },
          { text: "( )", correct: false },
          { text: "{ }", correct: false },
          { text: "<>", correct: false },
        ],
      },
      {
        text: "How is a tuple defined in Python?",
        options: [
          { text: "( )", correct: true },
          { text: "[ ]", correct: false },
          { text: "{ }", correct: false },
          { text: "<>", correct: false },
        ],
      },
      {
        text: "How is a dictionary defined in Python?",
        options: [
          { text: "{key: value}", correct: true },
          { text: "[ ]", correct: false },
          { text: "( )", correct: false },
          { text: "<>", correct: false },
        ],
      },
      {
        text: "What does len() return?",
        options: [
          { text: "Size/length", correct: true },
          { text: "Type", correct: false },
          { text: "Value", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does range(5) generate?",
        options: [
          { text: "0 to 4", correct: true },
          { text: "1 to 5", correct: false },
          { text: "5 to 10", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is 'import' used for?",
        options: [
          { text: "Load modules", correct: true },
          { text: "Delete files", correct: false },
          { text: "Sort data", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is a lambda function?",
        options: [
          { text: "Anonymous small function", correct: true },
          { text: "Data structure", correct: false },
          { text: "Loop", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What does a set remove automatically?",
        options: [
          { text: "Duplicates", correct: true },
          { text: "Spaces", correct: false },
          { text: "Numbers", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
      {
        text: "What is an exception?",
        options: [
          { text: "Error/abnormal condition", correct: true },
          { text: "A list", correct: false },
          { text: "A loop", correct: false },
          { text: "None of the above", correct: false },
        ],
      },
    ],
  },
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB\n");

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Quiz.deleteMany({});
    await Attempt.deleteMany({});
    console.log("✓ All existing data cleared\n");

    // Create demo user
    console.log("Creating demo user...");
    const hashedPassword = await bcrypt.hash("demo123", 10);
    const demoUser = await User.create({
      name: "Demo User",
      email: "demo@quiz.com",
      password: hashedPassword,
    });
    console.log("✓ Demo user created (email: demo@quiz.com, password: demo123)\n");

    // Create quizzes
    console.log("Creating quizzes...");
    let publicCount = 0;
    let privateCount = 0;
    
    for (const quizData of sampleQuizzes) {
      const quiz = await Quiz.create({
        ...quizData,
        createdBy: demoUser._id,
      });
      
      if (quiz.isPublic) {
        publicCount++;
        console.log(`✓ Created: "${quiz.title}" [PUBLIC]`);
      } else {
        privateCount++;
        console.log(`✓ Created: "${quiz.title}" [PRIVATE]`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ DATABASE SEEDED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   • Total Quizzes: ${sampleQuizzes.length}`);
    console.log(`   • Public Quizzes: ${publicCount}`);
    console.log(`   • Private Quizzes: ${privateCount}`);
    console.log(`   • Demo User: 1`);
    console.log(`\n🔐 Demo Login Credentials:`);
    console.log(`   Email: demo@quiz.com`);
    console.log(`   Password: demo123`);
    console.log(`\n🌍 Public quizzes are visible to all users!`);
    console.log(`🔒 Private quizzes are only visible to the creator.`);
    console.log("\n" + "=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
