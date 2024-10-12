import styled from "styled-components"
import { Link } from "react-router-dom"

const Home = () => {
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
    </Container>
  )
}

const Container = styled.div``

export default Home