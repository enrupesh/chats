import { useState, useCallback, useRef, useEffect } from "react";
import { hapticTap } from "../lib/haptics";
import { feedback } from "../lib/feedback";

/**
 * VeilChat's in-app on-screen keyboard — polished to feel like a
 * professional native keyboard (Gboard-class finish).
 *
 * Design principles:
 *   - Keys "sink" on press: shadow disappears + bg darkens. No scale.
 *     Scaling feels toy-like; shadow depth is the correct tactile cue.
 *   - Haptic-only feedback on keystrokes. Sound is played only for the
 *     send/return key (a meaningful action), never for typing.
 *   - Character keys are the lightest surface (elevated) so they pop
 *     off the darker keyboard background. Modifier keys are a mid tone
 *     so they visually recede — exactly how Gboard hierarchises keys.
 *   - Key preview bubble appears in 120 ms (vs 220 ms for generic
 *     pop-ins), so it feels instant and doesn't lag behind the finger.
 *   - Keyboard panel slides in smoothly on mount.
 *
 * Architecture:
 *   - Stateless about the draft (the parent owns the textarea).
 *   - No autocomplete, no swipe-to-type, no learned dictionary.
 *     Privacy is the feature.
 *   - Three modes (letters / numbers / symbols) + shift with three
 *     states: off, on (one-shot), lock (caps-lock).
 *   - Keys fire on pointerdown for zero-perceived-latency response.
 *   - Hold-to-repeat on character keys and backspace.
 *   - Pointer capture keeps repeat going even if finger drifts off key.
 */
export type KeyboardMode = "letters" | "numbers" | "symbols";
export type ShiftState = "off" | "on" | "lock";

const ROW_LETTERS: string[][] = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

const ROW_NUMBERS: string[][] = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["-", "/", ":", ";", "(", ")", "$", "&", "@", "\""],
  [".", ",", "?", "!", "'"],
];

const ROW_SYMBOLS: string[][] = [
  ["[", "]", "{", "}", "#", "%", "^", "*", "+", "="],
  ["_", "\\", "|", "~", "<", ">", "€", "£", "¥", "•"],
  [".", ",", "?", "!", "'"],
];

/** Press-and-hold timing — tuned to match Gboard / native iOS. */
const REPEAT_INITIAL_DELAY_MS = 380;
const REPEAT_INTERVAL_MS = 45;

/**
 * Shared layout base — visual styling is handled entirely by the CSS
 * classes veil-key-char / veil-key-mod / veil-key-send so that
 * theme-aware colors live in one place and there's zero risk of
 * Tailwind active: overrides fighting the CSS :active rules.
 */
const KEY_LAYOUT =
  "relative h-[50px] rounded-[5px] " +
  "select-none touch-manipulation ";

