import { useContext } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { AuthContext } from "../hooks/AuthContext";
import ProfileIcon from '../assets/icons/image 4.svg';
import SystemsOverviewIcon from '../assets/icons/image 5.svg';
import LogIcon from '../assets/icons/image 6.svg';
import NodeIcon from '../assets/icons/image 9.svg';
const drawerWidth = 238;
const Navbar = ({username}) => {
  const location = useLocation();
  const { setUser, user } = useContext(AuthContext)
  const logout = () => {
    const token = localStorage.getItem("token")
    const query = `
      query {
        logoutUser {
          message
          status
        }
      }
    `

    fetch(`${import.meta.env.VITE_SERVER_URI}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ query })
    }).then(
      res => res.json()
    ).then(
      res => {
        localStorage.removeItem("token")
        localStorage.removeItem("expiresIn")
        setUser(false)
      }
    ) 
  }
  return ( location.pathname !== "/login" ?
    <Container>
      <li className='profile'>
        <img src={ProfileIcon} width='35px' height='35px'/>
        <p>{user?.name || user?.email || ""}</p>
      </li>
      <li className="link">
        <Link to="/buildings">
          <img src={SystemsOverviewIcon} width='30px' height='30px'/>
          <p>Systems overview</p>
        </Link>
      </li>
      <li className="link">
        <Link to="/logs">
          <img src={LogIcon} width='30px' height='30px'/>
          <p>Logs</p>
        </Link>
      </li>
      {/* <li>
        <img src={NodeIcon} width='51px' height='51px'/>
        <p>Node Configuration</p>
      </li> */}
      <li className='logout'>
        <button onClick={logout}>
          Log out
          <ExitToAppIcon />
        </button>
      </li>
    </Container> : <></>
  );
};

const Container = styled.ul`
  background-color: #ebeef3;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  li{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5em;
    &.link{
      cursor: pointer;
      &:hover{
        background-color: #d5d5d5;
      }
    }
    a{
      display: flex;
      padding: 1em;
      flex: 1;
      flex-direction: row;
      align-items: center;
      gap: 0.5em;
      font-size: 1.12em;
      text-decoration: none;
      color: inherit;
    }
    button{
      font-family: 'Times New Roman', Times, serif;
      flex: 1;
      outline: 0;
      border: 0;
      background: transparent;
      display: flex;
      cursor: pointer;
      flex-direction: row;
      align-items: center;
      gap: 1em;
      text-decoration: none;
      color: inherit;
      font-size: 1.2em;
      height: max-content;
      justify-content: space-between;
      padding: 0.7em;
    }
  }
  li.profile{
    padding: 1em;
  }
  li.logout{
    flex: 1;
    height: max-content;
    align-items: flex-end;
    font-size: 1em;
    button:hover{
      background-color: #d5d5d5;
    }
  }
`
export default Navbar;