import { useContext } from 'react'
import { Line } from 'react-konva'
import { CanvasContext } from '../hooks/CanvasContext'

const ConnectedLines = ({ connectionData }) => {
  const { nodes } = useContext(CanvasContext)
  const { connectedNodes } = connectionData
  const firstNode = nodes.get(connectedNodes[0].name)
  const secondNode = nodes.get(connectedNodes[1].name)

  // Make sure to update the connections state array, also add the whole nodeData instead of just what's needed

  return (!(connectionData?.operation === "delete" || connectionData?.operation === "hide") ?
    <>
      <Line points={[firstNode.ui.x, firstNode.ui.y, firstNode.ui.x, secondNode.ui.y]} stroke="black" strokeWidth={1}/>
      <Line points={[secondNode.ui.x, secondNode.ui.y, firstNode.ui.x, secondNode.ui.y]} stroke="black" strokeWidth={1}/>
    </> : <></>
  )
}

export default ConnectedLines