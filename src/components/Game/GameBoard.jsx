import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useGameContext } from "../../context/GameContext";
import { useGame, useTimer, usePresence } from "../../hooks";
import {
  submitShooterChoice,
  submitSaverChoiceAndReveal,
} from "../../services/gameService";
import {
  GAME_PHASE,
  GAME_STATUS,
  DIRECTION_NAMES,
} from "../../utils/constants";
import { generateSecret } from "../../utils/helpers";
import { commitChoice } from "../../services/gameLogic";

import { GoalPost } from "./GoalPost";
import { DirectionSelector } from "./DirectionSelector";
import { Timer } from "./Timer";
import { ScoreBoard } from "./ScoreBoard";
import { RoundHistory } from "./RoundHistory";
import { WaitingOverlay } from "./WaitingOverlay";
import { ResultAnimation } from "./ResultAnimation";
import { Button, FullPageLoading } from "../UI";

/**
 * Main Game Board component
 */
export const GameBoard = () => {
  const { gameId: routeGameId } = useParams();
  const navigate = useNavigate();
  const {
    gameId: contextGameId,
    playerKey: contextPlayerKey,
    userId,
    setGameSession,
  } = useGameContext();

  const gameId = routeGameId || contextGameId;

  // Local state to determine playerKey from gameData
  const [detectedPlayerKey, setDetectedPlayerKey] = useState(contextPlayerKey);

  console.log("🎮 GameBoard Debug:", {
    routeGameId,
    contextGameId,
    gameId,
    contextPlayerKey,
    detectedPlayerKey,
    userId,
  });

  // Local state for choices
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [localSecret, setLocalSecret] = useState(generateSecret());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Game hook
  const {
    gameData,
    loading,
    error,
    currentRound,
    currentPhase,
    status,
    winner,
    suddenDeath,
    rounds,
    lastRoundResult,
    isShooter,
    isSaver,
    isMyTurnNow,
  } = useGame(gameId, detectedPlayerKey);

  // Auto-detect playerKey from gameData if not in context
  useEffect(() => {
    if (!detectedPlayerKey && gameData && userId) {
      if (gameData.player1?.id === userId) {
        setDetectedPlayerKey("player1");
        setGameSession(gameId, "player1");
      } else if (gameData.player2?.id === userId) {
        setDetectedPlayerKey("player2");
        setGameSession(gameId, "player2");
      }
    }
  }, [gameData, userId, detectedPlayerKey, gameId, setGameSession]);

  // Timer hook
  const { timeLeft, timeLeftSeconds } = useTimer(gameId);

  // Presence hook
  usePresence(gameId, detectedPlayerKey, userId);

  // Reset selection on new round
  useEffect(() => {
    if (currentPhase === GAME_PHASE.SHOOTING) {
      setSelectedDirection(null);
      setLocalSecret(generateSecret());
      setShowResult(false);
    }
  }, [currentRound, currentPhase]);

  // Show result animation
  useEffect(() => {
    if (currentPhase === GAME_PHASE.RESULT && lastRoundResult) {
      setShowResult(true);
    }
  }, [currentPhase, lastRoundResult]);

  // Navigate to result when game ends
  useEffect(() => {
    if (status === GAME_STATUS.FINISHED && winner) {
      const timer = setTimeout(() => {
        navigate(`/result/${gameId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, winner, gameId, navigate]);

  // Handle direction selection
  const handleSelectDirection = useCallback(
    (direction) => {
      if (!isSubmitting) {
        setSelectedDirection(direction);
      }
    },
    [isSubmitting]
  );

  // Handle submit choice
  const handleSubmit = useCallback(async () => {
    if (!selectedDirection || isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (isShooter && currentPhase === GAME_PHASE.SHOOTING) {
        // Shooter: send commitment with reveal data
        const commitment = commitChoice(selectedDirection, localSecret);
        await submitShooterChoice(
          gameId,
          detectedPlayerKey,
          commitment,
          selectedDirection,
          localSecret
        );
      } else if (isSaver && currentPhase === GAME_PHASE.SAVING) {
        // Saver: reveal and submit
        const shooterKey =
          detectedPlayerKey === "player1" ? "player2" : "player1";

        // Get shooter's choice from Firebase (pendingReveal or timeout)
        const shooterData = gameData[shooterKey];
        let shootChoice = shooterData?.timeoutChoice;
        let shootSecret = "";

        // Get reveal data from Firebase (stored when shooter submitted)
        if (!shootChoice && shooterData?.pendingReveal) {
          shootChoice = shooterData.pendingReveal.choice;
          shootSecret = shooterData.pendingReveal.secret;
        }

        await submitSaverChoiceAndReveal(
          gameId,
          detectedPlayerKey,
          selectedDirection,
          shootChoice || "center", // fallback
          shootSecret
        );
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedDirection,
    isSubmitting,
    isShooter,
    isSaver,
    currentPhase,
    gameId,
    detectedPlayerKey,
    localSecret,
    gameData,
  ]);

  // Loading state
  if (loading) {
    return <FullPageLoading text="Loading game..." />;
  }

  // Error state
  if (error || !gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="game-panel p-8 text-center">
          <p className="text-red-400 text-xl mb-4">
            ❌ {error || "Game not found"}
          </p>
          <Button onClick={() => navigate("/")}>BACK TO HOME</Button>
        </div>
      </div>
    );
  }

  // Get role text
  const getRoleText = () => {
    if (isShooter) return "⚽ YOU ARE SHOOTING";
    if (isSaver) return "🧤 YOU ARE DEFENDING";
    return "";
  };

  // Get phase instruction
  const getPhaseInstruction = () => {
    if (currentPhase === GAME_PHASE.SHOOTING) {
      return isShooter
        ? "Choose a direction to shoot!"
        : "Waiting for shooter...";
    }
    if (currentPhase === GAME_PHASE.SAVING) {
      return isSaver
        ? "Choose a direction to defend!"
        : "Waiting for defender...";
    }
    if (currentPhase === GAME_PHASE.RESULT) {
      return "SHOT RESULT!";
    }
    return "";
  };

  // Last round data for showing result
  const lastRound = rounds[rounds.length - 1];

  return (
    <div className="min-h-screen p-4 flex flex-col">
      {/* Header */}
      <div className="max-w-lg mx-auto w-full mb-4">
        <ScoreBoard
          player1Name={gameData.player1?.name}
          player2Name={gameData.player2?.name}
          player1Score={gameData.player1?.score || 0}
          player2Score={gameData.player2?.score || 0}
          currentRound={currentRound}
          suddenDeath={suddenDeath}
          myPlayerKey={contextPlayerKey}
        />
      </div>

      {/* Round History */}
      <div className="max-w-lg mx-auto w-full mb-4">
        <RoundHistory
          rounds={rounds}
          myPlayerKey={detectedPlayerKey}
          suddenDeath={suddenDeath}
        />
      </div>

      {/* Main Game Area */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="game-panel p-6 max-w-lg mx-auto w-full flex-1 relative"
      >
        {/* Role indicator */}
        <Motion.div
          key={currentRound}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-4"
        >
          <p className="text-2xl font-bold text-white mb-1">{getRoleText()}</p>
          <p className="text-white/70">{getPhaseInstruction()}</p>
        </Motion.div>

        {/* Timer */}
        {/* {(currentPhase === GAME_PHASE.SHOOTING ||
          currentPhase === GAME_PHASE.SAVING) && (
          <div className="mb-4">
            <Timer timeLeft={timeLeft} isUrgent={timeLeftSeconds <= 3} />
          </div>
        )} */}

        {/* Goal Post */}
        <div className="mb-6">
          <GoalPost
            selectedZone={selectedDirection}
            onSelectZone={isMyTurnNow ? handleSelectDirection : undefined}
            disabled={!isMyTurnNow || isSubmitting}
            showResult={currentPhase === GAME_PHASE.RESULT && lastRound}
            shootDirection={lastRound?.shootChoice}
            saveDirection={lastRound?.saveChoice}
            result={lastRound?.result}
          />
        </div>

        {/* Direction Selector - only show when it's my turn */}
        {isMyTurnNow && (
          <div className="mb-6">
            <DirectionSelector
              selectedDirection={selectedDirection}
              onSelect={handleSelectDirection}
              disabled={isSubmitting}
              role={isShooter ? "shooter" : "goalkeeper"}
            />
          </div>
        )}

        {/* Submit Button */}
        {isMyTurnNow && selectedDirection && (
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!selectedDirection}
              className="w-full"
              size="lg"
            >
              {isShooter ? "⚽ SHOOT!" : "🧤 DEFEND!"}
            </Button>
          </Motion.div>
        )}

        {/* Waiting Overlay */}
        <WaitingOverlay
          isWaiting={!isMyTurnNow && currentPhase !== GAME_PHASE.RESULT}
          message={
            currentPhase === GAME_PHASE.SHOOTING
              ? "Waiting for shooter..."
              : "Waiting for defender..."
          }
        />
      </Motion.div>

      {/* Result Animation */}
      <ResultAnimation
        result={lastRoundResult}
        shootDirection={
          DIRECTION_NAMES[lastRound?.shootChoice] || lastRound?.shootChoice
        }
        saveDirection={
          DIRECTION_NAMES[lastRound?.saveChoice] || lastRound?.saveChoice
        }
        isVisible={showResult}
        onComplete={() => {
          setTimeout(() => {
            setShowResult(false);
          }, 1500);
        }}
      />
    </div>
  );
};

export default GameBoard;
