import AdminNode from './AdminNode'
import { useContext } from 'react'
import { CanvasContext } from '../hook/CanvasContext'

const AdminNodes = ({ setNodeSelected }) => {
  const { nodes } = useContext(CanvasContext)
  return (
    <>
      {
        nodes && Object.keys(nodes).map((key) => {
          return <AdminNode key={key} id={key}setNodeSelected={setNodeSelected} />
        })
      }
    </>
  )
}

export default AdminNodes