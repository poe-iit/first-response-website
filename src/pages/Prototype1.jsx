import styled from 'styled-components'
import { useState } from 'react'
import Canvas from '../components/prototype1/Canvas'
import Navbar from '../components/navbar'; // Import the navbar
const Prototype1 = () => {
  const [state, setState] = useState("default")
  // Create, Connect, Disconnect, Delete, Default
  return (
    <Container>
      <Navbar />
      <MainContent>
      <Canvas state={state}/>
      <section className='buttons'>
        <button onClick={() => setState("default")}>Default</button>
        <button onClick={() => setState("create")}>Create Node</button>
        <button onClick={() => setState("connect")}>Connect Nodes</button>
        <button onClick={() => setState("update")}>Update</button>
        <button onClick={() => setState("delete")}>Delete</button>
        <button onClick={() => setState("upload")}>Upload Node</button>
      </section>
      </MainContent>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
`;
const MainContent = styled.div`
  flex-grow: 1;
  padding: 30px;
`;
export default Prototype1