import styled from "styled-components"
import { Route, Routes, useNavigate } from 'react-router-dom'
import Admin from './pages/Admin'
import Sandbox from './pages/Sandbox'
import Navbar from "./components/Navbar"
import SVGEditor from "./pages/SVGEditor"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import { AuthContext } from "./hook/AuthContext"
import { useEffect, useState } from "react"
import { initializeApp } from "firebase/app"
import { getAuth, getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import Home from "./pages/Home"
import AccountConfirmation from "./pages/AccountConfirmation"

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
  const [db, setDB] = useState(null)
  const [app, setApp] = useState(null)
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState({})
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate() 

  useEffect(() => {
    setApp(initializeApp(firebaseConfig))
  }, [])
  
  useEffect(() => {
    if(user){
      const userRef = doc(db, "users", user.uid)
      getDoc(userRef)
      .then(docSnap => {
        if(docSnap.exists()){
          setUserData(docSnap.data())
        }
      })
    }
    console.log(user)
  }, [user])

  useEffect(() => {
    if(!userData) return
    console.log(userData)
  }, [userData])

  useEffect(() => {
    if(!app) return
    setAuth(getAuth(app))
    setDB(getFirestore(app))
  }, [app])

  useEffect(() => {
    if(!auth) return
    setLoading(true)
    getRedirectResult(auth)
    .then((result) => {
      console.log(result)
    })
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [auth])

  useEffect(() => {
    if(userData && userData.newUser){
      navigate("/account-confirmation")
    }
  }, [userData])

  return (
    <AuthContext.Provider value={{ app, auth, db, user, setUser, userData, setUserData, loading, setLoading }} >
      <Container className="light">
        {/* <Navbar /> */}
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/admin" element={<Admin />} />
          <Route exact path="/sandbox" element={<Sandbox />} />
          <Route exact path="/svgeditor" element={<SVGEditor />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/signup" element={<SignUp />} />
          <Route exact path="/account-confirmation" element={<AccountConfirmation />} />
        </Routes>
      </Container>
    </AuthContext.Provider>
  )
}

export default App

const Container = styled.div`
  background-color: var(--md-sys-color-background);
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