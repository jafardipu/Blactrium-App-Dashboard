"use client";

import { Button, ConfigProvider, Form, Input, Skeleton } from "antd";
import Image from "next/image";
import { FiEdit } from "react-icons/fi";
import { useEffect, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/redux/api/profileApi";
import { TAdminProfile } from "@/types";
import { getNameInitials } from "@/components/shared/UserAvatar";
import { handleUpload } from "@/utils/handleUpload";
import { handleApiError } from "@/utils/handleApiError";
import { Success_model } from "@/lib/utils";

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
};

const PersonalInformationContainer = () => {
  const [form] = Form.useForm<ProfileFormValues>();
  const [edit, setEdit] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { data, isLoading } = useGetProfileQuery(undefined);
  const [updateProfile] = useUpdateProfileMutation();
  const user = data?.data as TAdminProfile | undefined;

  const firstName = user?.firstName || "Admin";
  const displayAvatar = imageUrl || user?.profileAvatar || null;
  const showAvatarImage = Boolean(displayAvatar) && !avatarError;

  useEffect(() => {
    setAvatarError(false);
  }, [displayAvatar]);

  useEffect(() => {
    if (!user) return;

    form.setFieldsValue({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  }, [user, form]);

  const clearSelectedImage = () => {
    if (imageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
    setSelectedFile(null);
    setImageUrl(null);
  };

  const handleProfileUpdate = async (values: ProfileFormValues) => {
    if (!user) return;

    try {
      setIsSaving(true);

      let profileAvatar = user.profileAvatar || undefined;
      if (selectedFile) {
        profileAvatar = await handleUpload(selectedFile);
      }

      const body: {
        firstName: string;
        lastName: string;
        phone: string;
        country: string;
        interest: string[];
        profileAvatar?: string;
      } = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: (values.phone || "").trim(),
        country: user.countryId?.countryCode || "",
        interest: user.interest || [],
      };

      if (profileAvatar) {
        body.profileAvatar = profileAvatar;
      }

      await updateProfile(body).unwrap();
      Success_model({ title: "Profile updated successfully" });
      clearSelectedImage();
      setEdit(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];

    if (file) {
      if (imageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
      setAvatarError(false);
      setImageUrl(URL.createObjectURL(file));
      setSelectedFile(file);
    } else {
      clearSelectedImage();
    }

    input.value = "";
  };

  if (isLoading) {
    return (
      <div className='mt-10 flex justify-center'>
        <Skeleton active avatar paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div>
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-3'>
          <h4 className='text-2xl font-medium text-text-color'>Personal Information</h4>
        </div>
        <div className={edit ? "hidden" : ""}>
          <Button
            style={{
              backgroundColor: "var(--color-main)",
              border: "none",
            }}
            onClick={() => setEdit(true)}
            size='large'
            icon={<FiEdit />}
          >
            Edit Profile
          </Button>
        </div>
      </div>
      <hr className='my-4' />

      <div className='mt-10 flex justify-center flex-col xl:flex-row items-center gap-10'>
        <div className='bg-primary-light-gray h-[365px] md:w-[350px] rounded-xl border border-main-color flex justify-center items-center text-text-color px-4'>
          <div className='flex flex-col items-center gap-3 w-full'>
            <div className='relative size-36 shrink-0 group'>
              {showAvatarImage ? (
                <Image
                  src={displayAvatar as string}
                  alt={firstName}
                  width={1200}
                  height={1200}
                  className='size-36 rounded-full object-cover'
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className='size-36 rounded-full bg-[#FCB806]/20 text-[#FCB806] flex items-center justify-center text-3xl font-semibold'>
                  {getNameInitials(firstName)}
                </div>
              )}

              {selectedFile && imageUrl ? (
                <button
                  type='button'
                  className='absolute left-2 top-2 cursor-pointer rounded-md bg-white/90 p-1 opacity-0 duration-300 group-hover:opacity-100'
                  onClick={clearSelectedImage}
                >
                  <Trash2 size={18} color='red' />
                </button>
              ) : null}

              <input
                type='file'
                id='fileInput'
                className='hidden'
                onChange={handleFileChange}
                accept='image/*'
                disabled={!edit}
              />

              {edit ? (
                <label
                  htmlFor='fileInput'
                  className='absolute bottom-1 right-1 cursor-pointer z-10'
                >
                  <div className='bg-white text-black p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors'>
                    <Camera size={18} />
                  </div>
                </label>
              ) : null}
            </div>
            <h3 className='text-2xl text-center max-w-full truncate px-2'>{firstName}</h3>
          </div>
        </div>

        <div className='w-2/4'>
          <ConfigProvider
            theme={{
              components: {
                Input: {
                  colorBgContainer: "var(--color-primary-light-gray)",
                  colorBgContainerDisabled: "var(--color-primary-light-gray)",
                  colorText: "#fff",
                  colorTextDisabled: "#fff",
                  colorTextPlaceholder: "#000",
                },
                Form: {
                  labelColor: "#fff",
                },
              },
            }}
          >
            <Form
              form={form}
              onFinish={handleProfileUpdate}
              layout='vertical'
              style={{ marginTop: "25px" }}
            >
              <Form.Item
                label='First Name'
                name='firstName'
                rules={[{ required: true, message: "First name is required" }]}
              >
                <Input size='large' placeholder='Enter first name' readOnly={!edit} />
              </Form.Item>

              <Form.Item
                label='Last Name'
                name='lastName'
                rules={[{ required: true, message: "Last name is required" }]}
              >
                <Input size='large' placeholder='Enter last name' readOnly={!edit} />
              </Form.Item>

              <Form.Item label='Email' name='email'>
                <Input
                  size='large'
                  placeholder='Enter email'
                  disabled
                  className='!cursor-not-allowed !text-white !bg-[var(--color-primary-light-gray)] disabled:!bg-[var(--color-primary-light-gray)] disabled:!text-white'
                  style={{
                    cursor: "not-allowed",
                    color: "#fff",
                    backgroundColor: "var(--color-primary-light-gray)",
                  }}
                />
              </Form.Item>

              <Form.Item label='Phone Number' name='phone'>
                <Input size='large' placeholder='Enter phone number' readOnly={!edit} />
              </Form.Item>

              <div className={edit ? "" : "hidden"}>
                <Button
                  htmlType='submit'
                  size='large'
                  loading={isSaving}
                  disabled={isSaving}
                  className='w-full hover:!bg-[#FCB806]/90 hover:!text-white'
                  block
                  style={{ border: "none" }}
                >
                  Save Change
                </Button>
              </div>
            </Form>
          </ConfigProvider>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformationContainer;
