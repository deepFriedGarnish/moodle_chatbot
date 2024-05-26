import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom';
import AllConversations from './pages/AllConversations';
import UnansweredQuestions from './pages/UnansweredQuestions';
import BotTraining from './pages/BotTraining';
import FAQ from './pages/FAQ';

function App() {
  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path="/all-conversations" element={<AllConversations/>}></Route>
        <Route path="/unanswered-questions" element={<UnansweredQuestions/>}></Route>
        <Route path="/bot-training" element={<BotTraining/>}></Route>
        <Route path="/" element={<AllConversations/>}></Route>
        <Route path="/faq" element={<FAQ/>}></Route>
      </Routes>
    </div>
  );
}

export default App;