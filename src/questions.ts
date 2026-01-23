export interface Question {
  id: number;
  text: string;
  parts?: number;
  partLabels?: string[];
}

export interface Round {
  number: number;
  name: string;
  questions: Question[];
}

export const rounds: Round[] = [
  {
    number: 1,
    name: "Round 1: Tour Down Under",
    questions: [
      { id: 1, text: "mascot" },
      { id: 2, text: "del toro" },
      { id: 3, text: "most wins" },
      { id: 4, text: "most team" },
      { id: 5, text: "stage wins" }
    ]
  },
  {
    number: 2,
    name: "Round 2: Silhouette celebrations",
    questions: [
      { id: 6, text: "question 1" },
      { id: 7, text: "question 2" },
      { id: 8, text: "question 3" },
      { id: 9, text: "question 4" },
      { id: 10, text: "question 5" }
    ]
  },
  {
    number: 3,
    name: "Round 3: TOUR DE FRANCE",
    questions: [
      { id: 11, text: "question 1" },
      { id: 12, text: "question 2" },
      { id: 13, text: "question 3" },
      { id: 14, text: "question 4" },
      { id: 15, text: "question 5" }
    ]
  },
  {
    number: 4,
    name: "Round 4: Historic climbs",
    questions: [
      { id: 16, text: "question 1" },
      { id: 17, text: "question 2" },
      { id: 18, text: "question 3" },
      { id: 19, text: "question 4" },
      { id: 20, text: "question 5" }
    ]
  },
  {
    number: 5,
    name: "Round 5: Match the prize with the race",
    questions: [
      { id: 21, text: "A Cobble Stone" },
      { id: 22, text: "A big beer" },
      { id: 23, text: "A trident" },
      { id: 24, text: "Salmon" },
      { id: 25, text: "Stuffed Toy Donkey" }
    ]
  },
  {
    number: 6,
    name: "Round 6: Cropped Bikes",
    questions: [
      { id: 26, text: "Pink Cervelo", parts: 2, partLabels: ["Who", "When"] },
      { id: 27, text: "Red Specialized", parts: 2, partLabels: ["Who", "When"] },
      { id: 28, text: "Gold TT Bike", parts: 2, partLabels: ["Who", "When"] },
      { id: 29, text: "Yellow Canyon", parts: 2, partLabels: ["Who", "When"] },
      { id: 30, text: "Black Colnago", parts: 2, partLabels: ["Who", "When"] },
    ]
  },
  {
    number: 7,
    name: "Round 7: Dogs of the peloton",
    questions: [
      { id: 31, text: "The Nut Sisters" },
      { id: 32, text: "Olive" },
      { id: 33, text: "Zoe" },
      { id: 34, text: "Bimba" },
      { id: 35, text: "Flo" }
    ]
  },
  {
    number: 8,
    name: "Round 8: JACYO",
    questions: [
      { id: 36, text: "question 1" },
      { id: 37, text: "question 2" },
      { id: 38, text: "questino 3" },
      { id: 39, text: "question 4" },
      { id: 40, text: "question 5" }
    ]
  },
  {
    number: 9,
    name: "Round 9: Nicknames",
    questions: [
      { id: 41, text: "question 1" },
      { id: 42, text: "question 2" },
      { id: 43, text: "questino 3" },
      { id: 44, text: "question 4" },
      { id: 45, text: "question 5" }
    ]
  },
  {
    number: 10,
    name: "tiebreaker",
    questions: [
      { id: 46, text: "question 1" },
    ]
  },
];

export const TOTAL_ROUNDS = rounds.length;
export const QUESTIONS_PER_ROUND = 5;