export function VeilKeyboard({
  onChar,
  onBackspace,
  onSubmit,
  onClose,
  showCloseButton = true,
}: {
  onChar: (char: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}) {
  const [mode, setMode] = useState<KeyboardMode>("letters");
  const [shift, setShift] = useState<ShiftState>("on"); // start capitalised

  // ── Key press handlers ──────────────────────────────────────────────
  // All key taps use hapticTap() only — no audio.
  // Sound plays only on submit (a meaningful, intentional action).

  const tap = useCallback(
    (char: string, opts: { isRepeat?: boolean } = {}) => {
      hapticTap();
      const out =
        mode === "letters" && shift !== "off" ? char.toUpperCase() : char;
      onChar(out);
      // One-shot shift resets after first character (non-repeat only).
      if (!opts.isRepeat && mode === "letters" && shift === "on") {
        setShift("off");
      }
    },
    [mode, shift, onChar],
  );

  const handleShift = () => {
    hapticTap();
    setShift((s) => (s === "off" ? "on" : s === "on" ? "lock" : "off"));
  };

  const handleBackspace = useCallback(
    (_opts: { isRepeat?: boolean } = {}) => {
      hapticTap();
      onBackspace();
    },
    [onBackspace],
  );

  const handleSubmit = () => {
    feedback.press(); // Send is intentional — play sound + stronger haptic.
    onSubmit();
  };

  const switchMode = (next: KeyboardMode) => {
    hapticTap();
    setMode(next);
  };

  const rows =
    mode === "letters"
      ? ROW_LETTERS
      : mode === "numbers"
        ? ROW_NUMBERS
        : ROW_SYMBOLS;

  return (
    <div
      className="veil-keyboard-bg veil-keyboard-slide-in select-none border-t border-line/30"
      role="group"
      aria-label="VeilChat private keyboard"
    >
      {/* ── Privacy badge ── */}
      <div className="flex items-center justify-between px-3.5 pt-2 pb-1.5">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-text-muted/80">
          <LockMiniIcon />
          Private input · stays on this device
        </span>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={() => {
              hapticTap();
              onClose();
            }}
            className={
              "size-7 rounded-full grid place-items-center text-text-muted " +
              "hover:text-text hover:bg-text/10 active:bg-text/15 " +
              "transition-colors duration-150 select-none touch-manipulation " +
              "[&]:[-webkit-tap-highlight-color:transparent]"
            }
            aria-label="Hide keyboard"
          >
            <ChevronDownMini />
          </button>
        )}
      </div>

      {/* ── Key rows ── */}
      <div className="px-2.5 pb-3 pt-0.5 flex flex-col gap-[8px]">
        {rows.map((row, idx) => (
          <KeyboardRow
            key={idx}
            keys={row}
            rowIndex={idx}
            isLastLetterRow={mode === "letters" && idx === 2}
            isLastSymbolRow={mode !== "letters" && idx === 2}
            shift={shift}
            mode={mode}
            onTap={tap}
            onShift={handleShift}
            onBackspace={handleBackspace}
          />
        ))}

        {/* ── Bottom bar: mode · space · return ── */}
        <div className="flex items-stretch gap-[6px] mt-0.5">
          <ModeKey
            label={mode === "letters" ? "123" : "ABC"}
            onClick={() =>
              switchMode(mode === "letters" ? "numbers" : "letters")
            }
          />
          {mode !== "letters" && (
            <ModeKey
              label={mode === "numbers" ? "#+=" : "123"}
              onClick={() =>
                switchMode(mode === "numbers" ? "symbols" : "numbers")
              }
            />
          )}
          <SpaceKey onClick={() => tap(" ")} />
          <ReturnKey onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Internals ─────────────────────── */

/**
 * Press-and-hold helper.
 *
 * 1. Fires onPress() immediately on pointerdown (zero click latency).
 * 2. After REPEAT_INITIAL_DELAY_MS, starts firing onRepeat() every
 *    REPEAT_INTERVAL_MS until the pointer is released or cancelled.
 * 3. Uses pointer capture so repeating continues if the finger drifts
 *    off the key — release anywhere ends it.
 * 4. Calls preventDefault on pointerdown to keep focus on the textarea,
 *    which is what makes cursor-aware insertion work in the parent.
 */
function useRepeatable(onPress: () => void, onRepeat: () => void) {
  const pressRef = useRef(onPress);
  const repeatRef = useRef(onRepeat);
  pressRef.current = onPress;
  repeatRef.current = onRepeat;

  const delayId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (delayId.current !== null) {
      clearTimeout(delayId.current);
      delayId.current = null;
    }
    if (intervalId.current !== null) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* best-effort */
      }
      pressRef.current();
      stop();
      delayId.current = setTimeout(() => {
        intervalId.current = setInterval(() => {
          repeatRef.current();
        }, REPEAT_INTERVAL_MS);
      }, REPEAT_INITIAL_DELAY_MS);
    },
    [stop],
  );

  return {
    onPointerDown,
    onPointerUp: stop,
    onPointerCancel: stop,
    onPointerLeave: stop,
    onClick: (e: React.MouseEvent) => e.preventDefault(),
  };
}

function KeyboardRow({
  keys,
  rowIndex,
  isLastLetterRow,
  isLastSymbolRow,
  shift,
  mode,
  onTap,
  onShift,
  onBackspace,
}: {
  keys: string[];
  rowIndex: number;
  isLastLetterRow: boolean;
  isLastSymbolRow: boolean;
  shift: ShiftState;
  mode: KeyboardMode;
  onTap: (char: string, opts?: { isRepeat?: boolean }) => void;
  onShift: () => void;
  onBackspace: (opts?: { isRepeat?: boolean }) => void;
}) {
  // Middle row in letter mode gets the classic ASDF stagger indent.
  const indent =
    mode === "letters" && rowIndex === 1 ? "px-[5.5%]" : "px-0";

  return (
    <div className={`flex items-stretch gap-[6px] ${indent}`}>
      {isLastLetterRow && (
        <ShiftKey
          shift={shift}
          onClick={onShift}
        />
      )}
      {keys.map((k) => (
        <KeyCap
          key={k}
          char={k}
          display={renderChar(k, mode, shift)}
          onTap={onTap}
        />
      ))}
      {(isLastLetterRow || isLastSymbolRow) && (
        <BackspaceKey onBackspace={onBackspace} />
      )}
    </div>
  );
}

function renderChar(
  char: string,
  mode: KeyboardMode,
  shift: ShiftState,
): string {
  if (mode !== "letters") return char;
  return shift === "off" ? char : char.toUpperCase();
}

/* ─────────────────────── Key primitives ─────────────────────── */

function KeyCap({
  char,
  display,
  onTap,
}: {
  char: string;
  display: string;
  onTap: (char: string, opts?: { isRepeat?: boolean }) => void;
}) {
  const [previewing, setPreviewing] = useState(false);

  const handlers = useRepeatable(
    () => onTap(char),
    () => onTap(char, { isRepeat: true }),
  );

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    setPreviewing(true);
    handlers.onPointerDown(e);
  };
  const dismiss = () => {
    setPreviewing(false);
    handlers.onPointerUp();
  };

  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerUp={dismiss}
      onPointerCancel={dismiss}
      onPointerLeave={dismiss}
      onClick={handlers.onClick}
      className={
        KEY_LAYOUT +
        "veil-key-char flex-1 min-w-0 " +
        "text-text text-[17px] font-normal tracking-tight " +
        (previewing ? "z-20 " : "")
      }
      aria-label={display}
    >
      {display}
      {previewing && <KeyPreview display={display} />}
    </button>
  );
}

