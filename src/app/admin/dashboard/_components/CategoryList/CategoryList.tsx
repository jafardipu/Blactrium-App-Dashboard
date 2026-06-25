import EventCard from '@/components/cards/EventCard'
import React from 'react'

const eventList = [
    {
        id: '1',
        name: 'Fashion, Apparel & Accessories',
        date: '12 Sub Categories',
        image: "/event_image.png"
    },
    {
        id: '2',
        name: 'Creative, Media & Entertainment ',
        date: '15, December',
        image: "/event_image.png"
    },
    {
        id: '3',
        name: 'Marketing, Branding ',
        date: '15, December',
        image: "/event_image.png"
    },
    {
        id: '4',
        name: 'Technology & Digital Services ',
        date: '15, December',
        image: "/event_image.png"
    },
    {
        id: '5',
        name: 'Creative, Media & Entertainment ',
        date: '15, December',
        image: "/event_image.png"
    },
]

export default function CategoryList() {
    return (
        <div className='xl:col-span-2 border border-[#FFFFFF33]/[0.2]  rounded-2xl p-4'>
            <div className='flex items-center gap-x-2 mb-3'>
                <h4 className='text-xl text-[#cad1d6] font-semibold'>Category List</h4>
                <hr className='flex-1 border-[#FFFFFF33]/[0.2]' />
            </div>
            <div className='space-y-5'>
                {
                    eventList.map((event, index) => (
                        <EventCard key={index} event={event} />
                    ))
                }
            </div>

        </div>
    )
}
