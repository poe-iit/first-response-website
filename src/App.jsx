import { Routes, Route, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Home from './pages/Home'
import Login from './pages/Login'
import Prototype1 from './pages/Prototype1'
import Logs from "./pages/Logs"
import { AuthContext } from './hooks/AuthContext'
import { useState, useEffect, useRef } from 'react'
import Buildings from './pages/Buildings'
import Floor from './pages/Floor'
import NewFloor from './pages/NewFloor'
import EditFloor from './pages/EditFloor'

function App() {

  const [user, setUser] = useState(null)
  const [isAuth, setIsAuth] = useState(false)
  const [description, setDescription] = useState("")
  const descriptionRef = useRef(null)
  const element = useRef()
  const navigate = useNavigate()

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

  useEffect(() => {
    if(!isAuth){
      navigate("/login")
    }
  }, [isAuth])

  useEffect(() => {
    const handleMouseOver = (e) => {
      e.stopPropagation()
      let currentElement = e.target
      while(!currentElement?.dataset?.title && currentElement?.parentNode){
        if(currentElement?.dataset?.stop) break
        currentElement = currentElement.parentNode
      }
      if(!currentElement?.dataset?.title) {
        setDescription("")
        return
      }
      element.current = currentElement
      setDescription(currentElement.dataset.title)
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

  return (
    <AuthContext.Provider value={{ user, setUser, isAuth, setIsAuth }}>
      <Container data-stop={true}>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/login" exact element={<Login />} />
          <Route path="/prototype1" exact element={ <Prototype1 />} />
          <Route path="/logs" exact element={ <Logs />} />
          <Route path="/buildings" exact element={ <Buildings />} />
          <Route path="/building/:buildingId/new" exact element={ <NewFloor />} />
          <Route path="/floor/:id" exact element={ <Floor />} />
          <Route path="/floor/:id/edit" exact element={ <EditFloor />} />
        </Routes>
        <div ref={descriptionRef} id="meta-description" className = {description.length ? "active" : ""}>{description}</div>
      </Container>
    </AuthContext.Provider>
  )
}

const Container = styled.div` 
  #meta-description{
    position: fixed;
    font-size: 0.9em;
    top: 100px;
    padding: 0.6em;
    background-color: rgb(31 101 135);
    color: rgb(255 255 255);
    border-radius: 10px;
    z-index: 100;
    &.active{
      display: block;
    }
  }
`

export default App

