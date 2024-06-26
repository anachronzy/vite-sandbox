import { FC, useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

const App: FC = () => {
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((data) => setName(data.name));
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + TS + Express</h1>
      {Boolean(name) && <div>Привет, {name}!</div>}
    </>
  );
};

export default App;
