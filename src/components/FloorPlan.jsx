import { useEffect, useRef, useState} from "react"
import { useParams } from "react-router-dom"
import { CanvasContext } from "../hooks/CanvasContext"
import styled from "styled-components"
import Canvas from '../components/Canvas'
import Upload from '../components/Upload'
import CanvasNavbar from "../components/CanvasNavbar"


const FloorPlan = ({ floor }) => {
  const id = floor?.id
  const stageRef = useRef()

  const nodeArr = floor?.nodes || []
  const mappedNodes = new Map()
  for(const node of nodeArr){
    if(node?.name)mappedNodes.set(node.name, node)
  }

  const [state, setState] = useState("")
  const [nodes , setNodes] = useState(new Map())
  const [connections, setConnections] = useState([])
  const [prevSelectedNode, setPrevSelectedNode] = useState(null)
  const [floorId, setFloorId] = useState(id)
  const [canvasIsDraggable, setCanvasIsDraggable] = useState(true)
  const [upload, setUpload] = useState(false)
  const [nodeStates, setNodeStates] = useState(new Map())
  const [image, setImage] = useState(null)
  const [imageMeta, setImageMeta] = useState({width: 0, height: 0})

  // Update nodes when the floor prop changes
  useEffect(() => {
    const nodeArr = floor?.nodes || []
    const mappedNodes = new Map()
    for (const node of nodeArr) {
      if (node?.name) mappedNodes.set(node.name, node)
    }
    setNodes(mappedNodes)
    setImage({
      name: floor?.image?.name,
      url: floor?.image?.url,
      position: floor?.image?.position,
      initialUrl: floor?.image?.url,
      scale: floor?.image?.scale,
    })
  }, [floor])

  
  return (
    <Container>
      <CanvasContext.Provider value={{stageRef, floorId, setFloorId, state, setState, nodes, setNodes, connections, setConnections, prevSelectedNode, setPrevSelectedNode, canvasIsDraggable, setCanvasIsDraggable, upload, setUpload, nodeStates, setNodeStates, image, setImage, imageMeta, setImageMeta  }}>
        <Canvas />
        <CanvasNavbar modulesAllowed={[
          "lock",
          // "default",
          "fire",
          // "create",
          // "connect",
          // "delete",
          // "exit",
          // "update",
          // "photo",
          "center",
          "upload",
          "edit"
        ]}/>
        {upload ? <Upload /> : <></>}
      </CanvasContext.Provider>
    </Container>
  )
}

const Container = styled.div`
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export default FloorPlan