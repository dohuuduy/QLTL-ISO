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
                        <strong>Lỗi kết nối mạng (CORS):</strong> Đăng nhập thất bại. Vui lòng kiểm tra lại cấu hình triển khai Google Apps Script. 
                        <br />
                        Bạn phải <strong>TRIỂN KHAI LẠI (RE-DEPLOY)</strong> kịch bản với một <strong>PHIÊN BẢN MỚI (NEW VERSION)</strong> và đặt quyền truy cập là <strong>"Anyone"</strong>. 
                        <br />
                        <em className="text-xs">Lưu ý: Chỉ lưu lại file trên Apps Script là không đủ.</em>
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
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="mx-auto flex items-center justify-center space-x-3">
                    <Icon type="document-duplicate" className="h-12 w-12 text-blue-600" />
                    <span className="text-3xl font-bold text-gray-800">DocManager ISO</span>
                </div>
                
                <div className="mt-8 bg-white shadow-xl rounded-2xl p-8 sm:p-10">
                    <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
                        Đăng nhập
                    </h2>
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
                                    className="form-input"
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
                                    className="form-input pr-10"
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
                                {isLoading && (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
