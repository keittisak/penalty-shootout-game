import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { HomePage, AdminPage, SpectatorView } from './pages';
import { CreateGame, JoinGame, WaitingRoom } from './components/Lobby';
import { GameBoard } from './components/Game';
import { GameResult } from './components/Result';

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
          <Routes>
            {/* Home */}
            <Route path="/" element={<HomePage />} />
            
            {/* Lobby */}
            <Route path="/create" element={
              <div className="min-h-screen flex items-center justify-center p-4">
                <CreateGame />
              </div>
            } />
            <Route path="/join" element={
              <div className="min-h-screen flex items-center justify-center p-4">
                <JoinGame />
              </div>
            } />
            <Route path="/waiting/:gameCode" element={
              <div className="min-h-screen flex items-center justify-center p-4">
                <WaitingRoom />
              </div>
            } />
            
            {/* Game */}
            <Route path="/game/:gameId" element={<GameBoard />} />
            
            {/* Spectator/Watch */}
            <Route path="/watch/:gameCode" element={<SpectatorView />} />
            
            {/* Result */}
            <Route path="/result/:gameId" element={<GameResult />} />
            
            {/* Admin */}
            <Route path="/admin" element={<AdminPage />} />
            
            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-6xl mb-4">🤔</p>
                  <h1 className="text-2xl mb-2">Page Not Found</h1>
                  <a href="/" className="text-blue-400 hover:underline">Back to Home</a>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
