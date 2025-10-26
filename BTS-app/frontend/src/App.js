import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/members')
      .then(response => response.json())
      .then(data => setMembers(data))
      .catch(error => console.error('Error fetching data: ', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>BTS Members</h1>
      </header>
      <main className="container">
        <div className="row">
          {members.map(member => (
            <div className="col-md-4" key={member.id}>
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">{member.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{member.real_name}</h6>
                  <p className="card-text">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;