import React from 'react'
import UserTable from './_component/UserTable'
import { Tabs, TabsProps } from 'antd';
import OrganizerTable from './_component/OrganizerTable';
import MarchentTable from './_component/MarchentTable';


const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'Users',
    children: <UserTable />,
  },
  {
    key: '2',
    label: 'Business Owners',
    children: <OrganizerTable />,
  },
  {
    key: '3',
    label: 'Marchents',
    children: <MarchentTable />,
  },
];

export default function page() {
  return <Tabs defaultActiveKey="1" items={items}/>
}
