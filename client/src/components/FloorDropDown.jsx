import React, { useContext, useEffect, useState } from 'react'
import { getDocs, collection } from 'firebase/firestore'
import { get, ref } from 'firebase/database'
import { AuthContext } from '../hook/AuthContext'


const FloorDropDown = ({ floorId, setFloorId}) => {

  // Create a usecontext to reduce api calls to firestore
  const { db } = useContext(AuthContext)
  const [floors, setFloors] = useState([])

  useEffect(() => {
    if(db){
      (async () => {
        const collectionRef = ref(db, "buildings/DF6QbHKTyxHlBnf4MBeZ/floors")
        const collectionSnap = await get(collectionRef)
        const tempFloors = collectionSnap.exists() ? collectionSnap.val() : {}
        setFloors(tempFloors)
      })()
    }
  }, [db])

  useEffect(() => {
    console.log(floors)
  }, [floors])

  return (
    <select defaultValue={floorId} onChange={e => setFloorId(e.target.value)}>
      <option value={""}>Select a floor</option>
      {Object.keys(floors).map(key => <option key={key} value={key}>{floors[key].name}</option>)}
    </select>
  )
}

export default FloorDropDown