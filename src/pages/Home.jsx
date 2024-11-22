import styled from "styled-components"
import { Link } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../hooks/AuthContext"
const Home = () => {
  return (
    <Container>
      <h1>Welcome to Soteria</h1>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  h1{
    width: 100%;
    padding-top: 1em;
    text-align: center;
  }
`;

export default Home