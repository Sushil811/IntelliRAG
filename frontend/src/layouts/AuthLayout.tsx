import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            IntelliRAG
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Enterprise AI Knowledge Copilot</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
