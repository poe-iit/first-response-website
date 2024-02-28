import { useContext, useEffect } from 'react'
import WhatshotIcon from '@mui/icons-material/Whatshot';
import Cursor from '../components/Cursor';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';
import { set, ref } from "firebase/database"
import { AuthContext } from '../hook/AuthContext';
import styled from 'styled-components';

const MainControls = ({locked, setLocked, setNodes, nodes, setSvgPosition, setSvgScale, positionRef, floorId, setMouseState, mouseState}) => {

  const { db } = useContext(AuthContext)

  useEffect(() => {
    localStorage["locked"] = JSON.stringify(locked)
  }, [locked])

  const resetNodes = () => {
    const tempNodes = JSON.parse(JSON.stringify(nodes))
    for(const nodeId in tempNodes){
      tempNodes[nodeId].state = "safe"
      set(ref(db, `buildings/DF6QbHKTyxHlBnf4MBeZ/floors/${floorId}/nodes/${nodeId}/state`), "safe")
    }
    setNodes(tempNodes)
  }


  return (
    <Container>
      <button onClick={() => {
        setLocked(!locked)
      }}>
        {
          locked ? <LockIcon sx={{
            fontSize: "1.3em",
          }}/> : <LockOpenIcon sx={{
            fontSize: "1.3em",
          }}/>
        }
      </button>
      <button onClick={() => setMouseState("default")} className={mouseState === "default" ? "active" : ""}>
        <Cursor />
      </button>
      <button onClick={() => setMouseState("danger")} className={mouseState === "danger" ? "active" : ""}>
        <WhatshotIcon sx={{
        fontSize: "1.3em",
      }}/>
      </button>
      <button onClick={resetNodes}>
        {/* Reset all nodes */}
        <RestartAltIcon sx={{
        fontSize: "1.3em",
      }} />
      </button>
      <button onClick={() => {
        setSvgPosition([0, 0])
        positionRef.current = [0, 0]
      }}> 
      {/* Center to screen with this one */}
        <CenterFocusWeakIcon sx={{
        fontSize: "1.3em",
      }}/>
      </button>
      <button onClick={() => {
        setSvgPosition([0, 0]);
        setSvgScale(1)
        positionRef.current = [0, 0]
      }}>
        {/* Revert to original scale with this one */}
        <CenterFocusStrongIcon sx={{
        fontSize: "1.3em",
      }}/>
      </button>
    </Container>
  )
}

export default MainControls

const Container = styled.div`
  position: absolute;
  left: calc(50vw - 5.9138125em);
  top: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: var(--md-sys-color-surface);
  border: 0.1px solid var(--md-sys-color-surface-dim);
  border-radius: 5px;
  padding: 0.2em;
  gap: 0.2em;
  button{
    outline: 0;
    border: 0;
    background-color: transparent;
    color: var(--md-sys-color-on-surface);
    fill: var(--md-sys-color-on-surface);
    display: flex;
    align-items: center;
    padding: 0.3em 0.5em;
    cursor: pointer;
    border-radius: 0.3em;
    &.active{
      background-color: var(--md-sys-color-surface-container);
    }
    &:hover{
      background-color: var(--md-sys-color-surface-container);
    }
  }
`