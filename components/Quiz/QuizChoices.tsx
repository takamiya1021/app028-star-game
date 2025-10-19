import { memo } from 'react';
import { motion } from 'framer-motion';
import { StaggerContainer } from '@/components/Animate/StaggerContainer';

interface QuizChoicesProps {
  choices: string[];
  disabled?: boolean;
  selected?: string | null;
  onSelect: (choice: string) => void;
}

const choiceVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function QuizChoicesComponent({
  choices,
  disabled = false,
  selected = null,
  onSelect,
}: QuizChoicesProps) {
  return (
    <StaggerContainer className="grid gap-3">
      {choices.map((choice) => {
        const isSelected = selected === choice;
        return (
          <motion.button
            key={choice}
            type="button"
            variants={choiceVariants}
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            disabled={disabled}
            onClick={() => onSelect(choice)}
            className={`rounded-md border px-4 py-2 text-left transition ${
              isSelected
                ? 'border-blue-400 bg-blue-500/20 text-white'
                : 'border-white/20 bg-white/5 text-white hover:border-blue-300 hover:bg-blue-400/10'
            } ${disabled ? 'opacity-60' : ''}`}
            data-testid={`choice-${choice}`}
            data-motion="choice"
          >
            {choice}
          </motion.button>
        );
      })}
    </StaggerContainer>
  );
}

export const QuizChoices = memo(QuizChoicesComponent);

export default QuizChoices;
