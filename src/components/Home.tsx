import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProxies } from '../store/slices/proxies-thunk';
import { reset } from '../store/slices/auth-slice';

const HomePage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const proxyList = useAppSelector((state) => state.proxies.proxies);
    const token = useAppSelector((state) => state.auth.token);
    const isRehydrated = useAppSelector((state) => state.auth._persist.rehydrated);

    useEffect(() => {
        if (!isRehydrated) {
            return;
        }
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }
        dispatch(fetchProxies({ token }));
    }, [isRehydrated, token, dispatch, navigate]);

    const logout = () => {
        dispatch(reset())
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-4xl w-full px-4 py-8 bg-white rounded-md shadow">
                <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Proxies</h1>
                <ul className="divide-y divide-gray-200">
                    {Object.keys(proxyList).map((proxy) => (
                        <li key={proxy} className="px-6 py-4 hover:bg-gray-50">
                            <Link to={`/proxy/${proxy}`} className="text-indigo-600 hover:text-indigo-900">{proxy}</Link>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={() => logout()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300 ease-in-out">
                    logout
                </button>
            </div>

        </div>
    );
};

export default HomePage;