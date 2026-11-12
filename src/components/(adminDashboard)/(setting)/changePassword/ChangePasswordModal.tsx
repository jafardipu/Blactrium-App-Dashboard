"use client";

import { Button, ConfigProvider, Form, Input, Modal } from "antd";
import { RiCloseLargeLine } from "react-icons/ri";
import { Success_model } from "@/lib/utils";
import { handleApiError } from "@/utils/handleApiError";
import { useAppDispatch } from "@/redux/hooks";
import { useChangePasswordMutation } from "@/redux/api/authApi";
import { performLogout } from "@/utils/logout";
import { useRouter } from "next/navigation";

type TPropsType = {
  open: boolean;
  setOpen: (collapsed: boolean) => void;
};

type ChangePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ChangePasswordModal = ({ open, setOpen }: TPropsType) => {
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const router = useRouter();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const dispatch = useAppDispatch();

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    if (values.newPassword !== values.confirmPassword) {
      form.setFields([
        {
          name: "confirmPassword",
          errors: ["New password and re-enter password do not match"],
        },
      ]);
      return;
    }

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();

      Success_model({ title: "Password changed successfully" });
      form.resetFields();
      setOpen(false);
      await performLogout(dispatch);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <Modal
      open={open}
      footer={null}
      centered={true}
      onCancel={() => setOpen(false)}
      closeIcon={false}
      style={{
        minWidth: "max-content",
      }}
    >
      <div className='py-10'>
        <div
          className='size-10 bg-main-color absolute top-2 right-2 rounded-full cursor-pointer flex items-center justify-center'
          onClick={() => setOpen(false)}
        >
          <RiCloseLargeLine size={16} color='#fff' />
        </div>

        <div>
          <h4 className='text-2xl font-medium text-center'>Change Password</h4>
          <p className='mt-1 text-center'>Your password must be 8-10 character long.</p>
        </div>

        <ConfigProvider
          theme={{
            components: {
              Input: {
                colorBgContainer: "",
                colorText: "#000",
                colorTextPlaceholder: "#000",
              },
              Form: {
                labelColor: "var(--color-primary-gray)",
                labelFontSize: 14,
              },
            },
          }}
        >
          <Form
            form={form}
            onFinish={handleSubmit}
            layout='vertical'
            style={{
              maxWidth: 500,
              marginTop: "25px",
            }}
          >
            <Form.Item
              label='Current Password'
              name='currentPassword'
              rules={[{ required: true, message: "Please enter current password" }]}
            >
              <Input.Password
                size='large'
                className='text-white'
                placeholder='Enter current password'
              />
            </Form.Item>

            <Form.Item
              label='New password'
              name='newPassword'
              rules={[
                { required: true, message: "Please enter new password" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
            >
              <Input.Password size='large' className='text-white' placeholder='Set new password' />
            </Form.Item>

            <Form.Item
              label='Re-enter new password'
              name='confirmPassword'
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Please re-enter new password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("New password and re-enter password do not match"),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                size='large'
                className='text-white'
                placeholder='Re-enter new password'
              />
            </Form.Item>

            <Button
              htmlType='submit'
              size='large'
              block
              className='!py-6 border-main-color'
              loading={isLoading}
            >
              Update Password
            </Button>
          </Form>
        </ConfigProvider>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
