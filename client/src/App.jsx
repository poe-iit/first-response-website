import styled from "styled-components"
import { Route, Routes, useNavigate } from 'react-router-dom'
import Admin from './pages/Admin'
import Sandbox from './pages/Sandbox'
import Navbar from "./components/Navbar"
import SVGEditor from "./pages/SVGEditor"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import { AuthContext } from "./hook/AuthContext"
import { useEffect, useState, useRef } from "react"
import { initializeApp } from "firebase/app"
import { getAuth, getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { get, ref } from "firebase/database"
import { getDatabase } from "firebase/database"
import Home from "./pages/Home"
import AccountConfirmation from "./pages/AccountConfirmation"
import NewAdmin from "./pages/NewAdmin"
import { WebSocketPage } from "./pages/WebSocket"
import EditFloor from "./pages/EditFloor"
import ErrorPage from "./pages/ErrorPage"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_CONFIG_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_CONFIG_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_CONFIG_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_CONFIG_STORAGE_BUCKET,
  messagingSenderId:import.meta.env.VITE_FIREBASE_CONFIG_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_CONFIG_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_CONFIG_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

function App() {
  const [auth, setAuth] = useState(null)
  const [db, setDB] = useState(null)
  const [app, setApp] = useState(null)
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState({})
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState("")
  const descriptionRef = useRef()
  const element = useRef()

  const navigate = useNavigate() 


  useEffect(() => {
    const handleMouseOver = (e) => {
      e.stopPropagation()
      if(e.target.dataset.title){
        element.current = e.target
        setDescription(e.target.dataset.title)
      }
      else if(!e.target.parentNode?.dataset?.title){
        setDescription("")
      }
    }
    window.addEventListener("mouseover", handleMouseOver)
    return () => {
      window.removeEventListener("mouseover", handleMouseOver)
    }
  }, [])

  useEffect(() => {
    if(element.current && description.length){
      const elementRect = element.current.getBoundingClientRect()
      const descriptionRect = descriptionRef.current.getBoundingClientRect()
      const gap = 10
      let y = elementRect.top - gap - descriptionRect.height
      let x = elementRect.left + elementRect.width / 2 - descriptionRect.width / 2
      if(y < gap){
        y = elementRect.bottom + gap
      }
      // console.log("working")
      // console.log(e)
      // let x = e.clientX - e.offsetX - descriptionRef.current.clientWidth / 2 + e.target.clientWidth / 2
      // const y = e.clientY - e.offsetY - descriptionRef.current.clientHeight / 2 + e.target.clientHeight / 2
      descriptionRef.current.style.top = y + "px"
      descriptionRef.current.style.left =  x + "px"
    }else{
      descriptionRef.current.style.top = "-100px"
    }
  }, [description])

  useEffect(() => {
    setApp(initializeApp(firebaseConfig))
  }, [])
  
  useEffect(() => {
    if(user){
      const userRef = ref(db, `users/${user.uid}`)
      get(userRef).then(docSnap => {
        if(docSnap.exists()){
          console.log(docSnap)
          setUserData(docSnap.toJSON())
        }
      })
    }
  }, [user])

  useEffect(() => {
    if(!userData) return
    console.log(userData)
  }, [userData])

  useEffect(() => {
    if(!app) return
    setAuth(getAuth(app))
    setDB(getDatabase(app))
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
    console.log(userData)
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
          <Route exact path="/new-admin" element={<NewAdmin />} />
          <Route exact path="/websocket" element={<WebSocketPage />} />
          <Route exact path="/floor/:floor" element={<EditFloor />} />
          <Route exact path="/404" element={<ErrorPage />} />
        </Routes>
        <div ref={descriptionRef} id="meta-description" className = {description.length ? "active" : ""}>{description}</div>
      </Container>
    </AuthContext.Provider>
  )
}

export default App

const Container = styled.div`
  background-color: var(--md-sys-color-background);
  #meta-description{
    position: fixed;
    font-size: 0.9em;
    top: 100px;
    padding: 0.6em;
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border-radius: 10px;
    z-index: 100;
    &.active{
      display: block;
    }
  }
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