import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { doLogin } from '../store/slices/auth-thunk';

const Login = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const token = useAppSelector((state) => state.auth.token);
    const isRehydrated = useAppSelector((state) => state.auth._persist.rehydrated);
    const { register, handleSubmit, formState: { errors } } = useForm();

    useEffect(() => {
        if (!isRehydrated) {
            return;
        }
        if (token) {
            navigate('/', { replace: true });
        }
    }, [isRehydrated, token, navigate]);

    const onSubmit = (data: any) => {
        dispatch(doLogin({ username: data.username, password: data.password }));
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-10 bg-white rounded shadow-md"
            >
                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                        id="username"
                        type="text"
                        {...register("username", { required: true })}
                        className="mt-1 px-3 py-2 border shadow-sm border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full"
                    />
                    {errors.username && <span className="text-red-500 text-xs">Username is required</span>}
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        id="password"
                        type="password"
                        {...register("password", { required: true })}
                        className="mt-1 px-3 py-2 border shadow-sm border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full"
                    />
                    {errors.password && <span className="text-red-500 text-xs">Password is required</span>}
                </div>

                <button
                    type="submit"
                    className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                >
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login;
