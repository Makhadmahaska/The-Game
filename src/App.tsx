import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AllUsersPage } from './pages/Alluserpage';
import { ChooseGamePage } from './pages/chooseGamePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { TimerPage } from './pages/TimerPage';
import { Game, User } from './lib/types';

function getStored<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export default function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStored<User>('selectedUser'));
  const [selectedGame, setSelectedGame] = useState<Game | null>(() => getStored<Game>('selectedGame'));

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
    <Layout onUserSelected={handleUserSelected}>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/users" element={<AllUsersPage onUserSelected={handleUserSelected} />} />
        <Route path="/choose-game" element={<ChooseGamePage onGameSelected={handleGameSelected} />} />
        <Route path="/timer" element={<TimerPage currentUser={currentUser} selectedGame={selectedGame} />} />
        <Route path="/statistics" element={<StatisticsPage currentUser={currentUser} />} />
      </Routes>
    </Layout>
  );
}
