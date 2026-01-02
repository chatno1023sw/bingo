import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { GameStateEnvelope } from "~/common/types";
import { startSession, resumeSession, persistSessionState } from "~/common/services/sessionService";
import { getHistoryView, type HistoryView } from "~/common/services/historyService";
import {
	drawNextNumber,
	getAvailableNumbers,
	NoAvailableNumbersError,
} from "~/common/utils/bingoEngine";
import { CurrentNumber } from "~/components/game/CurrentNumber";
import { HistoryPanel } from "~/components/game/HistoryPanel";
import { HistoryModal } from "~/components/game/HistoryModal";
import { PrizeProvider } from "~/common/contexts/PrizeContext";
import { SidePanel } from "~/components/game/SidePanel";
import { BgmToggle } from "~/components/common/BgmToggle";
import { useBgmPreference } from "~/common/hooks/useBgmPreference";

const NUMBER_POOL = Array.from({ length: 75 }, (_, index) => index + 1);

const ensureSession = async (): Promise<GameStateEnvelope> => {
	const resumed = await resumeSession();
	if (resumed) {
		return resumed;
	}
	return startSession();
};

type LoaderData = GameStateEnvelope & {
	historyView: HistoryView;
	availableNumbers: number[];
};

const buildLoaderData = async (envelope: GameStateEnvelope): Promise<LoaderData> => {
	const historyView = await getHistoryView(envelope.gameState);
	const availableNumbers = getAvailableNumbers(envelope.gameState.drawHistory);
	return {
		...envelope,
		historyView,
		availableNumbers,
	};
};
export default function GameRoute() {
	const [session, setSession] = useState<LoaderData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isMutating, setIsMutating] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [drawError, setDrawError] = useState<string | null>(null);
	const [historyOpen, setHistoryOpen] = useState(false);
	const navigate = useNavigate();
	const {
		preference,
		isReady: isBgmReady,
		toggle: toggleBgm,
		error: bgmError,
	} = useBgmPreference();
	const [displayNumber, setDisplayNumber] = useState<number | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const animationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const availableNumbers = session?.availableNumbers ?? [];
	const bgmDisabled = !isBgmReady || isMutating;
	const isButtonDisabled = isMutating || isAnimating || availableNumbers.length === 0;
	const currentNumber = session?.gameState.currentNumber ?? null;

	useEffect(() => {
		let mounted = true;
		const run = async () => {
			try {
				const nextSession = await ensureSession();
				const nextData = await buildLoaderData(nextSession);
				if (!mounted) {
					return;
				}
				setSession(nextData);
				setLoadError(null);
			} catch (err) {
				if (!mounted) {
					return;
				}
				setLoadError(err instanceof Error ? err.message : "load-session-error");
			} finally {
				if (mounted) {
					setIsLoading(false);
				}
			}
		};
		run();
		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		if (isAnimating) {
			return;
		}
		setDisplayNumber(currentNumber);
	}, [isAnimating, currentNumber]);

	useEffect(() => {
		return () => {
			if (animationIntervalRef.current) {
				clearInterval(animationIntervalRef.current);
			}
			if (animationTimeoutRef.current) {
				clearTimeout(animationTimeoutRef.current);
			}
		};
	}, []);

	const performDraw = async () => {
		setIsMutating(true);
		try {
			const currentSession = session ?? (await ensureSession());
			const nextGameState = drawNextNumber(currentSession.gameState);
			const updatedEnvelope: GameStateEnvelope = {
				...currentSession,
				gameState: nextGameState,
			};
			await persistSessionState(updatedEnvelope);
			const nextData = await buildLoaderData(updatedEnvelope);
			setSession(nextData);
			setDrawError(null);
		} catch (error) {
			if (error instanceof NoAvailableNumbersError) {
				setDrawError("no-available-numbers");
				return;
			}
			setDrawError("draw-error");
		} finally {
			setIsMutating(false);
		}
	};

	const handleDraw = () => {
		if (isAnimating || isMutating || availableNumbers.length === 0) {
			return;
		}
		const pool = availableNumbers.length > 0 ? availableNumbers : NUMBER_POOL;
		setIsAnimating(true);
		animationIntervalRef.current = setInterval(() => {
			const random = pool[Math.floor(Math.random() * pool.length)];
			setDisplayNumber(random);
		}, 120);
		animationTimeoutRef.current = setTimeout(() => {
			if (animationIntervalRef.current) {
				clearInterval(animationIntervalRef.current);
				animationIntervalRef.current = null;
			}
			setIsAnimating(false);
			void performDraw();
		}, 3000);
	};

	const handleBackToStart = () => {
		navigate("/start");
	};

	const drawButtonLabel =
		availableNumbers.length === 0
			? "抽選は完了しました"
			: isAnimating || isMutating
				? "抽選中..."
				: "抽選を開始！";

	if (isLoading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-white text-slate-900">
				<p className="text-sm text-slate-500">読み込み中...</p>
			</main>
		);
	}

	if (loadError || !session) {
		return (
			<main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white text-slate-900">
				<p className="text-sm text-rose-500">データの読み込みに失敗しました。</p>
				<button
					type="button"
					className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
					onClick={() => navigate("/start")}
				>
					Start 画面に戻る
				</button>
			</main>
		);
	}

	return (
		<PrizeProvider initialPrizes={session.prizes}>
			<main className="h-screen overflow-hidden bg-white text-slate-900">
				<div className="flex h-full w-full flex-col border border-slate-400 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
					<header className="flex items-center justify-end gap-4">
						<BgmToggle
							enabled={preference.enabled}
							onToggle={() => toggleBgm()}
							disabled={bgmDisabled}
						/>
						<button
							type="button"
							className="rounded-full border border-slate-300 px-3 py-1 text-xl text-slate-600 transition hover:bg-slate-50"
							aria-label="Start 画面に戻る"
							onClick={handleBackToStart}
						>
							{/* todo: あとでlucide reactにしたい */}×
						</button>
					</header>
					{bgmError ? (
						<p className="text-right text-xs text-rose-500">BGM 設定の保存に失敗しました</p>
					) : null}
					<div className="flex flex-1 gap-6 overflow-hidden px-6 py-6">
						<HistoryPanel
							recent={session.historyView.recent}
							onOpenModal={() => setHistoryOpen(true)}
							className="flex-[0_0_420px]"
						/>

						<section className="flex flex-1 flex-col items-center justify-center gap-8">
							<CurrentNumber value={displayNumber} isDrawing={isAnimating || isMutating} />
							<button
								type="button"
								className="w-80 rounded-full bg-[#0F6A86] px-8 py-4 text-xl font-semibold text-white shadow-sm transition hover:bg-[#0d5870] disabled:cursor-not-allowed disabled:opacity-50"
								onClick={handleDraw}
								disabled={isButtonDisabled}
							>
								{drawButtonLabel}
							</button>
							{drawError === "no-available-numbers" && (
								<p className="text-sm text-rose-500">すべての番号が抽選済みです。</p>
							)}
							<p className="text-xs text-slate-500">残り {availableNumbers.length} / 75</p>
						</section>

						<SidePanel className="flex-[0_0_420px]" />
					</div>
				</div>
				<HistoryModal
					open={historyOpen}
					entries={session.historyView.all}
					onClose={() => setHistoryOpen(false)}
				/>
			</main>
		</PrizeProvider>
	);
}
