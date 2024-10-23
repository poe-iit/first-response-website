import { Routes, Route } from 'react-router-dom'
import styled from 'styled-components'
import Home from './pages/Home'
import Login from './pages/Login'
import Prototype1 from './pages/Prototype1'
import Logs from "./pages/Logs"
import { AuthContext } from './hooks/AuthContext'
import { useState, useEffect } from 'react'

function App() {

  const [user, setUser] = useState(null)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    if (!user) {
      const query = `
        query {
          validateSession {
            id
            username
            email
            accountStatus
            roles
          }
        }
      `

      fetch(`${import.meta.env.VITE_SERVER_URI}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ query })
      }).then(
        res => res.json()
      ).then(
        res => {
          if(res?.data?.validateSession){
            setUser(res.data.validateSession)
          }
        }
      )
    }
  }, [])

  useEffect(() => {
    if(user) {
      setIsAuth(true)
    }else{
      setIsAuth(false)
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, setUser, isAuth, setIsAuth }}>
      <Container>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/login" exact element={<Login />} />
          <Route path="/prototype1" exact element={ <Prototype1 />} />
          <Route path="/logs" exact element={ <Logs />} />
        </Routes>
      </Container>
    </AuthContext.Provider>
  )
}

const Container = styled.div` 
`

export default App

