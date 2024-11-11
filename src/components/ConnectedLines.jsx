import { useContext } from 'react'
import { Line } from 'react-konva'
import { CanvasContext } from '../hooks/CanvasContext'

const ConnectedLines = ({ firstNodeName, secondNodeName }) => {
  const { nodes } = useContext(CanvasContext)
  const firstNode = nodes.get(firstNodeName)
  const secondNode = nodes.get(secondNodeName)

  // Make sure to update the connections state array, also add the whole nodeData instead of just what's needed

  return ((secondNode && firstNode) ?<>
    <Line points={[firstNode.ui.x, firstNode.ui.y, firstNode.ui.x, secondNode.ui.y]} stroke="black" strokeWidth={1}/>
    <Line points={[secondNode.ui.x, secondNode.ui.y, firstNode.ui.x, secondNode.ui.y]} stroke="black" strokeWidth={1}/>
  </> : null)
}

export default ConnectedLines