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
    name: "Round 1: Tour De France",
    questions: [
      { id: 1, text: "question 1" },
      { id: 2, text: "question 2" },
      { id: 3, text: "question 3" },
      { id: 4, text: "question 4" },
      { id: 5, text: "question 5" },
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
    name: "Round 3: Historic Climbs",
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
    name: "Round 4: Match the prize with the race",
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
    name: "Round 5: Cropped Bikes",
    questions: [
      { id: 21, text: "Pink Cervelo", parts: 2, partLabels: ["Who", "When"] },
      { id: 22, text: "Red Specialized", parts: 2, partLabels: ["Who", "When"] },
      { id: 23, text: "Gold TT Bike", parts: 2, partLabels: ["Who", "When"] },
      { id: 24, text: "Yellow Canyon", parts: 2, partLabels: ["Who", "When"] },
      { id: 25, text: "Black Colnago", parts: 2, partLabels: ["Who", "When"] },
    ]
  },
  {
    number: 6,
    name: "Round 6: Dogs of the peloton",
    questions: [
      { id: 26, text: "The Nut Sisters" },
      { id: 27, text: "Olive" },
      { id: 28, text: "Zoe" },
      { id: 29, text: "Bimba" },
      { id: 30, text: "Flo" }
    ]
  },
  {
    number: 7,
    name: "tiebreaker",
    questions: [
      { id: 31, text: "question 1" },
    ]
  },
];

export const TOTAL_ROUNDS = rounds.length;
export const QUESTIONS_PER_ROUND = 5;