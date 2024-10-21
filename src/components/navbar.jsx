import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Avatar, Typography, Button, Divider } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useContext } from 'react';
import { AuthContext } from "../hooks/AuthContext";
import ProfileIcon from '../assets/icons/image 4.svg';
import SystemsOverviewIcon from '../assets/icons/image 5.svg';
import LogIcon from '../assets/icons/image 6.svg';
import AccountIcon from '../assets/icons/image 8.svg';
import NodeIcon from '../assets/icons/image 9.svg';

const drawerWidth = 238;

const Navbar = () => {

    const { setUser } = useContext(AuthContext)
    const logout = () => {
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
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ query })
      }).then(
        res => res.json()
      ).then(
        res => {
          setUser(null)
          console.log(res)
        }
      ) 
    }
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        background: '#E6E6E6',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'var(--d-9-d-9-d-9, #E6E6E6)',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
      <img src={ProfileIcon} width='51px' height='51px'/>
        <Box sx={{ ml: 2 }}>
          <Typography variant="h6">John Doe</Typography>
          <Button onClick={logout} endIcon={<ExitToAppIcon />}>
            Log out
          </Button>
        </Box>
      </Box>
      <Divider />
      <List>
        <ListItem button component={Link} to="/overview">
          <ListItemIcon>
            <img src={SystemsOverviewIcon} width='48px' height='48px'/>
          </ListItemIcon>
          <ListItemText primary="System Overview" />
        </ListItem>
        <ListItem button component={Link} to="/logs">
          <ListItemIcon><img src={LogIcon} width='48px' height='48px'/></ListItemIcon>
          <ListItemText primary="Log System" />
        </ListItem>
        <ListItem button component={Link} to="/account-management">
          <ListItemIcon><img src={AccountIcon} width='48px' height='48px'/></ListItemIcon>
          <ListItemText primary="Account/Groups Management" />
        </ListItem>
        <ListItem button component={Link} to="/node-configuration">
          <ListItemIcon><img src={NodeIcon} width='48px' height='48px'/></ListItemIcon>
          <ListItemText primary="Node Configuration" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Navbar;
