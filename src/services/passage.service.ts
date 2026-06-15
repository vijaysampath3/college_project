import { supabase } from '../lib/supabase';
import passagesData from '../data/reading-passages.json';

export interface ComprehensionQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ReadingPassage {
  id: string;
  category: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  wordCount: number;
  expectedReadingTime: number;
  targetWPM: number;
  text: string;
  comprehensionQuestions: ComprehensionQuestion[];
}

class PassageService {
  private passages: ReadingPassage[] = passagesData as ReadingPassage[];

  /**
   * Fetches a passage by ID
   */
  getPassageById(id: string): ReadingPassage | undefined {
    return this.passages.find(p => p.id === id);
  }

  /**
   * Fetches all passages for a specific category
   */
  getPassagesByCategory(category: string): ReadingPassage[] {
    return this.passages.filter(p => p.category === category);
  }

  /**
   * Gets the list of passage IDs a student has already used
   */
  async getStudentPassageHistory(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('student_passage_history')
      .select('passage_id')
      .eq('student_id', userId);

    if (error) throw error;
    return data.map(row => row.passage_id);
  }

  /**
   * Marks a passage as used by a student in the database
   */
  async savePassageUsage(userId: string, passageId: string, category: string) {
    const { error } = await supabase
      .from('student_passage_history')
      .insert({
        student_id: userId,
        passage_id: passageId,
        category: category
      });

    // If it violates unique constraint because it was already used, that's fine
    if (error && error.code !== '23505') {
      throw error;
    }
  }

  /**
   * Selects a random unused passage, prioritizing the least used category
   */
  async getRandomPassage(userId: string): Promise<ReadingPassage> {
    const usedIds = await this.getStudentPassageHistory(userId);
    
    // If all passages are used, fallback to least recently used by clearing our local filter memory 
    // or just doing a full random. For simplicity, if they used all 25, we'll reset.
    let availablePassages = this.passages.filter(p => !usedIds.includes(p.id));

    if (availablePassages.length === 0) {
      // Reset scenario: all 25 used.
      await this.resetPassagePool(userId);
      availablePassages = this.passages;
    }

    // Determine category usage count from usedIds to find the least used category
    const categoryUsage: Record<string, number> = {};
    const categories = ['technology', 'science', 'environment', 'education', 'innovation'];
    categories.forEach(c => categoryUsage[c] = 0);

    const usedPassages = this.passages.filter(p => usedIds.includes(p.id));
    usedPassages.forEach(p => {
      if (categoryUsage[p.category] !== undefined) {
        categoryUsage[p.category]++;
      }
    });

    // Find the minimum usage among categories that still have available passages
    const availableCategories = new Set(availablePassages.map(p => p.category));
    
    let minUsage = Infinity;
    let leastUsedCategories: string[] = [];

    availableCategories.forEach(cat => {
      const usage = categoryUsage[cat];
      if (usage < minUsage) {
        minUsage = usage;
        leastUsedCategories = [cat];
      } else if (usage === minUsage) {
        leastUsedCategories.push(cat);
      }
    });

    // Pick a random category from the least used ones
    const selectedCategory = leastUsedCategories[Math.floor(Math.random() * leastUsedCategories.length)];

    // Filter available passages to this category
    const finalCandidates = availablePassages.filter(p => p.category === selectedCategory);

    // Pick a random passage
    const selectedPassage = finalCandidates[Math.floor(Math.random() * finalCandidates.length)];
    
    return selectedPassage;
  }

  /**
   * Resets the passage pool for a student by deleting their history
   */
  async resetPassagePool(userId: string) {
    const { error } = await supabase
      .from('student_passage_history')
      .delete()
      .eq('student_id', userId);

    if (error) throw error;
  }
}

export const passageService = new PassageService();