/**
 * Enlarged character bubble that floats above a held key.
 * Appears in 120 ms so it feels instant (not a delayed tooltip).
 * Centered via inset-x-0 + mx-auto to avoid transform conflicts
 * with the entrance animation.
 */
function KeyPreview({ display }: { display: string }) {
  return (
    <span
      aria-hidden="true"
      className={
        "pointer-events-none absolute inset-x-0 mx-auto w-fit " +
        "bottom-[calc(100%+6px)] " +
        "min-w-[46px] h-[60px] px-3 " +
        "rounded-[10px] " +
        "bg-elevated " +
        "border border-line/50 " +
        "shadow-[0_8px_20px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.25)] " +
        "grid place-items-center " +
        "text-text text-[30px] font-normal leading-none " +
        "veil-key-preview-pop"
      }
    >
      {display}
    </span>
  );
}

/**
 * Shift key with three visual states:
 *   off  → modifier style (receded)
 *   on   → accent tint (one-shot armed)
 *   lock → full accent fill (caps lock)
 */
function ShiftKey({
  shift,
  onClick,
}: {
  shift: ShiftState;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={
        KEY_LAYOUT +
        "px-3 min-w-[44px] grid place-items-center " +
        (shift === "lock"
          ? "veil-key-send "
          : shift === "on"
            ? "veil-key-mod !bg-wa-green/20 "
            : "veil-key-mod ")
      }
      aria-pressed={shift !== "off"}
      aria-label={
        shift === "lock" ? "Caps lock on" : shift === "on" ? "Shift on" : "Shift"
      }
    >
      <ShiftIcon locked={shift === "lock"} active={shift !== "off"} />
    </button>
  );
}

function BackspaceKey({
  onBackspace,
}: {
  onBackspace: (opts?: { isRepeat?: boolean }) => void;
}) {
  const handlers = useRepeatable(
    () => onBackspace(),
    () => onBackspace({ isRepeat: true }),
  );
  return (
    <button
      type="button"
      {...handlers}
      className={
        KEY_LAYOUT +
        "veil-key-mod grid place-items-center px-3 min-w-[44px] text-text"
      }
      aria-label="Backspace"
    >
      <BackspaceIcon />
    </button>
  );
}

function ModeKey({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={
        KEY_LAYOUT +
        "veil-key-mod text-text text-[13px] font-semibold tracking-wide px-2.5 min-w-[46px]"
      }
    >
      {label}
    </button>
  );
}

function SpaceKey({ onClick }: { onClick: () => void }) {
  const handlers = useRepeatable(onClick, onClick);
  return (
    <button
      type="button"
      {...handlers}
      className={
        KEY_LAYOUT +
        "veil-key-mod flex-1 grid place-items-center " +
        "text-text-muted text-[11.5px] tracking-[0.2em] uppercase font-medium"
      }
      aria-label="Space"
    >
      space
    </button>
  );
}

function ReturnKey({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={
        KEY_LAYOUT +
        "veil-key-send grid place-items-center px-4 min-w-[76px] text-text-oncolor"
      }
      aria-label="Send"
    >
      <SendArrowIcon />
    </button>
  );
}

/* ─────────────────────── Icons ─────────────────────── */

function LockMiniIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
      aria-hidden="true"
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  );
}

function ChevronDownMini() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/**
 * Shift arrow — filled when active/locked, outline when off.
 * The filled version matches how Gboard and iOS render shift-on.
 */
function ShiftIcon({
  locked,
  active,
}: {
  locked: boolean;
  active: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[19px]"
      aria-hidden="true"
    >
      {locked || active ? (
        /* Filled arrow — shift is engaged */
        <path
          d="M12 3L2 14h6v7h8v-7h6L12 3z"
          fill="currentColor"
          opacity={locked ? 1 : 0.75}
        />
      ) : (
        /* Outline arrow — shift off */
        <path
          d="M12 3L2 14h6v7h8v-7h6L12 3z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function BackspaceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[19px]"
      aria-hidden="true"
    >
      <path d="M21 5H9.5a2 2 0 0 0-1.5.7L3 12l5 6.3A2 2 0 0 0 9.5 19H21a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
      <path d="M18 9l-6 6" />
      <path d="M12 9l6 6" />
    </svg>
  );
}

function SendArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-[18px] -translate-x-px"
      aria-hidden="true"
    >
      <path d="M3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a1 1 0 0 0-1.39 1.18l2.1 7.04a1 1 0 0 0 .83.71l9.5 1.18c.34.04.34.54 0 .58l-9.5 1.18a1 1 0 0 0-.83.71l-2.1 7.04a1 1 0 0 0 1.39 1.18z" />
    </svg>
  );
}
