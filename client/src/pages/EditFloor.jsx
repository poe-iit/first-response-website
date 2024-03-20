import styled from 'styled-components'
import EditCanvas from '../components/EditCanvas';

const EditFloor = () => {

  return (
    <Container>
      <EditCanvas />
    </Container>
  )
}

export default EditFloor

const Container = styled.div`
  width: 100vw;
  height: 100vh;
`