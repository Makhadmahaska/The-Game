import { FormEvent, useState } from 'react';
import { User } from '../types';
import { api } from '../api';


type HeaderProps = {
  onUserSelected: (user: User) => void;
};

export function Header({ onUserSelected }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const users = await api.searchUsers(query.trim());
    setResults(users);
  }

  return (
    <header className="header">
      

      <div className="search-area">
        <form onSubmit={handleSearch}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users"
            aria-label="Search users"
          />
          <button type="submit">Search</button>
        </form>

        {results.length > 0 && (
          <div className="search-results">
            {results.map((user) => (
              <button
                type="button"
                key={user.id}
                onClick={() => {
                  onUserSelected(user);
                  setResults([]);
                  setQuery('');
                }}
                className="result-item"
              >
                {user.firstName} {user.lastName}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
