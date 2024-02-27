import { Reg } from './Components/Reg';
import Login from './Components/Login';
import { Home } from './Components/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

function App() {
  const [data, setData] = useState({});
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login setData={setData} />}></Route>
        <Route path='/reg' element={<Reg />}></Route>
        <Route path='/home' element={<Home data={data} />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
