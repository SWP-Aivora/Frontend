import React, { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

export function TestComponent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // No error handling UI - user doesn't know what happened
    }
    setLoading(false);
  };

  // Missing error handling for null/undefined
  const renderUser = (user: User) => {
    return (
      <div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    );
  };

  // Potential memory leak - function recreated on every render
  const handleClick = () => {
    console.log('Button clicked');
    setTimeout(() => {
      console.log('Async operation completed');
    }, 1000);
  };

  return (
    <div>
      <button
        onClick={fetchUsers}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Fetch Users'}
      </button>

      <div>
        {users.map((user, index) => (
          <div key={index}>
            {renderUser(user)}
          </div>
        ))}
      </div>
    </div>
  );
}