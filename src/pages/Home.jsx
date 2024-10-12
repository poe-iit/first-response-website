import styled from "styled-components"
import { Link } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../hooks/AuthContext"

const Home = () => {
  const { setUser } = useContext(AuthContext)
  const logout = () => {
    const query = `
      query {
        logoutUser {
          message
          status
        }
      }
    `

    fetch(`${import.meta.env.VITE_SERVER_URI}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ query })
    }).then(
      res => res.json()
    ).then(
      res => {
        setUser(null)
        console.log(res)
      }
    ) 
  }
  return (
    <Container>
      <h1>Home</h1>
      <p>There isn't anything here currently so I'll use it as a sort of list of created pages</p>
      <ol>
        <li>
          <Link to="/login">Login</Link>
          <p>Once you're logged in, the page will redirect you to the dashboard</p>
          <p>you can delete the cookie to see the login page again</p>
        </li>
      </ol>

      <p>Here's the logout button</p>
      <button onClick={(e) => {
        logout()
      }}>Logout</button>
    </Container>
  )
}

const Container = styled.div``

export default Home