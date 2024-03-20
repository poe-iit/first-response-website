import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import MenuIcon from "@mui/icons-material/Menu"
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import CloseIcon from '@mui/icons-material/Close'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { CanvasContext } from '../hook/CanvasContext';

const Menu = ({ floors, buildings }) => {

  const {floor, setFloor, building, setBuilding} = useContext(CanvasContext)
  const [toggle, setToggle] = useState(false)
  const handleModal = (e) => {
    setToggle(!toggle)
  }
  const handleInteraction = (e) => {
    e.stopPropagation()
  }

  const handleChange = (event) => {
    setFloor(floors.find(curr => curr.id === event.target.value))
  }

  const handleBuilding = (event) => {
    setBuilding(buildings.find(curr => curr._id === event.target.value))
  }

  return (
    <Container>
      <button onClick={() => setToggle(!toggle)}>
        {toggle ? 
          <MenuOpenIcon sx={{
            fontSize: "1.5em",
          }}/> :
            <MenuIcon sx={{
            fontSize: "1.5em",
          }}/>
        }
      </button>
      {
      toggle && <div className='modal' onClick={handleModal}>
        <div className='modal-container' onClick={handleInteraction}>
          <div className='header'>
            <h2>Menu</h2>
            <CloseIcon className='close' onClick={() => setToggle(!toggle)}/>
          </div>
          <div className='divider'></div>
          <div className='form-controls'>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Building</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={building?._id || 0}
                label="Building"
                onChange={handleBuilding}
              >
                {
                  buildings.map((building, i) => <MenuItem key={i} value={building?._id}>{building?.name}</MenuItem>)
                }
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Floor</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={floor?.id || 0}
                label="Building"
                onChange={handleChange}
              >
                {
                  floors.map((floor, i) => <MenuItem key={i} value={floor?.id}>{floor?.name}</MenuItem>)
                }
              </Select>
            </FormControl>
          </div>
        </div>
      </div>
      }
    </Container>
  )
}

export default Menu

const Container = styled.div`
  position: absolute;
  left: 10px;
  top: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: var(--md-sys-color-surface);
  border: 0.1px solid var(--md-sys-color-surface-dim);
  border-radius: 5px;
  button{
    outline: 0;
    border: 0;
    border-radius: 5px;
    background-color: transparent;
    color: var(--md-sys-color-on-surface);
    display: flex;
    align-items: center;
    padding: 0.3em 0.5em;
    cursor: pointer;
    &:hover{
      background-color: var(--md-sys-color-surface-container);
    }
  }
  .modal{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
    .modal-container{
      width: 80%;
      height: 80%;
      background-color: var(--md-sys-color-surface);
      border-radius: 1em;
      padding: 1em;
      .header{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        h2{
          color: var(--md-sys-color-on-surface);
        }
        .close{
          cursor: pointer;
          color: var(--md-sys-color-on-surface-variant);
          &:hover{
            color: var(--md-sys-color-on-surface);
            background-color: var(--md-sys-color-surface-container);
            border-radius: 50%;
          }
        }
        padding-bottom: 0.2em;
      }
      .form-controls{
        display: flex;
        flex-direction: column;
        gap: 1em;
      }
    }
  }
  .divider{
    height: 0;
    width: 100%;
    margin: 0.5em 0;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
  }
`