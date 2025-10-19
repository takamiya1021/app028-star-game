interface QuizChoicesProps {
  choices: string[];
  disabled?: boolean;
  selected?: string | null;
  onSelect: (choice: string) => void;
}

export function QuizChoices({
  choices,
  disabled = false,
  selected = null,
  onSelect,
}: QuizChoicesProps) {
  return (
    <div className="grid gap-3">
      {choices.map((choice) => {
        const isSelected = selected === choice;
        return (
          <button
            key={choice}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(choice)}
            className={`rounded-md border px-4 py-2 text-left transition ${
              isSelected
                ? 'border-blue-400 bg-blue-500/20 text-white'
                : 'border-white/20 bg-white/5 text-white hover:border-blue-300 hover:bg-blue-400/10'
            } ${disabled ? 'opacity-60' : ''}`}
            data-testid={`choice-${choice}`}
          >
            {choice}
          </button>
        );
      })}
    </div>
  );
}

export default QuizChoices;
