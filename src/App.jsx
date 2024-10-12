import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <AuthContext.Provider value={{ user, setUser, isAuth, setIsAuth }}>
      <Container>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/login" exact element={<Login />} />
        </Routes>
      </Container>
    </AuthContext.Provider>
  )
}

const Container = styled.div` 
`

export default App
