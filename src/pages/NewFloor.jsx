import { useRef, useState} from "react"
import { CanvasContext } from "../hooks/CanvasContext"
import styled from "styled-components"
import Canvas from '../components/Canvas'
import Upload from '../components/Upload'
import CanvasNavbar from "../components/CanvasNavbar"
import UpdateNodeData from "../components/UpdateNodeData"

const NewFloor = () => {
  const stageRef = useRef()
  const [state, setState] = useState("")
  const [nodes, setNodes] = useState(new Map())
  const [connections, setConnections] = useState([])
  const [prevSelectedNode, setPrevSelectedNode] = useState(null)
  const [floorId, setFloorId] = useState(null)
  const [canvasIsDraggable, setCanvasIsDraggable] = useState(true)
  const [upload, setUpload] = useState(false)
  const [updateNode, setUpdateNode] = useState()

  return (
    <Container>
      <CanvasContext.Provider value={{stageRef, floorId, setFloorId, state, setState, nodes, setNodes, connections, setConnections, prevSelectedNode, setPrevSelectedNode, canvasIsDraggable, setCanvasIsDraggable, upload, setUpload, updateNode, setUpdateNode  }}>
        <Canvas edit={true}/>
        <CanvasNavbar modulesAllowed={[
          "lock",
          "default",
          // "fire",
          "create",
          "connect",
          "delete",
          "exit",
          "update",
          "photo",
          "center",
          "upload",
          // "edit"
        ]}/>
        {upload ? <Upload /> : <></>}
        {updateNode ? <UpdateNodeData /> : <></>}
      </CanvasContext.Provider>
    </Container>
  )
}

const Container = styled.div`
  position: relative;
`

export default NewFloor