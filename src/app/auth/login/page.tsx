"use client";

import Image from "next/image";
import Link from "next/link";
import { Input, Checkbox, Flex, Button, Space } from "antd";
import { Eye, EyeSlash, At, LockOpen } from "@phosphor-icons/react";
import Logo from "@/assets/images/logo.svg";

const Page = () => {
    return (
        <section className="auth">
            <div className="auth__grid">
                <div>
                    <form className="auth__form">
                        <Space direction="vertical" size="large">
                            <div className="auth__form--field">
                                <label htmlFor="login"></label>
                                <Input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email..."
                                    size="large"
                                    prefix={<At size={22} />}
                                />
                            </div>
                            <div className="auth__form--field">
                                <label htmlFor="login"></label>
                                <Input.Password
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password..."
                                    size="large"
                                    prefix={<LockOpen size={22} />}
                                    iconRender={(visible) => visible
                                    ? <EyeSlash size={22} />
                                    : <Eye size={22} />}
                                />
                            </div>
                        </Space>
                        <Flex align="center" justify="space-between">
                            <Checkbox>Remember Me</Checkbox>
                            <Link href="/auth/forgot" className="auth__forgot">Forgot Password?</Link>
                        </Flex>
                        <Button htmlType="submit" type="primary" size="large" block>Sign In</Button>
                    </form>
                </div>
                <div>
                    <div className="auth__banner">
                        <i>
                            <Image src={Logo} alt="COCA"/>
                        </i>
                        <span>Sign in to your account</span>
                        <h1>Welcome back!</h1>
                        <p>Please sign in to your account by completing the necessary fields below.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Page;