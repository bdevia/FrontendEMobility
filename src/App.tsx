import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import { Login } from './components/login/Login';
import { Home } from './components/home/Home';
import { Connector } from './components/connector/Connector';
import { Details } from './components/home/Details';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/*' element={<Navigate to={'/user/auth'}/>}/>
        <Route path='/user/auth' element={<Login/>}/>
        <Route path='/home' element={<Home/>}/>
        <Route path='/chargePoint/:id/connectors' element={<Connector/>}/>
        <Route path='/chargePoint/:id/details' element={<Details/>}/>
      </Routes>
    </Router>
  );
}

export default App;
