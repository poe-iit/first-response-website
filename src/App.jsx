import { Routes, Route } from 'react-router-dom'
import styled from 'styled-components'
import Login from './pages/Login'
import { AuthContext } from './hooks/AuthContext'
import { useState, useEffect } from 'react'
import Home from './pages/Home'

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
          console.log(res)
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
    }
  }, [user])

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

