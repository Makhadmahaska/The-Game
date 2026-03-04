import { useEffect, useState } from 'react';
import { api } from '../api';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

type Props = {
  onUserSelected: (user: User) => void;
};

export function AllUsersPage({ onUserSelected }: Props) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <section className="card">Loading users...</section>;
  }

  return (
    <section className="card">
      <h2>All Users</h2>
      <button type="button" onClick={() => navigate('/register')}>
        Add New User
      </button>
      <div className="users-grid">
        {users.map((user) => (
          <button
            type="button"
            key={user.id}
            className="user-card"
            onClick={() => onUserSelected(user)}
          >
            <img
              src={user.profilePictureUrl || 'https://placehold.co/200x200?text=User'}
              alt={`${user.firstName} ${user.lastName}`}
            />
            <h3>
              {user.firstName} {user.lastName}
            </h3>
            <p>{user.email}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
