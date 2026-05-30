export type BossIdentityType =
  | "CEO"
  | "SKI"
  | "DIVER"
  | "PILOT"
  | "CHEF"
  | "EXPLORER"
  | "SPACE"
  | "TYCOON";

export interface Position {
  x: number;
  y: number;
}

export interface StoryOption {
  label: string;
  outcomeText: string;
  timeDelta: number;
  actionId: string;
  isEarlyEnd?: boolean;
  soundHint?: string;
}

export interface TriggerRules {
  mustInclude: string[];
  forbidInclude?: string[];
  requiredSequence?: string[];
}

export interface FixedEnding {
  endingId: string;
  title: string;
  description: string;
  priority: number;
  triggerRules: TriggerRules;
}

export interface StoryStep {
  id: string;
  text: string;
  options: StoryOption[];
  allowsFreeInput?: boolean;
}

export interface NPC {
  id: string;
  name: string;
  sprite: string;
  x: number;
  y: number;
  dialogue: string;
  storyline?: StoryStep[];
}

export interface Item {
  id: string;
  name: string;
  sprite: string;
  x: number;
  y: number;
  description: string;
  storyline?: StoryStep[];
}

export interface MapLayout {
  width: number;
  height: number;
  tiles: string[][];
}

export interface WorldScenario {
  identity: string;
  identityType: BossIdentityType;
  theme: string;
  mapLayout: MapLayout;
  playerPosition: Position;
  npcs: NPC[];
  items: Item[];
  introText: string;
  ambientMusic: string;
  fixedEndings?: FixedEnding[];
  isFallback?: boolean;
}

export interface InteractionChoice {
  label: string;
  action: string;
}

export interface InteractionResult {
  text: string;
  options: InteractionChoice[];
  allowsFreeInput: boolean;
  soundHint: string;
  timeDelta: number;
  isEarlyEnd: boolean;
  isFallback?: boolean;
}

export interface EndingResult {
  id: string;
  title: string;
  rank: string;
  endingText: string;
  achievements: string[];
  stats: {
    wealthWasted: string;
    butterflyEffectIndex: string;
    insanityLevel: string;
  };
  isFallback?: boolean;
}

export interface SavedLife {
  id: string;
  title: string;
  identityName: string;
  identityType: BossIdentityType;
  theme: string;
  rank: string;
  endingText: string;
  achievements: string[];
  stats: {
    wealthWasted: string;
    butterflyEffectIndex: string;
    insanityLevel: string;
  };
  timestamp: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  identityType: BossIdentityType;
  identityName: string;
  customPrompt: string;
  description: string;
  dateString: string;
}
