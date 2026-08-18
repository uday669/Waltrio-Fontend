import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar.jsx'
import '../assets/css/dashboard.css'

export default function MainLayout() {
  return (
    <>
    <Sidebar/>
     <Outlet/> 
    </>
  )
}
