import { useEffect, useRef, useState} from "react"
import { useParams } from "react-router-dom"
import { CanvasContext } from "../hooks/CanvasContext"
import styled from "styled-components"
import Canvas from '../components/Canvas'
import Upload from '../components/Upload'
import CanvasNavbar from "../components/CanvasNavbar"
import UpdateNodeData from "../components/UpdateNodeData"

const Floor = () => {
  const { id } = useParams()
  const stageRef = useRef()
  const [state, setState] = useState("default")
  const [nodes, setNodes] = useState(new Map())
  const [connections, setConnections] = useState([])
  const [prevSelectedNode, setPrevSelectedNode] = useState(null)
  const [floorId, setFloorId] = useState(id)
  const [canvasIsDraggable, setCanvasIsDraggable] = useState(true)
  const [upload, setUpload] = useState(false)
  const [updateNode, setUpdateNode] = useState()

  
  const getFloorPlan = (floorId) => {
    const query = `
      query($floorId: ID!){
        getFloorPlan(id: $floorId) {
          id
          name
          nodes {
            id
            name
            state
            isExit
            ui {
              x
              y
            }
          }
          invisibleNodes {
            id
            connectedNodes {
              id
              name
              ui {
                x
                y
              }
            }
          }
        }
      }
    `

    const variables = {
      floorId
    }

    fetch(`${import.meta.env.VITE_SERVER_URI}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ query, variables })
    }).then(
      res => res.json()
    ).then(
      res => {
        console.log(res.data)
        if(res?.data?.getFloorPlan){
          const nodes = res.data.getFloorPlan.nodes
          const mappedNodes = new Map()
          for(const node of nodes)mappedNodes.set(node.name, node)
          setNodes(mappedNodes)
          setConnections(res.data.getFloorPlan.invisibleNodes)
          setPrevSelectedNode(null)
        }
      }
    ).catch(
      err => {
        console.log(err)
      }
    )
  }

  useEffect(() => {
    getFloorPlan(id)
  }, [])

  useEffect(() => {
    console.log(connections)
  }, [connections])

  return (
    <Container>
      <CanvasContext.Provider value={{stageRef, floorId, setFloorId, state, setState, nodes, setNodes, connections, setConnections, prevSelectedNode, setPrevSelectedNode, canvasIsDraggable, setCanvasIsDraggable, upload, setUpload, updateNode, setUpdateNode  }}>
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
        {updateNode ? <UpdateNodeData /> : <></>}
      </CanvasContext.Provider>
    </Container>
  )
}

const Container = styled.div`
  position: relative;
`

export default Floor