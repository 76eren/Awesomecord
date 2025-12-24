import "./login.css";
import * as React from "react";
import {useState} from "react";
import grapeHyacinth from "../../assets/grape-hyacinth.jpg";
import {loginUser} from "../../services/auth-service.ts";
import {toast} from "react-toastify";
import type {UserLoginModel} from "../../models/user/user-login.model.ts";

export default function Login() {

    const [form, setForm] = useState(
        {
            username: "",
            password: "",
        }
    );

    const handleChange = (e
    ) => {
        const fieldName = e.target.name;
        const fieldValue = e.target.value;

        setForm((prevForm) => ({
            ...prevForm,
            [fieldName]: fieldValue,
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submitLogin();
    };

    const submitLogin = async () => {
        let loginUserModel: UserLoginModel;
        loginUserModel = {
            HandleOrEmail: form.username,
            Password: form.password
        };

        try {
            const user = await loginUser(loginUserModel);
            toast.success("Registered user " + user.userHandle + " successfully!");
            setTimeout(() => {
                window.location.href = "/login";
            }, 700);
        } catch (error: any) {
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen w-screen bg-gray-800">
            <div
                className="hidden md:block md:w-2/3 bg-cover bg-center"
                style={{backgroundImage: `url(${grapeHyacinth})`}}
                aria-hidden="true"
            />
            <div className="w-full md:w-1/3 flex flex-col justify-center items-center min-h-screen bg-gray-800">
                <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-3xl font-bold text-white">Login</h2>

                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label htmlFor="Username or email" className="block text-sm font-medium text-white">
                                Username*
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={form.username}
                                onChange={handleChange}
                                required
                                autoComplete="username"
                                className="w-full px-4 py-2 mt-2 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white">
                                Password*
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                                className="w-full px-4 py-2 mt-2 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-800"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

}