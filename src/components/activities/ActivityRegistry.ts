import React from 'react';
import { GenericActivityPlayer } from './GenericActivityPlayer';
import { GoalBreakdownActivity } from './behaviour/GoalBreakdownActivity';
import { ReadingFluencyActivity } from './reading/ReadingFluencyActivity';
import { VisualSearchActivity } from './attention/VisualSearchActivity';
import { TypingDrillActivity } from './typing/TypingDrillActivity';
import { PatternRecognitionActivity } from './behaviour/PatternRecognitionActivity';
import { SequenceMemoryActivity } from './memory/SequenceMemoryActivity';
import { RuleSwitchSortingActivity } from './executive/RuleSwitchActivity';

// Note: Unmapped activities will still fall back to GenericActivityPlayer or throw an error.
export const ActivityRegistry: Record<string, React.FC<any>> = {
  // Reading
  reading_fluency: ReadingFluencyActivity,
  timed_reading: ReadingFluencyActivity,
  repeated_reading: ReadingFluencyActivity,
  sight_words: ReadingFluencyActivity,
  pronunciation: ReadingFluencyActivity,
  advanced_reading: ReadingFluencyActivity,

  // Comprehension
  main_idea: ReadingFluencyActivity,
  inference: ReadingFluencyActivity,
  vocab_match: ReadingFluencyActivity,
  critical_thinking: ReadingFluencyActivity,

  // Attention & Focus
  focus_sprint: VisualSearchActivity,
  visual_search: VisualSearchActivity,
  rapid_scan: VisualSearchActivity,
  continuous_tracking: VisualSearchActivity,

  // Typing
  typing_speed: TypingDrillActivity,
  typing_accuracy: TypingDrillActivity,
  typing_pattern: TypingDrillActivity,

  // Behaviour, Memory, Executive Function
  goal_breakdown: GoalBreakdownActivity,
  pattern_recognition: PatternRecognitionActivity,
  persistence: PatternRecognitionActivity, // Can map to a dedicated one later
  sequence_memory: SequenceMemoryActivity,
  rule_switch: RuleSwitchSortingActivity,
};
