import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Game } from '../types';

type Props = {
  onGameSelected: (game: Game) => void;
};

export function ChooseGamePage({ onGameSelected }: Props) {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    api.getGames().then(setGames);
  }, []);

  return (
    <section className="card">
      <h2>Choose Game</h2>
      <div className="games-grid">
        {games.map((game) => (
          <button key={game.id} type="button" className="game-card" onClick={() => onGameSelected(game)}>
            <img src={game.imageUrl} alt={game.name} />
            <h3>{game.name}</h3>
          </button>
        ))}
      </div>
    </section>
  );
}
