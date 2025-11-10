import React, { useState, useEffect } from 'react';
import { Icon } from './ui/Icon';

interface LoginPageProps {
    onLogin: (username: string, password: string) => Promise<boolean>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<React.ReactNode>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        if (rememberedUsername) {
            setUsername(rememberedUsername);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const success = await onLogin(username, password);
            if (success) {
                if (rememberMe) {
                    localStorage.setItem('rememberedUsername', username);
                } else {
                    localStorage.removeItem('rememberedUsername');
                }
            } else {
                setError('Tên đăng nhập hoặc mật khẩu không đúng.');
            }
        } catch (err: any) {
            let detailedError: React.ReactNode = 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.';
            if (err instanceof TypeError && (err.message.includes('Failed to fetch') || err.message.includes('Network request failed'))) {
                 detailedError = (
                    <>
                        Lỗi kết nối mạng (CORS). Vui lòng kiểm tra lại cấu hình triển khai Google Apps Script. 
                        Bạn phải <strong>TRIỂN KHAI LẠI (RE-DEPLOY)</strong> kịch bản với một <strong>PHIÊN BẢN MỚI (NEW VERSION)</strong> và đặt quyền truy cập là <strong>"Anyone"</strong>. 
                        <br />
                        Chỉ lưu lại file là không đủ.
                    </>
                );
            }
            setError(detailedError);
        } finally {
            setIsLoading(false);
        }
    };
    
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <div className="mx-auto flex items-center justify-center space-x-3">
                        <Icon type="document-duplicate" className="h-12 w-12 text-blue-600" />
                        <span className="text-3xl font-bold text-gray-800">DocManager ISO</span>
                    </div>
                    <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
                        Đăng nhập vào hệ thống
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md">
                        <div>
                            <label htmlFor="username" className="sr-only">Tên đăng nhập</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="relative block w-full appearance-none rounded-md border-0 bg-gray-100 px-3 py-3 text-gray-900 placeholder-gray-500 ring-1 ring-inset ring-gray-300 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                                placeholder="Tên đăng nhập"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">Mật khẩu</label>
                            <input
                                id="password"
                                name="password"
                                type={isPasswordVisible ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full appearance-none rounded-md border-0 bg-gray-100 px-3 py-3 pr-10 text-gray-900 placeholder-gray-500 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                                placeholder="Mật khẩu"
                            />
                             <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                <Icon type={isPasswordVisible ? 'eye-slash' : 'eye'} className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                            Ghi nhớ đăng nhập
                        </label>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md border border-red-200">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
