import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { Game, User } from '../types';

type Props = {
  currentUser: User | null;
  selectedGame: Game | null;
};

export function TimerPage({ currentUser, selectedGame }: Props) {
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [sessionId]);

  const minutesForDisplay = useMemo(() => seconds, [seconds]);

  async function startTimer() {
    if (!currentUser || !selectedGame) {
      setMessage('Please select a user and a game first.');
      return;
    }

    if (sessionId) {
      setMessage('Timer is already running.');
      return;
    }

    const session = await api.startSession({ userId: currentUser.id, gameId: selectedGame.id });
    setSessionId(session.id);
    setSeconds(0);
    setMessage('Session started.');
  }

  async function stopTimer() {
    if (!sessionId) {
      setMessage('No active session to stop.');
      return;
    }

    await api.stopSession({ sessionId });
    setSessionId(null);
    setMessage('Session saved to database.');
  }

  async function exitAndSave() {
    if (sessionId) {
      await stopTimer();
    }
    setSeconds(0);
    setMessage('Exited timer.');
  }

  return (
    <section className="card">
      <h2>Game Timer</h2>
      <p>Testing rule: 1 second in timer = 1 minute of game time in UI.</p>

      <div className="timer-layout">
        <div>
          <p>
            User:{' '}
            {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'No user selected'}
          </p>
          <p>Game: {selectedGame ? selectedGame.name : 'No game selected'}</p>

          <div className="timer-box">{minutesForDisplay} min</div>

          <div className="button-row">
            <button type="button" onClick={startTimer}>
              Start
            </button>
            <button type="button" onClick={stopTimer}>
              Stop
            </button>
            <button type="button" onClick={exitAndSave}>
              Exit
            </button>
          </div>

          {message && <p className="success-text">{message}</p>}
        </div>

        {selectedGame && <img className="timer-image" src={selectedGame.imageUrl} alt={selectedGame.name} />}
      </div>
    </section>
  );
}
