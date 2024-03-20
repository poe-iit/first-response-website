import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import CloseIcon from "@mui/icons-material/Close";
import { useState } from 'react';
import styled from 'styled-components';

const HelpControls = () => {
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
        <QuestionMarkIcon sx={{
        fontSize: "1.5em",
      }}/>
      </button>
      {
      toggle && <div className='modal' onClick={handleModal}>
        <div className='modal-container' onClick={handleInteraction}>
          <div className='header'>
            <h2>Help</h2>
            <CloseIcon className='close' onClick={() => setToggle(!toggle)}/>
          </div>
          <div className='divider'></div>
          <div className='color-states'>
            <h3>Color States</h3>
            <ul>
              <li id='safe'>
                <span>Safe</span>
                <span className='color'></span>
              </li>
              <li id='stuck'>
                <span>Stuck</span>
                <span className='color'></span>
              </li>
              <li id='compromised'>
                <span>Compromised</span>
                <span className='color'></span>
              </li>
              <li id='exit'>
                <span>Exit</span>
                <span className='color'></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      }
    </Container>
  )
}

export default HelpControls

const Container = styled.div`
  position: absolute;
  right: 10px;
  bottom: 10px;
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
      .color-states{
        h3{
          color: var(--md-sys-color-on-surface);
          padding: 0.5em 0;
        }
        ul{
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: 0.4em;
          li{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 0.2em 0.5em;
            & ~ li{
              border-top: 1px solid var(--md-sys-color-outline-variant);
            }
            .color{
              width: 1.5em;
              height: 1.5em;
              border-radius: 50%;
            }
            
          }
          #safe .color{
            background-color: green;
          }
          #stuck .color{
            background-color: orange;
          }
          #compromised .color{
            background-color: red;
          }
          #exit .color{
            background-color: blue;
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