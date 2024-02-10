import { useContext, useEffect, useState } from "react"
import styled from 'styled-components'
import { Link, useNavigate } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from "@mui/icons-material/Google"
import { AuthContext } from "../hook/AuthContext";
import { GithubAuthProvider, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const { setUser, setLoading, auth, user } = useContext(AuthContext)

  const handleLogin = async (state) => {
    if(state === "normal"){
      console.log(auth, "Working", email, password)
      if(!auth)return
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential)
        setUser(userCredential.user)
        setLoading(false)
      })
      .catch((error) => {
        console.log(error)
        setLoading(false)
      })
      setLoading(false)
    }else{
      let provider
      if(state === "github"){
        provider = new GithubAuthProvider();
      }else if(state === "google"){
        provider = new GoogleAuthProvider();
      }

      if(provider){
        setLoading(true)
        signInWithPopup(auth, provider)
        .then((result) => {
          // This gives you a GitHub Access Token. You can use it to access the GitHub API.
          const credential = GithubAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          console.log(result, credential)
      
          // The signed-in user info.
          setUser(result.user);
          setLoading(false)
        }).catch((error) => {
          // The AuthCredential type that was used.
          const credential = GithubAuthProvider.credentialFromError(error);
          console.log(error, credential)
          setLoading(false)
        });
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const handleEnter = (e) => {
      if(e.key === "Enter" && auth){
        setLoading(true)
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log(userCredential)
          setUser(userCredential.user)
          setLoading(false)
        })
        .catch((error) => {
          console.log(error)
          setLoading(false)
        })
        setLoading(false)
      }
    }
    window.addEventListener('keydown', handleEnter)
    return () => window.removeEventListener('keydown', handleEnter)
  }, [auth, email, password])

  useEffect(() => {
    if(user)navigate("/")
  }, [user])

  return (
    <Container>
      <div className='content-container'>
        <h3>Login</h3>
        <ul>
          <li>
            <p>Email/Username</p>
            <input type='text' placeholder='Type here' value={email} onInput={(e) => setEmail(e.target.value)} />
          </li>
          <li>
            <p>Password</p>
            <input type='password' placeholder='Type here' value={password} onInput={(e) => setPassword(e.target.value)} />
          </li>
        </ul>
        <button onClick={() => handleLogin("normal")}>Log In</button>
        <div className='divider'></div>
        <div className='external-login'>
          <button className='github' onClick={() => handleLogin("github")}><GitHubIcon />Log In with GitHub</button>
          <button className='google' onClick={() => handleLogin("google")}><GoogleIcon />Log In with Google</button>
          <button className='apple'><AppleIcon />Log In with Apple</button>
        </div>
        <p className='signup-redirect'>Don't have an account? <Link to='/signup'>Sign Up</Link></p>
      </div>
    </Container>
  )
}

export default Login

const Container = styled.div`
  background-color: var(--md-sys-color-background);
  min-height: 100vh;
  display: flex;
  flex-direction: row-reverse;
  .content-container {
    width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1em;
    h3{
      font-weight: 800;
      line-height: 20px;
      font-size: 2em;
      text-align: center;
      color: var(--md-sys-color-on-background);
      padding-bottom: 0.5em;
    }
    ul{
      display: flex;
      flex-direction: column;
      gap: 1em;
      width: 100%;
      max-width: 360px;
      li{
        p{
          font-size: 14px;
          line-height: 1.5em;
          color: var(--md-sys-color-on-background);
        }
        input{
          padding: 16px;
          border: 1px solid #CCC;
          border-radius: 8px;
          width: 100%;
          outline: 0;
          &:focus-within, &:focus-visible{
            outline:2px solid var(--md-sys-color-primary);
            border-color: transparent;
          }
        }
      }
    }
    button{
      width: 100%;
      max-width: 360px;
      border-radius: 100px;
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      border: 0;
      padding: 0.6em;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      line-height: 24px;
      font-size: 0.85em;
      &:hover{
        filter: brightness(90%);
      }
    }
    .divider{
      height: 0;
      width: 100%;
      max-width: 360px;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }
    .external-login{
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 360px;
      gap: 0.7em;
      button{
        & > svg{
          fill:  var(--md-sys-color-on-secondary-container);
        }
        &:hover{
          filter: brightness(90%)
        }
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background-color: var(--md-sys-color-secondary-container);
        color: var(--md-sys-color-on-secondary-container);
      }
    }
    .signup-redirect{
      color: var(--md-sys-color-on-background);
      a{
        color: var(--md-sys-color-primary);
        text-decoration: none;
        &:hover{
          text-decoration: underline;
        }
      }
    }
  }
`