import styled from "styled-components"
import { Route, Routes } from 'react-router-dom'
import Admin from './pages/Admin'
import Sandbox from './pages/Sandbox'
import Navbar from "./components/Navbar"
import SVGEditor from "./pages/SVGEditor"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import { AuthContext } from "./hook/AuthContext"
import { useEffect, useState } from "react"
import { initializeApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import Home from "./pages/Home"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_CONFIG_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_CONFIG_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_CONFIG_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_CONFIG_STORAGE_BUCKET,
  messagingSenderId:import.meta.env.VITE_FIREBASE_CONFIG_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_CONFIG_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_CONFIG_MEASUREMENT_ID
};

function App() {
  const [auth, setAuth] = useState(null)
  const [app, setApp] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setApp(initializeApp(firebaseConfig))
  }, [])
  
  useEffect(() => {
    console.log(user)
  }, [user])

  useEffect(() => {
    if(!app) return
    setAuth(getAuth(app))
  }, [app])

  useEffect(() => {
    if(!auth) return
    setLoading(true)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [auth])

  return (
    <AuthContext.Provider value={{ app, auth, user, setUser, loading, setLoading }} >
      <Container className="light">
        {/* <Navbar /> */}
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/admin" element={<Admin />} />
          <Route exact path="/sandbox" element={<Sandbox />} />
          <Route exact path="/svgeditor" element={<SVGEditor />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/signup" element={<SignUp />} />
        </Routes>
      </Container>
    </AuthContext.Provider>
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