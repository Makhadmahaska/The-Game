import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AllUsersPage } from './pages/Alluserpage';
import { ChooseGamePage } from './pages/chooseGame';
import { RegistrationPage } from './pages/registerPage';
import { StatisticsPage } from './pages/statsPage';
import { TimerPage } from './pages/TimePage';
import { Game, User } from './types';

function getStored<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    getStored<User>('selectedUser')
  );
  const [selectedGame, setSelectedGame] = useState<Game | null>(() =>
    getStored<Game>('selectedGame')
  );

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('selectedUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedGame) {
      localStorage.setItem('selectedGame', JSON.stringify(selectedGame));
    }
  }, [selectedGame]);

  function handleUserSelected(user: User) {
    setCurrentUser(user);
    navigate('/statistics');
  }

  function handleGameSelected(game: Game) {
    setSelectedGame(game);
    navigate('/timer');
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route
        path="/users"
        element={<AllUsersPage onUserSelected={handleUserSelected} />}
      />
      <Route
        path="/choose-game"
        element={<ChooseGamePage onGameSelected={handleGameSelected} />}
      />
      <Route
        path="/timer"
        element={
          currentUser && selectedGame ? (
            <TimerPage
              currentUser={currentUser}
              selectedGame={selectedGame}
            />
          ) : (
            <Navigate to="/users" replace />
          )
        }
      />
      <Route
        path="/statistics"
        element={
          currentUser ? (
            <StatisticsPage currentUser={currentUser} />
          ) : (
            <Navigate to="/users" replace />
          )
        }
      />
    </Routes>
  );
}