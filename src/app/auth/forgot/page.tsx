"use client";

import Image from "next/image";
import Link from "next/link";
import { Input, Flex, Button } from "antd";
import Logo from "@/assets/images/logo.svg";

const Page = () => {
    return (
        <section className="auth">
            <div className="auth__grid">
                <div>
                    <form className="auth__form">
                        <div className="auth__form--field">
                            <label htmlFor="login"></label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email..."
                                size="large"
                            />
                        </div>
                        <Button htmlType="submit" type="primary" size="large" block>Send Password Reset Link</Button>
                        <Flex align="center" justify="center">
                            <Link href="/auth/login" className="auth__forgot">Login to your account from <span>here</span></Link>
                        </Flex>
                    </form>
                </div>
                <div>
                    <div className="auth__banner">
                        <i>
                            <Image src={Logo} alt="COCA"/>
                        </i>
                        <span>Forgot your password?</span>
                        <h1>Reset Password!</h1>
                        <p>Enter your email address to receive a password reset link.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Page;