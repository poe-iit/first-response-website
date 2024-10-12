import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../hooks/AuthContext'
import LoginErrorModal from '../components/LoginErrorModal'
import loginIcon from '../assets/login-icon.svg'
import userIcon from '../assets/user-icon.svg'
import lockIcon from '../assets/lock-icon.svg'
import styled from 'styled-components'

const Login = () => {
  const [loginCount, setLoginCount] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const { setUser,isAuth } = useContext(AuthContext)
  const navigate = useNavigate()
  const handleSubmit = (e) => {
    e.preventDefault()

    const query = `
      query {
        loginUser(email: "${email}", password: "${password}") {
          id
          username
          email
          accountStatus
          roles
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
        console.log(res)
        if(!res?.data?.loginUser){
          setLoginCount(loginCount + 1)
        }else{
          setUser(res.data.loginUser)
        }
      }
    )
  }
  const handleInputChange = (e) => {
    setShowBanner(false)
    setShowModal(false)
  }
  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    handleInputChange(e)
  }
  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    handleInputChange(e)
  }

  useEffect(() => {
    if(loginCount > 0){
      if(loginCount % 3 === 0){
        setShowModal(true)
      }else{
        setShowBanner(true)
      }
    }
  }, [loginCount])

  useEffect(() => {
    if(isAuth){
      navigate('/')
    }
  }, [isAuth])
  return (
    <Container onSubmit={handleSubmit}>
      <figure>
        <img src={loginIcon} alt="login icon" />
        <figcaption className='visually-hidden'>Login icon beside login form</figcaption>
      </figure>
      <section>
        <form>
          <h2>Login</h2>
          {showBanner && 
          <p className='error banner'>Login Failed: Invalid email or password</p>}
          <label htmlFor='email'>
            <img src={userIcon} alt="User icon" />
            <input type="text" id="email" name="email" placeholder="Email" autoComplete="email" aria-label="Email" required onInput={handleEmailChange} />
          </label>
          <label htmlFor="password">
            <img src={lockIcon} alt="Lock icon" />
            <input type="password" id="password" name="password" placeholder="Password" autoComplete="current-password" aria-label="Password" required onInput={handlePasswordChange} />
          </label>
          <button type='submit'>Login</button>
        </form>
      </section>
      {showModal && <LoginErrorModal setShowModal={setShowModal}/>}
    </Container>
  )
}

// Designing desktop first with breakpoints 768, 1024, 1440, 1920, 2560

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  align-items: center;
  justify-content: center;
  figure{
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    img{
      width: 50%;
    }
  }
  section{
    flex: 1;
    form{
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1rem;
      margin: 0 25%;
      h2{
        text-align: center;
        font-size: 2rem;
      }
      .banner {
        height: 2.5rem;
        padding: 0 0.75rem;
        display: flex;
        align-items: center;
        &.error {
          background-color: #ffdfdf;
        }
      }
      label{
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
        border: 1px solid #e6e6e6;
        border-radius: 1rem;
        padding: 0.5rem;
        cursor: text;
        background-color: #e6e6e6;
        &:focus-within{
          border-color: #000000;
        }
        img{
          cursor: default;
        }
        input{
          width: 100%;
          border: none;
          height: 100%;
          outline: none;
          background-color: inherit;
        }
      }
      button{
        border: none;
        background-color: #000000; // TODO: Make colors variables
        cursor: pointer;
        border-radius: 1rem;
        font-size: 1em;
        padding: 0.5rem;
        color: #ffffff;
        font-weight: bold;
      }
    }
  }
  @media (max-width: 1024px) {
    figure img {
      width: 60%;
    }
    section form {
      margin: 0 15%;
    }
  }
  @media (max-width: 768px) {
    flex-direction: column;
    figure{
      display: none;
    }
    section {
      width: 100%;
      justify-content: center;
      display: flex;
      form{
        margin: 0;
        width: 60%;
      }
    }
  }
  @media (max-width: 480px) {
    section form {
      width: 90%;
    }
  }
`

export default Login