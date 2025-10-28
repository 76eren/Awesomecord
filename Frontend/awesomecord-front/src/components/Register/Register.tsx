import grapeHyacinth from "../../assets/grape-hyacinth.jpg";
import * as React from "react";
import {useState} from "react";
import type {UserCreateModel} from "../../Models/User/userCreate.model.ts";
import {registerUser} from "../../services/authService.ts";
import {toast} from "react-toastify";

export default function Register() {

    const [form, setForm] = useState(
        {
            userhandle: "",
            displayname: "",
            password: "",
            email: "",
            firstName: "",
            lastName: "",
            phone: "",
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
        submitRegister();
    };

    const submitRegister = async () => {
        let createUserModel: UserCreateModel;
        createUserModel = {
            UserHandle: form.userhandle,
            DisplayName: form.displayname,
            Bio: "",
            Email: form.email,
            FirstName: form.firstName,
            LastName: form.lastName,
            Phone: form.phone,
            PasswordHash: form.password
        };

        try {
            const user = await registerUser(createUserModel);
            toast.success("Registered user " + user.userHandle + " successfully!");
            setTimeout(() => {
                window.location.href = "/login";
            }, 700);
        } catch (error: any) {
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row min-h-screen w-screen bg-gray-800">
                <div
                    className="hidden md:block md:w-2/3 bg-cover bg-center"
                    style={{backgroundImage: `url(${grapeHyacinth})`}}
                    aria-hidden="true"
                />
                <div className="w-full md:w-1/3 flex flex-col justify-center items-center min-h-screen bg-gray-800">
                    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
                        <h2 className="text-3xl font-bold text-white">Register account</h2>

                        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                            <div>
                                <label htmlFor="userhandle" className="block text-sm font-medium text-white">
                                    User handle*
                                </label>
                                <input
                                    id="userhandle"
                                    name="userhandle"
                                    type="text"
                                    value={form.userhandle}
                                    onChange={handleChange}
                                    required
                                    autoComplete="username"
                                    className="w-full px-4 py-2 mt-2 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="displayname" className="block text-sm font-medium text-white">
                                    Display name*
                                </label>
                                <input
                                    id="displayname"
                                    name="displayname"
                                    type="text"
                                    value={form.displayname}
                                    onChange={handleChange}
                                    required
                                    autoComplete="displayname"
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

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-white">
                                    Email*
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    className="w-full px-4 py-2 mt-2 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-white">
                                    First name*
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    autoComplete="given-name"
                                    className="w-full px-4 py-2 mt-2 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-white">
                                    Last name*
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    autoComplete="family-name"
                                    className="w-full px-4 py-2 mt-2 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-white">
                                    Phone number
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    value={form.phone}
                                    onChange={handleChange}
                                    autoComplete="phone"
                                    className="w-full px-4 py-2 mt-2 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-800"
                            >
                                Create an account
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );

}