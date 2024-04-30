import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import { Login } from './components/login/Login';
import { Home } from './components/home/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/user/auth' element={<Login/>}/>
      </Routes>
    </Router>
  );
}

export default App;
