import React from 'react'
import { useParams } from 'react-router-dom'
import { MySidebar } from '../sidebar/Sidebar';

export const Connector = () => {
    const { id } = useParams();

  return (
   <>
    <MySidebar/>
   </>
  )
}
