import React from 'react'
import { useRoutes } from 'react-router-dom'
import Navigation from './components/Navigation'
import ViewCars from './pages/ViewCars'
import EditCar from './pages/EditCar'
import CreateCar from './pages/CreateCar'
import CarDetails from './pages/CarDetails'
import './App.css'

const App = () => {
  let element = useRoutes([
    {
      path: '/',
      element: <CreateCar title='FERRARI FLASH | Customize' />
    },
    {
      path:'/customcars',
      element: <ViewCars title='FERRARI FLASH | Custom Cars' />
    },
    {
      path: '/customcars/:id',
      element: <CarDetails title='FERRARI FLASH | View' />
    },
    {
      path: '/edit/:id',
      element: <EditCar title='FERRARI FLASH | Edit' />
    }
  ])

  return (
    <div className='app'>

      <Navigation />

      { element }

    </div>
  )
}

export default App