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
import ErrorBlob from "../components/ErrorBlob";

const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(false)
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
      handleError(error.code)
      setLoading(false)
    })
    setLoading(false)
  }

  function handleError(errorCode) {
    switch(errorCode){
      case "auth/account-exists-with-different-credential":
        setError({
          title: "Wrong Credentials",
          message: "Your account was created with a different login method. Please use that login method to sign in."
        })
        break
      case "auth/invalid-email":
        setError({
          title: "Invalid Email",
          message: "Please enter a valid email address."
        })
        break
      case "auth/user-disabled":
        setError({
          title: "Account Disabled",
          message: "Your account has been disabled. Please contact support."
        })
        break
      case "auth/user-not-found":
        setError({
          title: "Account Not Found",
          message: "Your account was not found. Please sign up."
        })
        break
      case "auth/too-many-requests":
        setError({
          title: "Too Many Requests",
          message: "Too many failed login attempts. Please try again later."
        })
        break
      case "auth/popup-closed-by-user":
        setError({
          title: "Popup Closed",
          message: "The popup has been closed. Please try again."
        })
        break
      case "auth/popup-blocked":
        setError({
          title: "Popup Blocked",
          message: "The popup has been blocked. Please unblock it and try again."
        })
        break
      case "auth/network-request-failed":
        setError({
          title: "Network Error",
          message: "Network request failed. Please try again."
        })
        break
      case "auth/email-already-in-use":
        setError({
          title: "Email Already In Use",
          message: "The email address is already in use by another account. Please use a different email address."
        })
        break
      default:
        setError({
          title: "Invalid Credentials",
          message: "Incorrect email address and / or password. If your account was created with a different login method, please use that method to sign in. You can then link your account through the account settings."
        })
        break
    }
  }

  const handleSignUp = (state) => {
    if(state === "normal"){
      const regex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
      if(!regex.test(email)){
        setError({
          message: "Please enter a valid email address.",
          type: "email"
        })
        return
      }
      if(password.length < 6){
        setError({
          message: "Password must be at least 6 characters.",
          type: "password"
        })
        return
      }
      if(password !== confirmPassword){
        setError({
          message: "Passwords do not match.",
          type: "confirm-password"
        })
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
        localStorage.setItem("signup-method", state)
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
          setError({
            message: "Please enter a valid email address.",
            type: "email"
          })
          return
        }
        if(password.length < 6){
          setError({
            message: "Password must be at least 6 characters.",
            type: "password"
          })
          return
        }
        if(password !== confirmPassword){
          setError({
            message: "Passwords do not match.",
            type: "confirm-password"
          })
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
          handleError(error.code)
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

  // useEffect(() => {
  //   if(!auth)return
  //   getRedirectResult(auth)
  //   .then((result) => {
  //     setUser(result.user)
  //     setLoading(false)
  //   })
  //   .catch((error) => {
  //     console.log(error)
  //   })
  // }, [])

  useEffect(() => {
    if(!auth)return
    if(localStorage["signup-method"]){
      delete localStorage["signup-method"]
      getRedirectResult(auth)
      .then((result) => {
        setUser(result.user)
        setLoading(false)
      })
      .catch((error) => {
        handleError(error.code)
        setLoading(false)
      })
    }
  }, [auth])
  return (
    <Container error={error?.message}>
      <div className='content-container'>

        <h3>Sign Up</h3>
        {error && !error?.type && <ErrorBlob {...error} />}
        <ul>
          <li className={['email', error?.type === 'email' ? 'error' : ''].join(' ')}>
            <p>Email/Username</p>
            <input type='text' placeholder='Type here' value={email} onChange={(e) => {
              setEmail(e.target.value)
              setError()
              }} />
          </li>
          <li className={['password', error?.type === 'password' ? 'error' : ''].join(' ')}>
            <p>Password</p>
            <input type='password' placeholder='Type here' value={password} onChange={(e) => {
              setPassword(e.target.value)
              setError()
            }} />
          </li>
          <li className={['confirm-password', error?.type === 'confirm-password' ? 'error' : ''].join(' ')}>
            <p>Confirm Password</p>
            <input type='password' placeholder='Type here' value={confirmPassword} onChange={(e) => {
              setConfirmPassword(e.target.value)
              setError()
              }} />
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
        display: flex;
        flex-direction: column;
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
        &.error{
          input{
            outline:2px solid var(--md-sys-color-error);
            border-color: transparent;
          }
          &::after{
            display: block;
            color: var(--md-sys-color-error);
            font-size: 0.9em;
            padding-top: 0.3em;
          }
          /* border-color: var(--md-sys-color-error) */
        }
        &.email.error::after{
          content: "Please enter a valid email address.";
        }
        &.password.error::after{
          content: "Password must be at least 6 characters.";
        }
        &.confirm-password.error::after{
          content: "Passwords do not match.";
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