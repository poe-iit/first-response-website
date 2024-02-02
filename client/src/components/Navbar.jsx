import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <Container>
      <Link to="/admin">Admin</Link>
      <Link to="/sandbox">Sandbox</Link>
    </Container>
  )
}

export default Navbar

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding-bottom: 1em;
`