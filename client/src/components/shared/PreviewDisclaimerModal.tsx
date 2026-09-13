import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Ban, FlaskConical, WalletMinimal } from "lucide-react";

interface PreviewDisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

const POINTS = [
  {
    icon: FlaskConical,
    title: "This is a preview build",
    body: "A portfolio demo running on the TON test network. It is not a live product, and development is currently paused.",
  },
  {
    icon: Ban,
    title: "Nothing here has any value",
    body: "Stone, Dust and Rock Coins are numbers in a database. There is no token, no airdrop, and no way to cash anything out.",
  },
  {
    icon: WalletMinimal,
    title: "Never send real funds",
    body: "Do not buy anything claiming to be this project, and do not connect a wallet holding real assets. Balances may be reset at any time.",
  },
];

export const PreviewDisclaimerModal = ({
  isOpen,
  onAccept,
}: PreviewDisclaimerModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200]"
          />

          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="preview-disclaimer-title"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="w-full max-w-sm my-auto bg-[#151b28] border border-amber-500/25 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Warning header */}
              <div className="bg-gradient-to-b from-amber-500/15 to-transparent px-6 pt-7 pb-5 text-center border-b border-white/5">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/30 mb-4">
                  <AlertTriangle className="w-7 h-7 text-amber-400" />
                </div>

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400/80 mb-2">
                  Read before you play
                </p>

                <h2
                  id="preview-disclaimer-title"
                  className="text-xl font-black text-white leading-tight tracking-tight"
                >
                  Demo only — not an investment
                </h2>
              </div>

              {/* Points */}
              <div className="px-6 py-5 flex flex-col gap-4">
                {POINTS.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex gap-3">
                    <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white leading-snug">
                        {title}
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="px-6 pb-6 pt-1">
                <button
                  onClick={onAccept}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black text-sm font-black uppercase tracking-wide transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#151b28]"
                >
                  I understand — continue
                </button>

                <p className="text-[10px] text-slate-500 text-center mt-3 leading-relaxed">
                  Shown every time the app opens.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
