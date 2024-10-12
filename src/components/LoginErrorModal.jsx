import styled from "styled-components"
import cautionIcon from "../assets/caution-icon.svg"

const LoginErrorModal = ({ setShowModal }) => {

  const handleOutsideClick = (e) => {
    e.stopPropagation()
    if (e.target.id === "login-error-modal") {
      setShowModal(false)
    }
  }
  return (
    <Container onClick={handleOutsideClick} id="login-error-modal">
      <div>
        <img src={cautionIcon} alt="Error Icon" />
        <h1>Login Failed</h1>
        <p>Incorrect password or username. Please try again.</p>
        <button onClick={() => setShowModal(false)}>Try Again</button>
        <span>Have a question? Contact your administrator</span>
      </div>
    </Container>
  )
}

const Container = styled.section`
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  div{
    background-color: white;
    padding: 2rem;
    border-radius: 0.2rem;
    display: flex;
    flex-direction: column;
    img{
      width: 3rem;
      margin-bottom: 0.75rem;
    }
    h1{
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }
    p{
      font-size: 1.15rem;
    }
    button{
      width: max-content;
      border-radius: 1rem;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      outline: none;
      border: none;
      background-color: #000000;
      color: white;
      cursor: pointer;
      margin: 0.8rem 0;
    }
    span{
      font-size: 0.88rem;
    }
  }
  @media (max-width: 480px) {
    div {
      width: 90%;
    }
  }
`

export default LoginErrorModal
