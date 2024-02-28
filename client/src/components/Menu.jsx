import React, { useState } from 'react'
import styled from 'styled-components'
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from '@mui/icons-material/Close'

const Menu = ({ floors, setFloorId, floorId }) => {
  const [toggle, setToggle] = useState(false)
  const handleModal = (e) => {
    setToggle(!toggle)
  }
  const handleInteraction = (e) => {
    e.stopPropagation()
  }
  return (
    <Container>
      <button onClick={() => setToggle(!toggle)}>
        <MenuIcon sx={{
        fontSize: "1.5em",
      }}/>
      </button>
      {
      toggle && <div className='modal' onClick={handleModal}>
        <div className='modal-container' onClick={handleInteraction}>
          <div className='header'>
            <h2>Menu</h2>
            <CloseIcon className='close' onClick={() => setToggle(!toggle)}/>
          </div>
          <div className='divider'></div>
          <div className='floors'>
            <h3>Floors</h3>
            <ul>
              {
                Object.keys(floors).map((floorName, i) => <li key={i} className={floorId === floorName ? "selected" : ""} onClick={() => setFloorId(floorName)}>{floors[floorName]?.name || floorName}</li>)
              }
            </ul>
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
      .floors{
        h3{
          color: var(--md-sys-color-on-surface);
          padding: 0.5em 0;
        }
        ul{
          li{
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: start;
            padding: 0.5em 0.5em;
            border-radius: 0.4em;
            cursor: pointer;
            color: var(--md-sys-color-on-surface);
            &:hover{
              color: var(--md-sys-color-on-secondary-container);
              background-color: var(--md-sys-color-secondary-container);
            }
            &.selected{
              color: var(--md-sys-color-on-primary-container);
              background-color: var(--md-sys-color-primary-container);
            }
            & ~ li{
              margin-top: 0.3em;
              position: relative;
              
            }
            & ~ li::before{
              position: absolute;
              top: -0.15em;
              left: 1em;
              width: calc(100% - 2em);
              content: "";
              border-top: 1px solid var(--md-sys-color-outline-variant);
            }
          }
        }
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