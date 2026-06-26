import React from 'react';

// This file contains intentional TypeScript violations for testing

interface User {
  id: number;
  name: string;
  email: string;
}

// Wrong: Using enum instead of const assertion
enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

// Wrong: Missing import type
interface Props {
  users: User[];
  role: UserRole;
}

const TestComponent: React.FC<Props> = ({ users, role }) => {
  // Wrong: Using any type
  const handleAction = (action: any) => {
    console.log(`Action: ${action}`);
  };

  // Wrong: Missing return type
  const filteredUsers = users.filter(user => {
    if (role === UserRole.ADMIN) {
      return true;
    }
    return user.name.includes('test');
  });

  return (
    <div>
      <h1>User Management</h1>
      {users.map((user, index) => (
        // Wrong: Missing key prop
        <div>
          {user.name} - {user.email}
          <button onClick={() => handleAction(index)}>
            Action
          </button>
        </div>
      ))}
    </div>
  );
};

export default TestComponent;