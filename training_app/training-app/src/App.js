import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom';
import AllConversations from './components/pages/AllConversations';
import UnansweredQuestions from './components/pages/UnansweredQuestions'
import BotTraining from './components/pages/BotTraining'
import Home from './components/pages/Home'

function App() {
  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path="/all-conversations" element={<AllConversations/>}></Route>
        <Route path="/unanswered-questions" element={<UnansweredQuestions/>}></Route>
        <Route path="/bot-training" element={<BotTraining/>}></Route>
        <Route path="/" element={<Home/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
