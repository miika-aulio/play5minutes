import type { Choice } from '../gameData';

interface Props {
  thought: string | null;
  choices: Choice[] | null;
  waitingChoice: boolean;
  onChoose: (choice: Choice) => void;
}

export default function Monologue({
  thought,
  choices,
  waitingChoice,
  onChoose,
}: Props) {
  return (
    <div className="grilled-monologue">
      <p className="grilled-thought" key={thought ?? 'empty'}>
        {thought ?? ''}
      </p>

      <div className="grilled-choices">
        {choices?.map((choice, i) => (
          <button
            key={`${thought}-${i}`}
            className="grilled-choice"
            style={{ ['--d' as string]: `${i * 120 + 600}ms` }}
            onClick={() => onChoose(choice)}
            disabled={!waitingChoice}
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
}
