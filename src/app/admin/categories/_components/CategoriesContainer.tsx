"use client";
import { useGetCategoriesQuery } from '@/redux/api/categories';
import { Button, Input } from 'antd';
import { Plus } from 'lucide-react';
import Image from 'next/image'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react'

const categoriesData = [
    {
        id: '1',
        title: 'Fashion, Apparel & Accessories',
        subCategory: '12',
        image: "/categories.jpg"
    },
    {
        id: '2',
        title: 'Creative, Media & Entertainment',
        subCategory: '15',
        image: "/categories.jpg"
    },
    {
        id: '3',
        title: 'Marketing, Branding',
        subCategory: '15',
        image: "/categories.jpg"
    },
    {
        id: '4',
        title: 'Technology & Digital Services',
        subCategory: '15',
        image: "/categories.jpg"
    },
    {
        id: '5',
        title: 'Health & Wellness',
        subCategory: '15',
        image: "/categories.jpg"
    },
    {
        id: '6',
        title: 'Travel & Tourism',
        subCategory: '15',
        image: "/categories.jpg"
    },
    {
        id: '7',
        title: 'Real Estate',
        subCategory: '15',
        image: "/categories.jpg"
    },
    {
        id: '8',
        title: 'Food & Beverage',
        subCategory: '15',
        image: "/categories.jpg"
    },
    {
        id: '9',
        title: 'Health & Wellness',
        subCategory: '15',
        image: "/categories.jpg"
    },
    {
        id: '10',
        title: 'Travel & Tourism',
        subCategory: '15',
        image: "/categories.jpg"
    }, {
        id: '11',
        title: 'Real Estate',
        subCategory: '15',
        image: "/categories.jpg"
    },
    {
        id: '12',
        title: 'Food & Beverage',
        subCategory: '15',
        image: "/categories.jpg"
    }
]

export default function CategoriesContainer() {
    const router = useRouter();
    const queries: Record<string, string | number> = {};
    const {data, isLoading} = useGetCategoriesQuery(queries);
    return (
        <div>
            <div className='flex justify-between items-center mb-5'>
                <Input.Search placeholder="Search Category" size='large' className='max-w-[400px]' />
                <Link href="/admin/categories/add-category">
                    <Button type="primary" size='large' icon={<Plus />} className='bg-gradient-to-t from-[#E6CA6E] to-[#775806]'>Add Category</Button>
                </Link>
            </div>
            <div className='border border-[#3D3D3D] rounded-xl px-5 py-3 pb-5'>
                <h3 className='text-[#93A4B0] text-xl font-semibold mb-3'>All Categories</h3>
                <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                    {
                        categoriesData.map((category) => (
                            <div  onClick={() => router.push(`/admin/categories/${category.id}`)} className='flex flex-col items-center gap-3 border border-[#FFFFFF33]/[0.2] rounded-2xl relative cursor-pointer' key={category.id}>
                                <Image src={category.image} alt={category.title} width={1200} height={1200} className='rounded-2xl' />
                                <div className='absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#1f1d1d]/90 to-transparent py-2 px-4 space-y-1 rounded-2xl'>
                                    <h5 className='text-[#F6F6F6] lg:text-xl max-w-[200px]  font-medium'>{category.title}</h5>
                                    <p className='text-[#CBD5E1] text-lg'>{category.subCategory} Sub Categories</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}
