"use client";

import { cn } from "@/lib/utils";
import { TAdminUserDetails } from "@/types";
import { Empty, Image, Modal, Skeleton } from "antd";
import moment from "moment";
import { ReactNode, useEffect, useState } from "react";
import { RiCloseLargeLine } from "react-icons/ri";
import UserAvatar from "@/components/shared/UserAvatar";
import CopyableId from "@/components/shared/CopyableId";
import { useGetUserByIdQuery } from "@/redux/api/usersApi";

type TPropsType = {
  open: boolean;
  setOpen: (collapsed: boolean) => void;
  userId?: string | null;
};

const formatStatusLabel = (status?: string | null) => {
  if (!status) return "N/A";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const DetailRow = ({
  label,
  value,
  striped,
  valueClassName,
}: {
  label: string;
  value?: ReactNode;
  striped?: boolean;
  valueClassName?: string;
}) => (
  <div
    className={cn(
      "flex justify-between gap-4 py-3 px-2 border-b",
      striped && "bg-[#21424617]",
    )}
  >
    <h4 className='shrink-0'>{label}</h4>
    <p className={cn("font-medium text-right break-all", valueClassName)}>
      {value ?? "N/A"}
    </p>
  </div>
);

const UserDetails = ({ open, setOpen, userId }: TPropsType) => {
  const [avatarError, setAvatarError] = useState(false);
  const { data, isLoading, isFetching, isError } = useGetUserByIdQuery(userId as string, {
    skip: !open || !userId,
  });

  const user = data?.data as TAdminUserDetails | undefined;
  const loading = isLoading || isFetching;
  const fullName =
    user?.name ||
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    "Unknown User";
  const showAvatarImage = Boolean(user?.avatar) && !avatarError;
  const isSubscriptionDeactivated =
    user?.deactivationReason === "subscription_expired";
  const subscription = user?.subscription ?? null;
  const planTier = subscription?.planTier || user?.planTier || null;
  const deactivatedAt = user?.deactivatedAt
    ? moment(user.deactivatedAt).format("LL")
    : null;

  useEffect(() => {
    setAvatarError(false);
  }, [user?.id, user?.avatar]);

  return (
    <Modal
      open={open}
      footer={null}
      centered={true}
      onCancel={() => setOpen(false)}
      closeIcon={false}
      width={560}
      style={{
        position: "relative",
        padding: "0px",
      }}
    >
      <div className='user-details-scroll bg-[#111827] max-h-[80vh] overflow-y-auto'>
        <div className='flex justify-between items-center sticky top-0 bg-[#111827] z-10 py-1'>
          <div></div>
          <div
            className='size-8 bg-transparent border border-red-500 hover:bg-red-600 rounded-full flex justify-center items-center cursor-pointer group duration-500'
            onClick={() => setOpen(false)}
          >
            <RiCloseLargeLine size={14} className='text-red-600 group-hover:text-red-100 group' />
          </div>
        </div>

        {!userId ? (
          <div className='py-10'>
            <Empty description='No user selected' />
          </div>
        ) : loading ? (
          <div className='py-6 space-y-4'>
            <div className='flex justify-center'>
              <Skeleton.Avatar active size={150} />
            </div>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        ) : isError || !user ? (
          <div className='py-10'>
            <Empty description='User details not found' />
          </div>
        ) : (
          <>
            {isSubscriptionDeactivated ? (
              <div className='mb-4 rounded-xl border border-[#FF484866] bg-[#FF48481A] px-3 py-3 text-sm text-[#FFB4B4]'>
                Deactivated: their
                {planTier ? ` ${planTier}` : ""} subscription expired
                {deactivatedAt ? ` on ${deactivatedAt}` : ""}.
              </div>
            ) : null}

            <div className='w-fit mx-auto relative size-[150px]'>
              {showAvatarImage ? (
                <Image
                  src={user.avatar as string}
                  alt={fullName}
                  width={150}
                  height={150}
                  className='rounded-full object-cover !size-[150px]'
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                  preview={{
                    mask: "Preview",
                    maskClassName: "rounded-full",
                  }}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <UserAvatar
                  src={null}
                  name={fullName}
                  className='!size-[150px] text-4xl'
                  fallbackClassName='text-4xl'
                />
              )}
            </div>

            <div className='mt-8'>
              <DetailRow
                label='User ID'
                value={<CopyableId id={user._id || user.id} />}
                striped
              />
              <DetailRow label='User name' value={fullName} />
              <DetailRow label='Email' value={user.email} striped />
              <DetailRow
                label='Contact Number'
                value={user.contactNumber || user.phone}
              />
              <DetailRow
                label='Country'
                value={
                  user.country ? (
                    <span className='inline-flex items-center gap-2'>
                      {user.country.flag ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.country.flag}
                          alt={user.country.name}
                          className='w-5 h-auto rounded-sm'
                        />
                      ) : null}
                      {user.country.name}
                    </span>
                  ) : (
                    "N/A"
                  )
                }
                striped
              />
              <DetailRow label='Role' value={user.role} valueClassName='capitalize' />
              <DetailRow
                label='Status'
                value={user.status}
                striped
                valueClassName={cn(
                  "capitalize",
                  user.status?.toLowerCase() === "active"
                    ? "text-green-500"
                    : "text-red-500",
                )}
              />
              <DetailRow
                label='Verified'
                value={user.isVerified ? "Yes" : "No"}
              />
              <DetailRow
                label='Legal Terms'
                value={user.isLegalTermsAccepted ? "Accepted" : "Not accepted"}
              />
              <DetailRow
                label='Business Setup'
                value={user.isBusinessProfileSetup ? "Completed" : "Not completed"}
                striped
              />
              <DetailRow
                label='Subscribe Emails'
                value={user.subscribeToEmails ? "Yes" : "No"}
              />
              {user.businessOwnerType ? (
                <DetailRow
                  label='Owner Type'
                  value={user.businessOwnerType}
                  striped
                />
              ) : null}
              <DetailRow
                label='Date of Join'
                value={
                  user.dateOfJoin ? moment(user.dateOfJoin).format("LL") : "N/A"
                }
                striped={!user.businessOwnerType}
              />

              {user.socialLinks && user.socialLinks.length > 0 ? (
                <div className='py-3 px-2 border-b'>
                  <h4 className='mb-2'>Social Links</h4>
                  <div className='space-y-1'>
                    {user.socialLinks.map((link) => (
                      <a
                        key={`${link.platform}-${link.url}`}
                        href={link.url}
                        target='_blank'
                        rel='noreferrer'
                        className='block text-right text-[#FCB806] hover:underline break-all'
                      >
                        {link.platform}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {user.businessProfile ? (
                <>
                  <div className='px-2 pt-4 pb-2'>
                    <h3 className='text-lg font-semibold text-[#cad1d6]'>
                      Business Profile
                    </h3>
                  </div>
                  <DetailRow
                    label='Business Name'
                    value={user.businessProfile.businessName}
                    striped
                  />
                  <DetailRow
                    label='Business Type'
                    value={user.businessProfile.businessType}
                  />
                  <DetailRow
                    label='Category'
                    value={[
                      user.businessProfile.category,
                      user.businessProfile.subCategory,
                    ]
                      .filter(Boolean)
                      .join(" / ")}
                    striped
                  />
                  <DetailRow
                    label='Website'
                    value={
                      user.businessProfile.website ? (
                        <a
                          href={user.businessProfile.website}
                          target='_blank'
                          rel='noreferrer'
                          className='text-[#FCB806] hover:underline'
                        >
                          {user.businessProfile.website}
                        </a>
                      ) : (
                        "N/A"
                      )
                    }
                  />
                  <DetailRow
                    label='Tagline'
                    value={user.businessProfile.tagLine || "N/A"}
                    striped
                  />
                  <DetailRow
                    label='Bio'
                    value={user.businessProfile.bio || "N/A"}
                  />
                  <DetailRow
                    label='Business Status'
                    value={user.businessProfile.status}
                    striped
                    valueClassName='capitalize'
                  />
                  <DetailRow
                    label='Location'
                    value={user.businessProfile.location?.country || "N/A"}
                  />
                </>
              ) : null}

              <div className='px-2 pt-4 pb-2'>
                <h3 className='text-lg font-semibold text-[#cad1d6]'>Subscription</h3>
              </div>

              {!subscription ? (
                <div className='rounded-xl border border-[#FFFFFF33]/[0.2] mx-2 mb-3 px-3 py-4 text-sm text-[#93A4B0]'>
                  No subscription
                  {isSubscriptionDeactivated && deactivatedAt
                    ? ` · expired on ${deactivatedAt}`
                    : ""}
                </div>
              ) : (
                <div className='rounded-xl border border-[#FFFFFF33]/[0.2] mx-2 mb-3 overflow-hidden'>
                  <DetailRow
                    label='Status'
                    value={formatStatusLabel(
                      subscription.status || user.subscriptionStatus,
                    )}
                    striped
                    valueClassName={cn(
                      "capitalize",
                      isSubscriptionDeactivated && "text-[#FF4848]",
                    )}
                  />
                  <DetailRow
                    label='Plan'
                    value={subscription.planName || "N/A"}
                  />
                  <DetailRow
                    label='Plan Tier'
                    value={planTier || "N/A"}
                    striped
                    valueClassName='capitalize'
                  />
                  <DetailRow
                    label='Platform'
                    value={subscription.platform || "N/A"}
                    valueClassName='capitalize'
                  />
                  <DetailRow
                    label='Trial'
                    value={subscription.isTrial ? "Yes" : "No"}
                    striped
                  />
                  <DetailRow
                    label='Auto-renew'
                    value={subscription.willRenew ? "Yes" : "No"}
                  />
                  <DetailRow
                    label='Purchased'
                    value={
                      subscription.purchasedAt
                        ? moment(subscription.purchasedAt).format("LL")
                        : "N/A"
                    }
                    striped
                  />
                  <DetailRow
                    label='Expires'
                    value={
                      subscription.expiresAt
                        ? moment(subscription.expiresAt).format("LL")
                        : user.subscriptionExpiresAt
                          ? moment(user.subscriptionExpiresAt).format("LL")
                          : "N/A"
                    }
                  />
                  {isSubscriptionDeactivated ? (
                    <DetailRow
                      label='Deactivated'
                      value={deactivatedAt || "N/A"}
                      striped
                      valueClassName='text-[#FF4848]'
                    />
                  ) : null}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default UserDetails;
