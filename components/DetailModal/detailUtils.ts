import type { Star } from '@/types/star';

export function getStarDisplayName(star?: Star | null) {
  if (!star) return undefined;
  if (star.properName && star.properName.trim().length > 0) {
    return star.properName;
  }
  if (star.name && star.name.trim().length > 0) {
    return star.name;
  }
  return `HIP ${star.id}`;
}

