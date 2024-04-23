import AdminNode from './AdminNode'
import { useContext } from 'react'
import { CanvasContext } from '../hook/CanvasContext'

const AdminNodes = ({ setNodeSelected, setEditingNode, setEditNode }) => {
  const { nodes } = useContext(CanvasContext)
  return (
    <>
      {
        nodes && Object.keys(nodes).map((key) => {
          return <AdminNode key={key} id={key} setNodeSelected={setNodeSelected} setEditingNode={setEditingNode} setEditNode={setEditNode} />
        })
      }
    </>
  )
}

export default AdminNodes