import styled from "styled-components"
import { Route, Routes } from 'react-router-dom'
import Admin from './pages/Admin'
import Sandbox from './pages/Sandbox'
import Navbar from "./components/Navbar"

function App() {
  return (
    <Container>
      <Navbar />
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/sandbox" element={<Sandbox />} />
      </Routes>
    </Container>
  )
}

export default App

const Container = styled.div`
  > svg{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    circle{
      cursor: pointer;
    }
  }
`