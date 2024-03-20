import { useContext, useEffect } from 'react'
import WhatshotIcon from '@mui/icons-material/Whatshot';
import Cursor from '../components/Cursor';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PolylineIcon from '@mui/icons-material/Polyline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RoomPreferencesIcon from '@mui/icons-material/RoomPreferences';
import PublishIcon from '@mui/icons-material/Publish';
import styled from 'styled-components';
import { CanvasContext } from '../hook/CanvasContext';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link } from 'react-router-dom';

const MainControls = ({positionRef, setUploadPlan}) => {

  const {nodes, mouseState, setMouseState, setSvgPosition, setSvgScale, locked, setLocked, floor, state } = useContext(CanvasContext)

  useEffect(() => {
    localStorage["locked"] = JSON.stringify(locked)
  }, [locked])

  const resetNodes = () => {
    if(!floor?.id)return
    const tempNodes = JSON.parse(JSON.stringify(nodes))
    for(const nodeId in tempNodes){
      tempNodes[nodeId].state = "safe"
      fetch(`${import.meta.env.VITE_SERVER_URL}/floor/${floor.id}/nodes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          [nodeId]: tempNodes[nodeId].state
        })
      })
    }
  }


  return (
    <Container>
      <button onClick={() => {
        setLocked(!locked)
      }} data-title={ !locked ? "Lock Canvas " : "Unlock Canvas "}>
        {
          locked ? <LockIcon sx={{
            fontSize: "1.3em",
          }} data-title="Unlock Canvs "/> : <LockOpenIcon sx={{
            fontSize: "1.3em",
          }} data-title="Lock Canvas"/>
        }
      </button>
      <button onClick={() => setMouseState("default")} className={mouseState === "default" ? "active" : ""} data-title="Move Items">
        <Cursor data-title="Move Items"/>
      </button>
      {state === "view" && <button onClick={() => setMouseState("danger")} className={mouseState === "danger" ? "active" : ""} data-title="Set Node On Fire">
        <WhatshotIcon sx={{
        fontSize: "1.3em",
      }} data-title="Set Node On Fire"/>
      </button>}
     {state !== "view" && <button onClick={() => setMouseState("circle")} className={mouseState === "circle" ? "active" : ""} data-title="Create Node">
        <AddCircleOutlineIcon sx={{
        fontSize: "1.3em",
      }} data-title="Create Node"/>
      </button>}
      {state !== "view" && <button onClick={() => setMouseState("line")} className={mouseState === "line" ? "active" : ""} data-title="Link Nodes">
        <PolylineIcon sx={{
        fontSize: "1.3em",
      }} data-title="Link Nodes"/>
      </button>}
      {state !== "view" && <button onClick={() => setMouseState("delete")} className={mouseState === "delete" ? "active" : ""} data-title="Delete Node/Line">
        <DeleteOutlineIcon sx={{
        fontSize: "1.3em",
      }} data-title="Delete Node/Line"/>
      </button>}
      {state !== "view" && <button onClick={() => setMouseState("exit")} className={mouseState === "exit" ? "active" : ""} data-title="Toggle Exit Node">
        <RoomPreferencesIcon sx={{
        fontSize: "1.3em",
        }} data-title="Toggle Exit Node"/>
      </button>}
      {state === "view" && <button onClick={resetNodes} data-title="Reset Nodes">
        {/* Reset all nodes */}
        <RestartAltIcon sx={{
        fontSize: "1.3em",
      }} data-title="Reset Nodes"/>
      </button>}
      <button onClick={() => {
        setSvgPosition([0, 0])
        positionRef.current = [0, 0]
      }} data-title="Center Plan"> 
      {/* Center to screen with this one */}
        <CenterFocusWeakIcon sx={{
        fontSize: "1.3em",
      }} data-title="Center Plan"/>
      </button>
      <button onClick={() => {
        setSvgPosition([0, 0]);
        setSvgScale(1)
        positionRef.current = [0, 0]
      }} data-title="Reset Canvas">
        {/* Revert to original scale with this one */}
        <CenterFocusStrongIcon sx={{
        fontSize: "1.3em",
      }} data-title="Reset Canvas"/>
      </button>
      {state !== "view" && <button onClick={() => setUploadPlan(true)} data-title="Upload Plan">
        <PublishIcon sx={{
        fontSize: "1.3em",
        }} data-title="Upload Plan"/>
      </button>}
      {state === "view" && <Link to={`/floor/${floor?.id}`} data-title="Edit Plan">
        <OpenInNewIcon sx={{
        fontSize: "1.3em",
        }} data-title="Edit Plan"/>
      </Link>}
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
  button, a{
    font-size: 0.9em;
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