"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type FormEvent, useState } from "react";

/**
 * ETS vNext — Quiet Construction Teaser (Interspace-style)
 * One-screen React layout using TailwindCSS.
 * - Hero (centered): headline, one-line explainer, email capture with hashtag button
 * - Footer: socials + minimal links, no logo
 * - Typography: Helvetica Neue
 */

export default function ETSTeaser() {
  return (
    <div className="min-h-screen w-full font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-[#0A0A0A] selection:bg-black/10 selection:text-black">
      {/* Background: more pronounced gradient + faint dot grid */}
      <BackgroundTexture />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-between">
        <Hero />
        <Footer />
      </main>
    </div>
  );
}

function Hero() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [flickerText, setFlickerText] = useState("");

  // Curated tags with mysterious prices
  const tags = [
    { tag: "#btc", price: "0.0001" },
    { tag: "#eth", price: "0.0001" },
    { tag: "#money", price: "0.0420" },
    { tag: "#gm", price: "0.0001" },
    { tag: "#wagmi", price: "0.0001" },
    { tag: "#ngmi", price: "0.0000" },
    { tag: "#fomo", price: "0.0069" },
    { tag: "#hodl", price: "0.0001" },
    { tag: "#alpha", price: "0.0100" },
    { tag: "#degen", price: "0.0001" },
    { tag: "#wen", price: "0.0001" },
    { tag: "#ser", price: "0.0007" },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Pick a random tag for the flicker
    const randomTag = tags[Math.floor(Math.random() * tags.length)];
    setFlickerText(`${randomTag.tag} ${randomTag.price}`);

    // Show flicker briefly
    await new Promise((resolve) => setTimeout(resolve, 200));
    setFlickerText("");

    // Proceed with actual submission
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "You're early.");
        setEmail(""); // Clear the input

        // Reset after 3 seconds
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch (_error) {
      setStatus("error");
      setMessage("Connection failed");
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-balance text-4xl font-bold tracking-tight sm:text-5xl"
      >
        Hashtags were always money.
      </motion.h1>

      {/* One-line explainer */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-4 max-w-xl text-lg text-black/70 sm:text-xl"
      >
        We didn't invent this. We just made it visible.
      </motion.p>

      {/* Email capture with hashtag button */}
      <motion.form
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        onSubmit={handleSubmit}
        className="mt-8 relative w-full max-w-md"
      >
        <div className="flex w-full items-center gap-2 rounded-2xl border border-black/10 bg-white/60 p-1 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur supports-[backdrop-filter]:bg-white/55">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@paragraph.xyz"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-transparent px-3 py-2 text-base placeholder:text-black/40 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            aria-label="Submit email"
            disabled={status === "loading"}
            className={`flex items-center justify-center rounded-xl bg-black px-4 py-2 text-base font-semibold text-white transition ${
              status === "loading" ? "animate-pulse" : "hover:opacity-90"
            } disabled:cursor-not-allowed`}
          >
            #
          </button>
        </div>

        {/* Price flicker - appears briefly on click */}
        <AnimatePresence>
          {flickerText && (
            <motion.p
              key="flicker"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute -bottom-8 left-0 right-0 text-center text-sm text-black/70"
            >
              <span className="font-mono">{flickerText}</span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Status message - Mad Max style: minimal, no fluff */}
        <AnimatePresence>
          {message && !flickerText && (
            <motion.p
              key="status-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute -bottom-8 left-0 right-0 text-center text-sm ${
                status === "success" ? "text-black/70" : "text-red-600/70"
              }`}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.form>
    </section>
  );
}

function Footer() {
  return (
    <footer className="w-full px-6 pb-8 pt-10">
      <div className="mx-auto max-w-3xl border-t border-black/10 pt-6">
        <div className="flex flex-col items-center gap-3 text-sm text-black/70">
          {/* Socials row */}
          <div className="flex items-center gap-5">
            <a
              href="https://farcaster.xyz/ets"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              Farcaster
            </a>
            <a
              href="https://x.com/etsxyz"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              X / Twitter
            </a>
          </div>

          <div className="text-xs text-black/60">
            <span>© Ethereum Tag Service 2025</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Background texture */
function BackgroundTexture() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* gradient - stronger and more pronounced */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#F2F4F8_0%,#D4D8E0_40%,#BFC4CC_100%)]" />
      {/* subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #000 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
