import styled from 'styled-components';

import cursor from "../assets/cursor.svg"
import WhatshotIcon from '@mui/icons-material/Whatshot';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PolylineIcon from '@mui/icons-material/Polyline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RoomPreferencesIcon from '@mui/icons-material/RoomPreferences';
import PublishIcon from '@mui/icons-material/Publish';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useContext, useEffect, useState } from 'react';
import { CanvasContext } from '../hooks/CanvasContext';
import { Link } from 'react-router-dom';

const CanvasNavbar = ({ modulesAllowed }) => {
  const [modules, setModules] = useState(new Set())
  const { stageRef, canvasIsDraggable, setCanvasIsDraggable, nodes, state, setState, setUpload} = useContext(CanvasContext)

  const toggleCanvasIsDraggable = () =>{
    setCanvasIsDraggable(!canvasIsDraggable)
  }

  // Work on moving reusable functions to useContext
  const centerPlan = () => {
    let left, bottom, top, right
    const width = stageRef.current.getWidth()
    const height = stageRef.current.getHeight()
    left = Number.MAX_SAFE_INTEGER
    bottom = Number.MAX_SAFE_INTEGER
    right = Number.MIN_SAFE_INTEGER
    top = Number.MIN_SAFE_INTEGER

    for(const [_, node] of nodes){
      left = Math.min(left, node.ui.x)
      right = Math.max(right, node.ui.x)
      bottom = Math.min(bottom, node.ui.y)
      top = Math.max(top, node.ui.y)
    }

    if(left === Number.MAX_SAFE_INTEGER)return

    // I'm scaling it here so the whole layer fits 80% of the screen before
    // centering it
    
    const layerWidth = right - left, layerHeight = top - bottom

    let scale
    scale = (width * 0.8) / layerWidth
    scale = Math.min(scale, (height * 0.8) / layerHeight)

    stageRef.current.scaleX(scale)
    stageRef.current.scaleY(scale)

    // Center the layer
    const centerX = ((left + right) * scale - width) / 2
    const centerY = ((top + bottom) * scale - height) / 2

    stageRef.current.position({
      x: -centerX,
      y: -centerY
    })
    stageRef.current?.fire("positionchanged")
  }

  useEffect(() => {
    setModules(new Set(modulesAllowed || []))
    console.log(modulesAllowed)
  }, [])

  return (
    <Container>

      {
        modules.has("lock") ? 
        <button onClick={toggleCanvasIsDraggable}>
          {
            canvasIsDraggable ? 
            <LockOpenIcon sx={{
              fontSize: "1.3em"
            }}/> : 
            <LockIcon sx={{
              fontSize: "1.3em"
            }}/>
          }
        </button> :
        <></>
      }

      {
        modules.has("default") ?
        <button 
          onClick={() => setState(state === "default" ? "" : "default")} 
          className={state === "default" ? "active" : ""}
        >
          <img id="default-icon" src={cursor} alt="Set default"/>
        </button> :
        <></>
      }

      {
        modules.has("fire") ?
        <button
          onClick={() => setState(state === "fire" ? "" : "fire")}
          className={state === "fire" ? "active" : ""}
        >
          <WhatshotIcon sx={{
            fontSize: "1.3em"
          }} />
        </button> : 
        <></>
      }

      {
        modules.has("create") ?
        <button 
          onClick={() => setState(state === "create" ? "" : "create")}
          className={state === "create" ? "active" : ""}
        >
          <AddCircleOutlineIcon 
            sx={{
              fontSize: "1.3em"
            }}
          />
        </button> : 
        <></>
      }

      {
        modules.has("connect") ? 
        <button 
          onClick={() => setState(state === "connect" ? "" : "connect")}
          className={state === "connect" ? "active" : ""}
        >
          <PolylineIcon 
            sx={{
              fontSize: "1.3em"
            }}
          />
        </button> : 
        <></>
      }

      {
        modules.has("delete") ? 
        <button
          onClick={() => setState(state === "delete" ? "" : "delete")}
          className={state === "delete" ? "active" : ""}
        >
          <DeleteOutlineIcon
            sx={{
              fontSize: "1.3em"
            }}
          />
        </button> : 
        <></>
      }

      {modules.has("exit") ?
        <button
          onClick={() => setState("exit")}
          className={state === "exit" ? "active" : ""}
        >
          <RoomPreferencesIcon 
            sx={{
              fontSize: "1.3em"
            }}
          />
        </button> :
        <></>
      }


      {/* Update node name, update line direction and update floor plan */}
      {/* Make the lines have the same behaviour as the InvisibleNode */}
      {
        modules.has("update") ? 
        <button
          onClick={() => setState(state === "update" ? "" : "update")}
          className={state === "update" ? "active" : ""}
        >
          <EditNoteIcon
            sx={{
              fontSize: "1.3em"
            }}
          />
        </button>:
        <></>
      }

      {/* Create a way to upload images later (if there's time) */}
      {
        modules.has("photo") ? 
        <button>
          <AddPhotoAlternateIcon
            sx={{
              fontSize: "1.3em"
            }}
          />
        </button>: 
        <></>
      }

      {/* Write logic to center the plan */}
      {
        modules.has("center") ? 
        <button
          onClick={centerPlan}
        >
          <CenterFocusStrongIcon
            sx={{
              fontSize: "1.3em"
            }}
          />
        </button> :
        <></>
      }

      {
        modules.has("upload") ?
        <button
          onClick={() => setUpload(true)}
        >
          <PublishIcon
            sx={{
              fontSize: "1.3em"
            }}
          />
        </button> : 
        <></>
      }

      {
        modules.has("edit") ? 
        <Link to="edit">
          <OpenInNewIcon
            sx={{
              fontSize: "1.3em"
            }}
          />
        </Link> : 
        <></>
      }
    </Container>
  )
}

const Container = styled.div`
  position: absolute;
  left: 0;
  transform: translateX(calc(50vw - 50%));
  top: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: rgb(246 250 254);
  border: 0.1px solid rgb(215 218 223);
  border-radius: 5px;
  padding: 0.2em;
  gap: 0.2em;
  button, a, label{
    font-size: 0.9em;
    outline: 0;
    border: 0;
    background-color: transparent;
    color: rgb(24 28 31);
    fill: rgb(24 28 31);
    display: flex;
    align-items: center;
    padding: 0.3em 0.5em;
    cursor: pointer;
    border-radius: 0.3em;
    &.active{
      background-color: rgb(235 238 243);
    }
    &:hover{
      background-color: rgb(235 238 243);
    }
  }
  #default-icon{
    height: 1.3em;
    width: 1.3em;
  }
`

export default CanvasNavbar