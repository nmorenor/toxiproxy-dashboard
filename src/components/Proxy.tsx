import { useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { addTimeoutCloseToxic, addTimeoutToxic, deleteToxic, fetchProxy } from '../store/slices/proxies-thunk';

const ProxyPage: React.FC = () => {
    const { proxy } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const proxyData = useAppSelector((state) => proxy ? state.proxies.proxies[proxy] : undefined);
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
        if (!proxy) {
            navigate('/', { replace: true });
            return;
        }
        dispatch(fetchProxy({ proxy, token }));
    }, [proxy, token, isRehydrated, navigate, dispatch]);

    if (!proxy) {
        return <Navigate to="/" replace />;
    }

    const hasTimeoutToxic = () => {
        return proxyData && proxyData.toxics.some((toxic) => toxic.name === 'timeout');
    }

    const handleAddTimeoutToxic = () => {
        if (!token) {
            return;
        }
        dispatch(addTimeoutToxic({ proxy, token }));
    };

    const hasTimeoutCloseToxic = () => {
        return proxyData && proxyData.toxics.some((toxic) => toxic.name === 'timeoutclose');
    }

    const handleAddTimeoutCloseToxic = () => {
        if (!token) {
            return;
        }
        dispatch(addTimeoutCloseToxic({ proxy, token }));
    };

    const handleDeleteToxic = (toxicName: string) => {
        if (!token) {
            return;
        }
        dispatch(deleteToxic({ proxy, toxic: toxicName, token }));
    };

    const goHome = () => {
        navigate('/', { replace: true });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-4xl w-full bg-white rounded-md shadow px-6 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">{proxy}</h1>
                {proxyData && (
                    <div>
                        <div className="flex flex-col space-y-4">
                            <div className="flex">
                                <div className="font-semibold w-1/3">Name</div>
                                <div className="w-2/3">{proxyData.name}</div>
                            </div>
                            <div className="flex">
                                <div className="font-semibold w-1/3">Listen</div>
                                <div className="w-2/3">{proxyData.listen}</div>
                            </div>
                            <div className="flex">
                                <div className="font-semibold w-1/3">Upstream</div>
                                <div className="w-2/3">{proxyData.upstream}</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="font-semibold mb-2">Toxics</div>
                                <div>
                                    {proxyData.toxics.length === 0 ? (
                                        <p>No toxics</p>
                                    ) : (
                                        <ul className="list-disc pl-8">
                                            {proxyData.toxics.map((toxic) => (
                                                <li key={toxic.name} className="flex justify-between items-center">
                                                    {toxic.name}
                                                    <button
                                                        onClick={() => handleDeleteToxic(toxic.name)}
                                                        className="text-red-500 hover:text-red-700 text-sm">
                                                        Delete
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                        {!hasTimeoutToxic() && (
                            <button
                                onClick={() => handleAddTimeoutToxic()}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300 ease-in-out">
                                Add Timeout Toxic
                            </button>
                        )}
                        {!hasTimeoutCloseToxic() && (
                            <button
                                onClick={() => handleAddTimeoutCloseToxic()}
                                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition duration-300 ease-in-out ml-2">
                                Add Timeout Close Toxic
                            </button>
                        )}
                        <button
                            onClick={() => goHome()}
                            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-700 transition duration-300 ease-in-out ml-2">
                            Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProxyPage;