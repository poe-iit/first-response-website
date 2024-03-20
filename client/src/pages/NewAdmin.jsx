import styled from 'styled-components'
import AdminCanvas from '../components/AdminCanvas';

const NewAdmin = () => {

  return (
    <Container>
      <AdminCanvas />
    </Container>
  )
}

export default NewAdmin

const Container = styled.div`
  width: 100vw;
  height: 100vh;
`