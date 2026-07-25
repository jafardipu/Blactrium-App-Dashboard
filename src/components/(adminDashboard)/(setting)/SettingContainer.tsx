"use client";;
import { Tabs, TabsProps } from "antd";
import PrivacyPolicyEditor from "./privacyPolicy/PrivacyPolicyEditor";
import TermsConditionsEditor from "./TermsConditions/TermsConditionsEditor";


const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'Privacy Policy',
    children: <PrivacyPolicyEditor />,
  },
  {
    key: '2',
    label: 'Terms & Conditions',
    children: <TermsConditionsEditor />,
  }
];

const SettingContainer = () => {
  // const [open, setOpen] = useState(false);

  return (
    // <div className='grid grid-cols-1 gap-6'>
    //   {links.map((link, inx) => {
    //     return (
    //       <div key={link.path}>
    //         {link.path === "changePassword" ? (
    //           <div
    //             onClick={() => setOpen(!open)}
    //             className='bg-primary-light-gray shadow-md p-5 rounded flex justify-between items-center cursor-pointer hover:bg-primary-light hover:shadow-lg transition-all duration-200'
    //           >
    //             <div className='flex items-center gap-3'>
    //               {link.icon}
    //               <h4 className='text-text-color font-medium text-lg'>{link.label}</h4>
    //             </div>
    //             <IoIosArrowForward size={18} color='#000' />
    //           </div>
    //         ) : (
    //           <Link key={link.path} href={`/${link.path}`}>
    //             <div className='bg-primary-light-gray shadow-md p-5 rounded flex justify-between items-center hover:bg-primary-light hover:shadow-lg transition-all duration-200'>
    //               <div className='flex items-center gap-3'>
    //                 {link.icon}
    //                 <h4 className='text-text-color font-medium text-lg'>{link.label}</h4>
    //               </div>
    //               <IoIosArrowForward size={18} color='#000' />
    //             </div>
    //           </Link>
    //         )}
    //       </div>
    //     );
    //   })}
    //   <ChangePasswordModal open={open} setOpen={setOpen} />
    // </div>
    <div className="mt-2">
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default SettingContainer;
