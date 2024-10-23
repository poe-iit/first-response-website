import { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import Pagination from '@mui/material/Pagination';
import Log from '../components/Log'
import FilterInput from '../components/FilterInput'
const pageCount = 20

const Logs = () => {
  // In the future 
  const [logs, setLogs] = useState([])
  const [modes, setModes] = useState([])
  const [nodes, setNodes] = useState([])
  const [floors, setFloors] = useState([])
  const [buildings, setBuildings] = useState([])
  const [date, setDate] = useState()
  const currentPage = useRef(1)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const getLogs = () => {
    const query = `
      query($logInput: LogInput) {
        getLogs(logInput: $logInput){
          logs {
            message
            type
            createdAt
            updatedAt
            id
            priority
            buildings {
              name
            }
            floors {
              name
            }
            nodes {
              name
            }
          }
          totalCount
        }
      }
    `
  
    const variables = {
      logInput: {
        nodes,
        floors,
        buildings,
        status: modes,
        page: currentPage.current,
        pageCount,
        date
      }
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
        if(res?.data && "getLogs" in res.data){
          setLogs(res.data.getLogs?.logs || [])
          setTotalCount(res.data.getLogs.totalCount)
        }
      }
    ) 
  }

  const handleDateSort = () => {
    // Assume it is always ascendinf except explicitly stated
    // So date is -1 except it's 1
    if(date === 1)setDate(-1)
    else setDate(1)
  }

  const handlePageChange = (e, value) => {
    setPage(value)
    currentPage.current = value
    getLogs()
  }

  useEffect(() => {
    getLogs()
  }, [])

  useEffect(() => {
    if(isNaN(date))return
    getLogs()
  }, [date])

  return (
    <Container>
      {/* <QueryInput /> */}
      <div className='log-filter'>
        <h3>Filter</h3>
        <h4>Select Status</h4>
        <FilterInput updateFunc={setModes} dataList={modes} header="status" />
        <br></br>
        <h4>Select which model you want to see</h4>
        <div className="log-filter-model">
          <p>Nodes</p>
          <FilterInput updateFunc={setNodes} dataList={nodes} header="nodes" />
          <br/>
          <p>Floors</p>
          <FilterInput updateFunc={setFloors} dataList={floors} header="floors" />
          <br/>
          <p>Buildings</p>
          <FilterInput updateFunc={setBuildings} dataList={buildings} header="buildings" />
        </div>
        <button className='filter-button' onClick={
          () => {
            currentPage.current = 1
            setPage(1)
            getLogs()
          }
        }>Apply Filter</button>
      </div>
      <div className='log-container'>
        <div className='log-header'>
          <p className='status'>Status</p>
          <p className='date'>Date {<button onClick={handleDateSort}>{date === 1 ? "Desc" : "Asc"}</button>}</p>
          <p className='log'>Log</p>
        </div>
        {
          logs.map((log, idx) => 
            <Log {...log} key={idx} />
          )
        }
      </div>
      <Pagination count={Math.ceil(totalCount / pageCount) } page={page} shape="rounded" onChange={handlePageChange} />
    </Container>
  )
}

const Container = styled.div`
  padding: 1em;
  .log-container {
    p {
      margin: 0 0.1em;
    }
    .log{
      grid-column: 3 / span 4;
    }
    .log-header {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      padding: 0.5em;
      border-bottom: 1px solid #c6c6c6;
      .date{
        display: inline-flex;
        justify-content: space-between;
      }
    }
  }
  .log-filter{
    .filter-button{
      margin: 0.5em 0;
      background-color: #3a3aff;
      color: white;
      font-size: 0.9em;
      border-radius: 0.3em;
      outline: 0;
      border: 0;
      padding: 0.4em;
      cursor: pointer;
    }
  }
`

export default Logs