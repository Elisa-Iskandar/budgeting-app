// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import AddExpense from './pages/AddExpense';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';

function Layout() {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'History', path: '/history' },
    { label: 'Add Expense', path: '/add' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #e0e0e0',
        gap: '12px',
      }}>
        <span style={{ fontWeight: 'bold', fontSize: '18px', marginRight: 'auto' }}>
          BudgetTracker
        </span>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '15px',
              backgroundColor: location.pathname === item.path ? '#333' : '#e0e0e0',
              color: location.pathname === item.path ? '#fff' : '#333',
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/add" element={<AddExpense />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}