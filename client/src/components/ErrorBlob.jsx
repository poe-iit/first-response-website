import styled from 'styled-components'
import ErrorOutline  from '@mui/icons-material/ErrorOutline'

const ErrorBlob = ({title, message}) => {
  return (
    <Container>
      <ErrorOutline sx={{
        color: "var(--md-sys-color-on-error-container)",
        width: "1.35em",
        height: "1.35em"
      }}/>
      <h1>{title}</h1>
      <p>{message}</p>
    </Container>
  )
}

export default ErrorBlob

const Container = styled.div`
  background-color: var(--md-sys-color-error-container);
  width: 100%;
  padding: 0.5em 0.85em 1em 0.85em;
  font-size: 0.95em;
  border-radius: 0.7em;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2em;
  h1{
    font-size: 1.4em;
    color: var(--md-sys-color-on-error-container);
  }
  p{
    color: var(--md-sys-color-on-error-container);
    font-size: 1em;
    font-weight: 400;
    text-align: center;
  }
`