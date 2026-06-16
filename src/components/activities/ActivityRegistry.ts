import React from 'react';
import { GenericActivityPlayer } from './GenericActivityPlayer';

// In the future, you would import specific activities like:
// import { TimedReadingActivity } from './reading/TimedReadingActivity';
// import { VisualSearchActivity } from './attention/VisualSearchActivity';

export const ActivityRegistry: Record<string, React.FC<any>> = {
  // Reading
  timed_reading: GenericActivityPlayer,
  repeated_reading: GenericActivityPlayer,
  sight_words: GenericActivityPlayer,
  pronunciation: GenericActivityPlayer,
  advanced_reading: GenericActivityPlayer,

  // Comprehension
  main_idea: GenericActivityPlayer,
  inference: GenericActivityPlayer,
  vocab_match: GenericActivityPlayer,
  critical_thinking: GenericActivityPlayer,

  // Attention & Focus
  focus_sprint: GenericActivityPlayer,
  visual_search: GenericActivityPlayer,
  rapid_scan: GenericActivityPlayer,
  continuous_tracking: GenericActivityPlayer,

  // Typing
  typing_speed: GenericActivityPlayer,
  typing_accuracy: GenericActivityPlayer,
  typing_pattern: GenericActivityPlayer,

  // Behaviour
  goal_breakdown: GenericActivityPlayer,
  pattern_recognition: GenericActivityPlayer,
  persistence: GenericActivityPlayer,
};
