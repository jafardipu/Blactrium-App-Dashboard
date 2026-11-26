"use client";
import AnimatedArrow from "@/components/animatedArrows/AnimatedArrow";
import { handleApiError } from "@/utils/handleApiError";
import { useLoginMutation } from "@/redux/api/authApi";
import { setUser } from "@/redux/features/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input, Flex } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type FieldType = {
  email?: string;
  password?: string;
  remember?: boolean;
};

const LoginForm = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      const rememberMe = Boolean(values?.remember);
      const userData: any = {
        email: values?.email,
        password: values?.password,
        rememberMe,
      };
      const res = await login(userData).unwrap();
      const payload = res?.data ?? res;
      const token = payload?.accessToken || payload?.token;
      const refreshToken = payload?.refreshToken;
      const user = payload?.user ?? null;

      if (token) {
        dispatch(
          setUser({
            user,
            token,
            refreshToken,
            rememberMe,
          }),
        );
      }

      router.push("/");
      toast.success("Login successful");
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <Form
      name="basic"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      autoComplete="off"
      layout="vertical"
      style={{ width: "354px" }}
    >
      <Form.Item<FieldType>
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Please input your email!" },
          {
            type: "email",
            message: "Please enter a valid email address!",
          },
        ]}
      >
        <Input
          size="large"
          className="placeholder:!text-[#818181] placeholder:!text-sm"
          type="email"
          placeholder="User Email"
        />
      </Form.Item>

      <Form.Item<FieldType>
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password
          type="password"
          size="large"
          className="placeholder:!text-[#818181] placeholder:!text-sm login-password"
          placeholder="Password"
        />
      </Form.Item>

      <Form.Item<FieldType> name="remember" valuePropName="checked">
        <Flex justify="space-between" align="center">
          <Checkbox>
            <p className=" font-semibold text-[#696767]">Remember me</p>
          </Checkbox>
          <Link href={"/forget-password"} style={{ textDecoration: "" }}>
            <p className="font-semibold text-[#091A72]">Forgot Password?</p>
          </Link>
        </Flex>
      </Form.Item>

      <Button
        loading={isLoading}
        style={{
          background: "linear-gradient(180deg, #FCB806 0.89%, #1A2935 100.89%)",
          boxShadow: "7px 8px 4.7px 0px rgba(0, 0, 0, 0.08) inset",
        }}
        className="group"
        htmlType="submit"
        size="large"
        block
      >
        {isLoading ? "Signing In..." : "Sign In"}
        <AnimatedArrow size={20} />
      </Button>
    </Form>
  );
};

export default LoginForm;
