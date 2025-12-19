import HomePage from './components/home/HomePage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GiWhiteBook } from 'react-icons/gi';

const queryClient = new QueryClient();

/**
 * Root component wrapping the app with React Query provider.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className='container'>
        <h1 className="page-title">
            Decode Book <GiWhiteBook />
        </h1>
        <h2 className="page-subtitle">AI Powered Electrical Code</h2>
        <HomePage />
      </div>

      <div className='page-footer'>
        Created by John Elenis
      </div>
    </QueryClientProvider>
  );
}

export default App;
