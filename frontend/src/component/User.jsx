import React, { useState } from 'react';
import './UserPage.css';

const UserPage = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const groups = [
    { id: 1, name: 'Group 1', owes: 50 },
    { id: 2, name: 'Group 2', owes: 75 },
    { id: 3, name: 'Group 3', owes: 20 },
  ];

  const groupInfo = selectedGroup
    ? `You are viewing details for ${selectedGroup.name}. You owe ${selectedGroup.owes} dollars.`
    : 'Please select a group to view details.';

  return (
    <div className="user-page-container">
      <div className="side-section">
        {groups.map((group) => (
          <div
            key={group.id}
            className="group-card"
            onClick={() => setSelectedGroup(group)}
          >
            <h3>{group.name}</h3>
            <p>Owes: ${group.owes}</p>
          </div>
        ))}
      </div>
      <div className="main-section">
        <h2>Group Information</h2>
        <p>{groupInfo}</p>
      </div>
    </div>
  );
};

export default UserPage;
