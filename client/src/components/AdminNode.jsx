import { useContext, useEffect, useRef } from 'react'
import { CanvasContext } from '../hook/CanvasContext'

const AdminNode = ({ id, setNodeSelected }) => {

  const {scale, size, position, nodes, setNodes, mouseState, nodeJoin, setNodeJoin} = useContext(CanvasContext)

  const circleRef = useRef()
  const isMoving = useRef(false)

  const handlePointerDown = (e) => {
    if(mouseState === "delete"){
      setNodes(prevNodes => {
        const newNodes = {...prevNodes}
        for(const key of newNodes[id].connections){
          newNodes[key].connections = newNodes[key].connections.filter(con => con !== id)
        }
        delete newNodes[id]
        return newNodes
      })
      return
    }    
    if(mouseState === "default")setNodeSelected(id)
    isMoving.current = (mouseState === "default") ? true : false
  }

  
  useEffect(() => {
    const handlePointerMove = (e) => {
  
      if(isMoving.current){
        const x = (e.clientX - position[0])
        const y = (e.clientY - position[1])
        const midX = size.width / 2
        const midY = size.height / 2
        circleRef.current.attributes.cx.value = (x - midX + midX * scale) / scale
        circleRef.current.attributes.cy.value = (y - midY + midY * scale) / scale
        // updateLines(id, {
        //   x: circleRef.current.attributes.cx.value,
        //   y: circleRef.current.attributes.cy.value
        // })
      }
    }
  
    const handlePointerUp = (e) => {
      if(isMoving.current){
        setNodes(prevNodes => {
          return {
          ...prevNodes,
          [id]: {
            ...prevNodes[id],
            ui: {
              x: circleRef.current.attributes.cx.value,
              y: circleRef.current.attributes.cy.value
            }
          }
          }
        })
      }
      setNodeSelected(false)
      isMoving.current = false
    }
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointermove", handlePointerMove)
    return () => {
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointermove", handlePointerMove)
    }
  }, [position, scale])

  const handleClick = (e) => {
    console.log(nodes)
    if(mouseState === "line"){
      if(!nodeJoin)setNodeJoin(id)
      else {
        if(nodeJoin !== id){
          setNodes(prevNodes => {
            const newNodes = {...prevNodes}

            newNodes[nodeJoin].connections.push(id)
            newNodes[id].connections.push(nodeJoin)

            newNodes[nodeJoin].connections = [...new Set(newNodes[nodeJoin].connections)]
            newNodes[id].connections = [...new Set(newNodes[id].connections)]
            return newNodes
          })
        }
        setNodeJoin(null)
      }
    }if(mouseState === "exit"){
      setNodes(prevNodes => {
        const newNodes = {...prevNodes}
        newNodes[id].isExit = !newNodes[id].isExit
        return newNodes
      })
    }
  }

  return (
    <circle
      ref={circleRef}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      cx={nodes[id].ui.x}
      cy={nodes[id].ui.y}
      r="20"
      fill={nodes[id].isExit ? "blue" : "green" }
      filter={nodeJoin === id ? "url(#glow)" : undefined}
      data-title={id}
    />
  )
}

export default AdminNode