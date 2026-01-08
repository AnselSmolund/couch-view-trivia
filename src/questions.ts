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
    name: "Round 1: Historic Climbs",
    questions: [
      { id: 1, text: "What climb is this?" },
      { id: 2, text: "How many hairpins are there on Alpe d'Huez?" },
      { id: 3, text: "What climb did tadej crack on [bonus point for stage]?", parts: 2, partLabels: ["Climb", "Stage"] },
      { id: 4, text: "What climb is this 13km // 9.7%?" },
      { id: 5, text: "Two descents [1 point for each]?", parts: 2, partLabels: ["Descent 1", "Descent 2"] }
    ]
  },
  {
    number: 2,
    name: "Round 2: Silhouette Celebrations",
    questions: [
      { id: 6, text: "Rider 1", parts: 2, partLabels: ["Who", "When"] },
      { id: 7, text: "Rider 2", parts: 2, partLabels: ["Who", "When"] },
      { id: 8, text: "Rider 3", parts: 2, partLabels: ["Who", "When"] },
      { id: 9, text: "Rider 4", parts: 2, partLabels: ["Who", "When"] },
      { id: 10, text: "Rider 5", parts: 2, partLabels: ["Who", "When"] },
    ]
  },
  {
    number: 3,
    name: "Round 3: Rider nicknames",
    questions: [
      { id: 11, text: "Who is LouLou?" },
      { id: 12, text: "Who is the Cannibal?" },
      { id: 13, text: "Who is the Pirate?" },
      { id: 14, text: "Who is the Badger?" },
      { id: 15, text: "Who is Il Campionissimo?" }
    ]
  },
  {
    number: 4,
    name: "Round 4: Match the prize with the race",
    questions: [
      { id: 16, text: "A Cobble Stone" },
      { id: 17, text: "A big beer" },
      { id: 18, text: "A trident" },
      { id: 19, text: "Salmon" },
      { id: 20, text: "Stuffed Toy Donkey" }
    ]
  },
  {
    number: 5,
    name: "Round 5: Cropped Bikes",
    questions: [
      { id: 21, text: "Pink Cervelo", parts: 2, partLabels: ["Who", "When"] },
      { id: 22, text: "Red Specialized", parts: 2, partLabels: ["Who", "When"] },
      { id: 23, text: "Gold TT Bike", parts: 2, partLabels: ["Who", "When"] },
      { id: 24, text: "Green Canyon", parts: 2, partLabels: ["Who", "When"] },
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
];

export const TOTAL_ROUNDS = rounds.length;
export const QUESTIONS_PER_ROUND = 5;