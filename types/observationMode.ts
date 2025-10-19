// 観測モードの型定義

export type ObservationMode = 'naked-eye' | 'telescope';

export const OBSERVATION_MODE_LABELS = {
  'naked-eye': '肉眼観測',
  'telescope': '高感度望遠鏡',
} as const;

export const OBSERVATION_MODE_DESCRIPTIONS = {
  'naked-eye': '7等星まで（肉眼で見える星）',
  'telescope': '9等星まで（望遠鏡で見える星・天の川）',
} as const;

export const OBSERVATION_MODE_ICONS = {
  'naked-eye': '👁️',
  'telescope': '🔭',
} as const;
