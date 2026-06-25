'use client'
import { Image } from 'antd'
import React from 'react'
import { Button } from '../ui/button'


type TEvent = {
    id: string,
    name: string,
    date: string,
    image: string
}
export default function EventCard({ event }: { event: TEvent }) {
    return (
        <div>
            <div className='flex justify-between items-center border border-[#FFFFFF33]/[0.2]  rounded-2xl p-2'>
                <div className='flex gap-x-3'>
                    <Image src={event.image} alt={event.name} className='rounded !size-[60px]' />
                    <div className='flex flex-col justify-between'>
                        <h5 className='text-[#F6F6F6] lg:text-lg  font-semibold'>{event.name}</h5>
                        <p className='text-[#CBD5E1]'>{event.date}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
