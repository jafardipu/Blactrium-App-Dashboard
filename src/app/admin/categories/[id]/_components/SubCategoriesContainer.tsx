"use client";
import { Button, Input } from 'antd';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const subCategoryData = [
    {
        id: "1",
        name: "Restaurants",
    },
    {
        id: "2",
        name: "Cafés / Coffee Shops",
    },
    {
        id: "3",
        name: "Caterers",
    }, {
        id: "4",
        name: "Food Trucks",
    },
    {
        id: "5",
        name: "Bakers / Pastry Shops",
    },
    {
        id: "6",
        name: "Bars / Nightlife ",
    }
]

export default function SubCategoriesContainer() {
    return (
        <div>
            <div className='flex justify-between items-center mb-5'>
                <Input.Search placeholder="Search Category" size='large' className='max-w-[400px]' />
                <Link href={`/admin/categories/${1}/add-sub-category`}>
                    <Button type="primary" size='large' icon={<Plus />} className='bg-gradient-to-t from-[#E6CA6E] to-[#775806]'>Add Sub Category</Button>
                </Link>
            </div>
            <div className='space-y-4'>
                {
                    subCategoryData.map((category) => (
                        <div className='border border-[#FFFFFF33]/[0.2] p-3 rounded-xl' key={category.id}>
                            <h4 className='text-xl text-white font-semibold'>{category.name}</h4>
                            <p className='text-[#CBD5E1]' >Discover {category.name} near you</p>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
