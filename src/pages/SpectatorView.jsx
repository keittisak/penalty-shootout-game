import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { subscribeToGame } from "../services/gameService";
import {
  GAME_PHASE,
  GAME_STATUS,
  DIRECTION_NAMES,
  ROUND_RESULT,
} from "../utils/constants";
import { ScoreBoard, RoundHistory, ResultAnimation } from "../components/Game";
import { Button, Loading } from "../components/UI";

/**
 * Spectator View - Watch ongoing game without participation
 */
export const SpectatorView = () => {
  const navigate = useNavigate();
  const { gameCode } = useParams();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastNotification, setLastNotification] = useState(null);
  const [lastProcessedRoundIndex, setLastProcessedRoundIndex] = useState(-1);

  useEffect(() => {
    console.log(lastNotification);
  }, [lastNotification]);

  // Subscribe to game updates
  useEffect(() => {
    if (!gameCode) {
      setError("Game code not provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToGame(gameCode, (data) => {
      setGameData(data);
      setLoading(false);
      setError("");

      console.log(
        "xx",
        data.currentPhase,
        data.player1?.hasChosen,
        data.player2?.hasChosen
      );

      if (data.currentPhase === GAME_PHASE.RESULT) {
        showNotification(data.rounds[data.rounds.length - 1]?.result);
      }

      // Show notification only on new rounds with results
      if (data && data.rounds && data.rounds.length > 0) {
        const latestRoundIndex = data.rounds.length - 1;
        const latestRound = data.rounds[latestRoundIndex];

        // Only show notification if this is a new round that hasn't been processed
        if (latestRoundIndex > lastProcessedRoundIndex && latestRound.result) {
          //   showNotification(latestRound.result);
          setLastProcessedRoundIndex(latestRoundIndex);
        }
      }
    });

    return () => unsubscribe?.();
  }, [gameCode, lastProcessedRoundIndex]);

  const showNotification = (result) => {
    // Check both lowercase and uppercase
    const normalizedResult = result?.toLowerCase();
    if (
      normalizedResult !== ROUND_RESULT.GOAL &&
      normalizedResult !== ROUND_RESULT.SAVED
    )
      return;

    const notification = {
      id: Date.now(),
      message:
        normalizedResult === ROUND_RESULT.GOAL ? "⚽ GOAL!" : "🧤 SAVED!",
    };
    setLastNotification(notification);
    setTimeout(() => setLastNotification(null), 3000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading game..." />
      </div>
    );
  }

  // Error state
  if (error || !gameData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="game-panel p-8 w-full max-w-md text-center">
          <p className="text-red-400 text-xl mb-4">
            ❌ {error || "Game not found"}
          </p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const {
    player1 = { name: "Player 1", score: 0 },
    player2 = { name: "Player 2", score: 0 },
    currentRound,
    totalRounds,
    currentPhase,
    currentShooter,
    currentSaver,
    rounds = [],
  } = gameData || {};
  const lastRound = rounds[rounds.length - 1];

  // Get current shooter/saver names
  const currentShooterName =
    currentShooter === "player1" ? player1.name : player2.name;
  const currentSaverName =
    currentSaver === "player1" ? player1.name : player2.name;

  // Get shooter's pending choice (revealed during SAVING phase)
  const shooterPendingChoice =
    currentShooter === "player1"
      ? player1?.pendingReveal?.choice
      : player2?.pendingReveal?.choice;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Main Container */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-pixel text-4xl text-white mb-2">LIVE MATCH</h1>
          <p className="font-pixelMod text-white/60">Spectator Mode</p>
        </div>

        {/* Score Board */}
        <ScoreBoard
          player1Name={player1.name}
          player1Score={player1.score}
          player2Name={player2.name}
          player2Score={player2.score}
          currentRound={currentRound}
          totalRounds={totalRounds}
          myPlayerKey={null}
          suddenDeath={gameData?.suddenDeath}
        />

        {/* Round History */}
        {rounds.length > 0 && (
          <div className="my-6">
            <RoundHistory rounds={rounds} suddenDeath={gameData.suddenDeath} />
          </div>
        )}

        {/* Live Notification */}
        {lastNotification ? (
          <Motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="game-panel p-6 my-6 text-center min-h-[180px] flex items-center justify-center bg-green-500/20 border-2 border-green-500"
          >
            <p className="font-pixel text-3xl text-green-400">
              {lastNotification.message}
            </p>
          </Motion.div>
        ) : (
          //  Current Phase Status
          <Motion.div
            className="game-panel p-6 my-6 text-center min-h-[180px]"
            //   animate={{ opacity: [0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <p className="font-pixelMod text-white/70 text-sm mb-2">
              {currentPhase === GAME_PHASE.SHOOTING && "🎯 SHOOTING PHASE"}
              {currentPhase === GAME_PHASE.SAVING && "🧤 SAVING PHASE"}
              {currentPhase === GAME_PHASE.RESULT && "📊 SHOWING RESULT"}
            </p>

            {/* Live: Currently Playing */}
            {(currentPhase === GAME_PHASE.SHOOTING ||
              currentPhase === GAME_PHASE.SAVING) && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-white/5 rounded-lg"
              >
                <p className="text-white/60 text-xs mb-3">
                  Round {currentRound} - Now Playing:
                </p>

                {/* Current Shooter */}
                <Motion.div
                  className={`flex items-center justify-center gap-2 mb-2 ${
                    currentPhase === GAME_PHASE.SHOOTING ? "animate-pulse" : ""
                  }`}
                >
                  <span className="text-yellow-300 text-sm">⚽ Shooter:</span>
                  <span className="text-white font-bold">
                    {currentShooterName}
                  </span>
                  {currentPhase === GAME_PHASE.SHOOTING && (
                    <span className="text-yellow-400 text-xs">
                      ⏳ selecting...
                    </span>
                  )}
                  {currentPhase === GAME_PHASE.SAVING &&
                    shooterPendingChoice && (
                      <span className="text-green-400 font-bold">
                        →{" "}
                        {DIRECTION_NAMES[shooterPendingChoice] ||
                          shooterPendingChoice}
                      </span>
                    )}
                </Motion.div>

                {/* Current Goalkeeper */}
                <Motion.div
                  className={`flex items-center justify-center gap-2 ${
                    currentPhase === GAME_PHASE.SAVING ? "animate-pulse" : ""
                  }`}
                >
                  <span className="text-blue-300 text-sm">🧤 Keeper:</span>
                  <span className="text-white font-bold">
                    {currentSaverName}
                  </span>
                  {currentPhase === GAME_PHASE.SHOOTING && (
                    <span className="text-gray-400 text-xs">waiting...</span>
                  )}
                  {currentPhase === GAME_PHASE.SAVING && (
                    <span className="text-blue-400 text-xs">
                      ⏳ selecting...
                    </span>
                  )}
                </Motion.div>
              </Motion.div>
            )}
          </Motion.div>
        )}

        {/* Game Status */}
        <Motion.div className="game-panel p-6 text-center">
          <p className="font-pixelMod text-white/70 mb-4">
            {gameData?.status === GAME_STATUS.WAITING
              ? "⏳ Waiting for Players"
              : gameData?.status === GAME_STATUS.PLAYING
              ? "🎮 Game in Progress"
              : "✓ Game Finished"}
          </p>

          {gameData?.status === GAME_STATUS.WAITING && (
            <Motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="mb-4"
            >
              <p className="text-yellow-400 text-lg font-bold">
                Waiting for second player to join...
              </p>
            </Motion.div>
          )}

          {gameData?.status !== GAME_STATUS.PLAYING &&
            gameData?.status !== GAME_STATUS.WAITING && (
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mb-4"
              >
                <p className="text-2xl font-bold text-yellow-400">
                  {player1.score > player2.score
                    ? `${player1.name} WINS!`
                    : player2.score > player1.score
                    ? `${player2.name} WINS!`
                    : "DRAW!"}
                </p>
              </Motion.div>
            )}

          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="w-full"
          >
            ← Back to Lobby
          </Button>
        </Motion.div>

        {/* Share Info */}
        <Motion.div className="text-center mt-8 text-white/40 text-xs">
          <p>Game Code: {gameCode}</p>
          <p>Watch URL: {window.location.href}</p>
        </Motion.div>
      </Motion.div>
    </div>
  );
};

export default SpectatorView;
