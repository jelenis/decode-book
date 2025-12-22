import HomePage from './components/home/HomePage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GiWhiteBook } from 'react-icons/gi';
import { FaGithub } from "react-icons/fa";


const queryClient = new QueryClient();


/**
 * Root component wrapping the app with React Query provider.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Container will center the content and provide maximum width */}
      <div className='container'>
        <h1 className="page-title">
            Decode Book <GiWhiteBook />
        </h1>
        <h2 className="page-subtitle">AI Powered Electrical Code</h2>

        {/* HomePage contains the main application */}
        <HomePage />
      </div>

      {/* Webpage footer */}
      <div className='page-footer'>
        Created by John Elenis 
        <a 
        style={{
          marginTop: '3px'
        }}
        href='https://github.com/jelenis'>
          <FaGithub/>
        </a>
      </div>
    </QueryClientProvider>
  );
}

export default App;
