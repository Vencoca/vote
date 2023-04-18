import { BrowserRouter, Routes, Route } from 'react-router-dom'
import VotePage from './pages/VotePage'
import Register from './pages/Register'
import Login from './pages/Login'
import CreateQuestion from './pages/CreateQuestion'
import GetQuestion from './pages/GetQuestion'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element = {<VotePage/>} ></Route>
        <Route path='/register' element = {<Register/>}></Route>
        <Route path='/login' element = {<Login/>}></Route>
        <Route path="/create" element = {<CreateQuestion/>}></Route>
        <Route path="/question/:id" element = {<GetQuestion/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
