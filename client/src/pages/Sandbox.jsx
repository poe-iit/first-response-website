import {  useState } from 'react'
import styled from 'styled-components'
import FloorDropDown from '../components/FloorDropDown';
import Canvas from '../components/Canvas';

const Sandbox = () => {
  
  const [floorId, setFloorId] = useState("")

  return (
    <Container>
      <Canvas floorId={floorId}/>
    </Container>
  )
}

export default Sandbox

const Container = styled.div`
  width: 100vw;
  height: 100vh;
`