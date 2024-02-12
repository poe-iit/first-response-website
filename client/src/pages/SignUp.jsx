import {useContext, useEffect, useState }from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from "@mui/icons-material/Google"
import { AuthContext } from '../hook/AuthContext';
import { createUserWithEmailAndPassword, GithubAuthProvider, GoogleAuthProvider, FacebookAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore'

const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()

  const { setLoading, setUser, setUserData, auth, db, user } = useContext(AuthContext)

  const register = async (email, password) => {
    if(!auth)return
    setLoading(true)
    await createUserWithEmailAndPassword(auth, email, password)
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


  const handleSignUp = (state) => {
    if(state === "normal"){
      const regex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
      if(!regex.test(email)){
        console.log("Invalid email, add an error message or a toaster")
        return
      }
      if(password.length < 6 || password !== confirmPassword){
        console.log("Invalid password, add an error message or a toaster")
        return
      }
      register(email, password)
    }else{
      let provider
      if(state === "github"){
        provider = new GithubAuthProvider();
      }else if(state === "google"){
        provider = new GoogleAuthProvider();
      }else if(state === "facebook"){
        provider = new FacebookAuthProvider();
      }

      if(provider){
        setLoading(true)
        signInWithRedirect(auth, provider);
        // .then((result) => {
        //   // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        //   // const credential = GithubAuthProvider.credentialFromResult(result);
        //   // const token = credential.accessToken;
        //   // console.log(result, credential)
      
        //   // The signed-in user info.
        //   setUser(result.user);
        //   setLoading(false)
        // }).catch((error) => {
        //   // The AuthCredential type that was used.
        //   // const credential = GithubAuthProvider.credentialFromError(error);
        //   // console.log(error, credential)
        //   setLoading(false)
        // });
        setLoading(false)
      }
    }
    
  }

  useEffect(() => {
    if(user)navigate("/")
  }, [])

  useEffect(() => {
    const handleEnter = (e) => {
      if(e.key === "Enter" && auth){
        const regex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
        if(!regex.test(email)){
          console.log("Invalid email, add an error message or a toaster")
          return
        }
        if(password.length < 6 || password !== confirmPassword){
          console.log("Invalid password, add an error message or a toaster")
          return
        }
        setLoading(true)
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
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
  }, [auth, email, password, confirmPassword])

  useEffect(() => {
    if(user){
      (async () => {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          newUser: false
        })
        setUserData(
          {
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
            newUser: false
          }
        )
      })()
      navigate("/")
    }
  }, [user])

  useEffect(() => {
    if(!auth)return
    getRedirectResult(auth)
  }, [])
  return (
    <Container>
      <div className='content-container'>
        <h3>Sign Up</h3>
        <ul>
          <li>
            <p>Email/Username</p>
            <input type='text' placeholder='Type here' value={email} onChange={(e) => setEmail(e.target.value)} />
          </li>
          <li>
            <p>Password</p>
            <input type='password' placeholder='Type here' value={password} onChange={(e) => setPassword(e.target.value)} />
          </li>
          <li>
            <p>Confirm Password</p>
            <input type='password' placeholder='Type here' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </li>
        </ul>
        <button onClick={() => handleSignUp("normal")}>Sign Up</button>
        <div className='divider'></div>
        <div className='external-signup'>
          <button className='github' onClick={() => handleSignUp("github")}><GitHubIcon />Sign Up with GitHub</button>
          <button className='google' onClick={() => handleSignUp("google")}><GoogleIcon />Sign Up with Google</button>
          <button className='facebook' onClick={() => handleSignUp("facebook")}><FacebookIcon />Sign Up with Facebook</button>
        </div>
        <p className='login-redirect'>Already have an account? <Link to='/login'>Log In</Link></p>
      </div>
    </Container>
  )
}

export default SignUp

const Container = styled.div`
  padding: 1em 0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  .content-container {
    width: 500px;
    padding: 0 70px;
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
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }
    .external-signup{
      display: flex;
      flex-direction: column;
      width: 100%;
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
    .login-redirect{
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
  @media screen and (max-width: 700px) {
    .content-container{
      padding: 0 20px;
    }
  }
`