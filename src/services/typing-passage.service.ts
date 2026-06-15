import typingPassages from '../data/typing-passages.json';

export interface TypingPassage {
  id: string;
  category: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
}

export const typingPassageService = {
  /**
   * Get all typing passages
   */
  async getAllPassages(): Promise<TypingPassage[]> {
    return typingPassages as TypingPassage[];
  },

  /**
   * Get a random typing passage, optionally filtered by difficulty
   */
  async getRandomPassage(difficulty?: 'easy' | 'medium' | 'hard'): Promise<TypingPassage> {
    let filtered = typingPassages as TypingPassage[];
    if (difficulty) {
      filtered = filtered.filter(p => p.difficulty === difficulty);
    }
    
    if (filtered.length === 0) {
      filtered = typingPassages as TypingPassage[]; // fallback
    }
    
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  },

  /**
   * Get a passage by ID
   */
  async getPassageById(id: string): Promise<TypingPassage | undefined> {
    return (typingPassages as TypingPassage[]).find(p => p.id === id);
  }
};
