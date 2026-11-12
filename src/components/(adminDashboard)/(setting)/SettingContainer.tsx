"use client";

import { Tabs, TabsProps } from "antd";
import LegalContentEditor from "./LegalContentEditor";

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "Privacy Policy",
    children: <LegalContentEditor contentType='privacy' title='Privacy Policy' />,
  },
  {
    key: "2",
    label: "Terms & Conditions",
    children: <LegalContentEditor contentType='terms' title='Terms & Conditions' />,
  },
  {
    key: "3",
    label: "About Us",
    children: <LegalContentEditor contentType='about' title='About Us' />,
  },
  {
    key: "4",
    label: "Mission",
    children: <LegalContentEditor contentType='mission' title='Mission' />,
  },
];

const SettingContainer = () => {
  return (
    <div className='mt-2'>
      <Tabs defaultActiveKey='1' items={items} />
    </div>
  );
};

export default SettingContainer;
