import React, { useContext, useEffect, useState } from 'react'
import { getDocs, collection } from 'firebase/firestore'
import { AuthContext } from '../hook/AuthContext'


const FloorDropDown = ({ floorId, setFloorId}) => {

  // Create a usecontext to reduce api calls to firestore
  const { db } = useContext(AuthContext)
  const [floors, setFloors] = useState([])

  useEffect(() => {
    if(db){
      (async () => {
        const collectionRef = collection(db, "buildings", "DF6QbHKTyxHlBnf4MBeZ", "floors")
        const collectionSnap = await getDocs(collectionRef)
        setFloors(collectionSnap.docs.map(doc => {return {
          ...doc.data(),
          id: doc.id
        }}))
      })()
    }
  }, [db])
  return (
    <select defaultValue={floorId} onChange={e => setFloorId(e.target.value)}>
      <option value={""}>Select a floor</option>
      {floors.map(floor => <option key={floor.id} value={floor.id}>{floor.name}</option>)}
    </select>
  )
}

export default FloorDropDown