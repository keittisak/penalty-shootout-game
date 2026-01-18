import { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/UI";
import {
  subscribeToAllGames,
  deleteGame,
  deleteMultipleGames,
} from "../services/gameService";
import { GAME_STATUS } from "../utils/constants";
import { useGameContext } from "../context/GameContext";

/**
 * Admin Page - Manage game rooms
 */
export const AdminPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, authLoading, isConfigured } = useGameContext();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGames, setSelectedGames] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all', 'waiting', 'playing', 'finished'

  useEffect(() => {
    // Wait for authentication before subscribing
    if (authLoading || !isAuthenticated) {
      return;
    }

    const unsubscribe = subscribeToAllGames((gamesData) => {
      setGames(gamesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, authLoading]);

  // Filter games based on status
  const filteredGames = games.filter((game) => {
    if (filter === "all") return true;
    return game.status === filter;
  });

  // Sort by createdAt (newest first)
  const sortedGames = [...filteredGames].sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );

  const handleSelectAll = () => {
    if (selectedGames.length === sortedGames.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(sortedGames.map((g) => g.id));
    }
  };

  const handleSelectGame = (gameId) => {
    setSelectedGames((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleDeleteGame = async (gameId) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    setDeleting(true);
    try {
      await deleteGame(gameId);
      setSelectedGames((prev) => prev.filter((id) => id !== gameId));
    } catch (error) {
      console.error("Error deleting game:", error);
      alert("Error deleting game room");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedGames.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedGames.length} selected room(s)?`
      )
    )
      return;

    setDeleting(true);
    try {
      await deleteMultipleGames(selectedGames);
      setSelectedGames([]);
    } catch (error) {
      console.error("Error deleting games:", error);
      alert("Error deleting game rooms");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      [GAME_STATUS.WAITING]: {
        text: "Waiting",
        color: "bg-yellow-500/20 text-yellow-400",
      },
      [GAME_STATUS.PLAYING]: {
        text: "Playing",
        color: "bg-green-500/20 text-green-400",
      },
      [GAME_STATUS.FINISHED]: {
        text: "Finished",
        color: "bg-gray-500/20 text-gray-400",
      },
    };
    const badge = badges[status] || {
      text: status,
      color: "bg-gray-500/20 text-gray-400",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getStats = () => {
    return {
      total: games.length,
      waiting: games.filter((g) => g.status === GAME_STATUS.WAITING).length,
      playing: games.filter((g) => g.status === GAME_STATUS.PLAYING).length,
      finished: games.filter((g) => g.status === GAME_STATUS.FINISHED).length,
    };
  };

  const stats = getStats();

  // Show loading while waiting for auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl animate-bounce inline-block">⚽</span>
          <p className="text-white/60 mt-2">กำลังเชื่อมต่อ...</p>
        </div>
      </div>
    );
  }

  // Show message if not configured
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 max-w-sm">
          <p className="text-yellow-400 text-lg mb-2">
            ⚠️ Firebase ยังไม่ได้ตั้งค่า
          </p>
          <p className="text-white/60 text-sm mb-4">
            กรุณาสร้างไฟล์ .env และใส่ค่า Firebase credentials
          </p>
          <Button onClick={() => navigate("/")} variant="ghost" size="sm">
            ← กลับหน้าหลัก
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <Motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              🎮 จัดการห้องเกม
            </h1>
            <p className="text-white/60 text-sm mt-1">
              จัดการและดูรายการห้องเกมทั้งหมด
            </p>
          </div>
          <Button onClick={() => navigate("/")} variant="ghost" size="sm">
            ← กลับหน้าหลัก
          </Button>
        </div>
      </Motion.div>

      {/* Stats Cards */}
      <Motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-white/60 text-xs">ทั้งหมด</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
          <p className="text-yellow-400/60 text-xs">รอผู้เล่น</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.waiting}</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
          <p className="text-green-400/60 text-xs">กำลังเล่น</p>
          <p className="text-2xl font-bold text-green-400">{stats.playing}</p>
        </div>
        <div className="bg-gray-500/10 rounded-lg p-4 border border-gray-500/20">
          <p className="text-gray-400/60 text-xs">จบแล้ว</p>
          <p className="text-2xl font-bold text-gray-400">{stats.finished}</p>
        </div>
      </Motion.div>

      {/* Filters & Actions */}
      <Motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4"
      >
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "ทั้งหมด" },
            { value: "waiting", label: "รอผู้เล่น" },
            { value: "playing", label: "กำลังเล่น" },
            { value: "finished", label: "จบแล้ว" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                filter === value
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedGames.length > 0 && (
          <Button
            onClick={handleDeleteSelected}
            variant="danger"
            size="sm"
            loading={deleting}
          >
            🗑️ ลบที่เลือก ({selectedGames.length})
          </Button>
        )}
      </Motion.div>

      {/* Table */}
      <Motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
      >
        {loading && isAuthenticated ? (
          <div className="p-8 text-center">
            <span className="text-4xl animate-bounce inline-block">⚽</span>
            <p className="text-white/60 mt-2">กำลังโหลดข้อมูล...</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="p-8 text-center">
            <span className="text-4xl">🔐</span>
            <p className="text-white/60 mt-2">กำลังยืนยันตัวตน...</p>
          </div>
        ) : sortedGames.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl">📭</span>
            <p className="text-white/60 mt-2">ไม่พบห้องเกม</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedGames.length === sortedGames.length &&
                        sortedGames.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-white/30 bg-white/10"
                    />
                  </th>
                  <th className="p-3 text-left text-white/60 text-sm font-medium">
                    รหัสห้อง
                  </th>
                  <th className="p-3 text-left text-white/60 text-sm font-medium">
                    ผู้เล่น 1
                  </th>
                  <th className="p-3 text-left text-white/60 text-sm font-medium">
                    ผู้เล่น 2
                  </th>
                  <th className="p-3 text-left text-white/60 text-sm font-medium">
                    สถานะ
                  </th>
                  <th className="p-3 text-left text-white/60 text-sm font-medium">
                    รอบ
                  </th>
                  <th className="p-3 text-left text-white/60 text-sm font-medium">
                    คะแนน
                  </th>
                  <th className="p-3 text-left text-white/60 text-sm font-medium">
                    สร้างเมื่อ
                  </th>
                  <th className="p-3 text-left text-white/60 text-sm font-medium">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedGames.map((game, index) => (
                  <Motion.tr
                    key={game.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedGames.includes(game.id)}
                        onChange={() => handleSelectGame(game.id)}
                        className="rounded border-white/30 bg-white/10"
                      />
                    </td>
                    <td className="p-3">
                      <code className="bg-white/10 px-2 py-1 rounded text-sm text-blue-400 font-mono">
                        {game.gameCode || game.id}
                      </code>
                    </td>
                    <td className="p-3 text-white text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            game.player1?.connected
                              ? "bg-green-400"
                              : "bg-gray-500"
                          }`}
                        />
                        {game.player1?.name || "-"}
                      </div>
                    </td>
                    <td className="p-3 text-white text-sm">
                      {game.player2 ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              game.player2?.connected
                                ? "bg-green-400"
                                : "bg-gray-500"
                            }`}
                          />
                          {game.player2.name}
                        </div>
                      ) : (
                        <span className="text-white/40">รอเข้าร่วม...</span>
                      )}
                    </td>
                    <td className="p-3">{getStatusBadge(game.status)}</td>
                    <td className="p-3 text-white text-sm">
                      {game.currentRound || 0}
                    </td>
                    <td className="p-3 text-white text-sm">
                      <span className="text-blue-400">
                        {game.player1?.score || 0}
                      </span>
                      {" - "}
                      <span className="text-red-400">
                        {game.player2?.score || 0}
                      </span>
                    </td>
                    <td className="p-3 text-white/60 text-sm">
                      {formatDate(game.createdAt)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/watch/${game.id}`)}
                          className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors"
                          title="View Game"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleDeleteGame(game.id)}
                          disabled={deleting}
                          className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </Motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Motion.div>

      {/* Table Info */}
      {!loading && sortedGames.length > 0 && (
        <Motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/40 text-sm mt-4"
        >
          แสดง {sortedGames.length} รายการ{" "}
          {filter !== "all" && `(กรอง: ${filter})`}
        </Motion.p>
      )}
    </div>
  );
};

export default AdminPage;
