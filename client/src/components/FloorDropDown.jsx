import React, { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, getDocs, collection } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_CONFIG_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_CONFIG_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_CONFIG_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_CONFIG_STORAGE_BUCKET,
  messagingSenderId:import.meta.env.VITE_FIREBASE_CONFIG_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_CONFIG_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_CONFIG_MEASUREMENT_ID
};


const FloorDropDown = ({ floorId, setFloorId}) => {

  // Create a usecontext to reduce api calls to firestore
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  const [floors, setFloors] = useState([])

  const getFloors = async () => {
    const collectionRef = collection(db, "floors")
    const collectionSnap = await getDocs(collectionRef)
    setFloors(collectionSnap.docs.map(doc => {return {
      ...doc.data(),
      id: doc.id
    }}))
  }

  useEffect(() => {
    getFloors()
  }, [])
  return (
    <select defaultValue={floorId} onChange={e => setFloorId(e.target.value)}>
      <option value={""}>Select a floor</option>
      {floors.map(floor => <option key={floor.id} value={floor.id}>{floor.name}</option>)}
    </select>
  )
}

export default FloorDropDown