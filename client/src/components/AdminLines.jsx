import { useContext, useEffect, useState } from 'react'
import { CanvasContext } from '../hook/CanvasContext'

const AdminLines = () => {
  const { nodes, setNodes, mouseState } = useContext(CanvasContext)
  const [lines, setLines] = useState([])
  
  useEffect(() => {
    if(Object.keys(nodes).length === 0) {
      setLines([])
      return
    }
    const set = new Set()
    const connections = []

    const handleClick = (e) => {
      const [id, key] = e.target.dataset.key.split(" -> ")
      if(mouseState === "delete"){
        console.log(id, key, "deleting line")
        setNodes(prevNodes => {
          const newNodes = {...prevNodes}
          newNodes[key].connections = newNodes[key].connections.filter(con => con !== id)
          newNodes[id].connections = newNodes[id].connections.filter(con => con !== key)
          return newNodes
        })
      }
      console.log(e)
    }

    for(const id1 in nodes){
      for(const id2 of nodes[id1].connections){
        if(set.has(id1 + " -> " + id2)) continue
        const nodeStart = nodes[id1]
        const nodeEnd  = nodes[id2]
        connections.push(<line
          key={id1 + " -> " + id2}
          x1={nodeStart.ui.x} 
          y1={nodeStart.ui.y} 
          x2={nodeEnd.ui.x} 
          y2={nodeEnd.ui.y}
          className='admin-line'
          data-key={id1 + " -> " + id2}
          stroke="transparent"
          strokeWidth={15}
          onClick={handleClick}
        />)
        connections.push(<line
          key={id2 + " -> " + id1}
          x1={nodeStart.ui.x} 
          y1={nodeStart.ui.y} 
          x2={nodeEnd.ui.x} 
          y2={nodeEnd.ui.y}
          className='admin-line'
          data-key={id1 + " -> " + id2}
          stroke="black"
          onClick={handleClick}
        />)
        set.add(id1 + " -> " + id2)
        set.add(id2 + " -> " + id1)
      }
    }

    setLines(connections)
  }, [nodes])

  return (
    <>
      {
        lines
      }
    </>
  )
}

export default AdminLines