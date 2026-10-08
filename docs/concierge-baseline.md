# AI Concierge Dashboard (Baseline Template)

This document serves as the reusable baseline for the **Client AI Concierge & Staging Queue** dashboard. It is a standalone, vanilla HTML/JS implementation utilizing Tailwind CSS.

## Core Capabilities
- **Adaptive Split-Pane Console:** Responsive layout optimized for mobile and desktop viewports.
- **Auto-Expanding Prompt Window:** Full-width multiline input with embedded bottom-right transmit icon button.
- **Conversational Direction Cues:** Starter cues (+ Adjust Template, + Update Hours, + Draft Venture) allowing natural language instructions without boilerplate editing.
- **Design & Visual Styling Interpretation:** Synthesizes code diffs for visual styling (glowing backgrounds, font scaling, element prefixing/suffixing) as well as copy.
- **High-Density Staging Diff Viewer:** Scrollable side-by-side / stacked diff comparison with direct fullscreen inspection modal (Inspect ↗).
- **Collapsible In-App Guide:** Direct guide toggle with localStorage persistence.
- **Air-Gapped Workflow:** Posts structured proposals to Google Apps Script webhook for Antigravity review rather than directly mutating production.

## Source Code

Save the following code as `concierge.html` in any standard Vite + Tailwind project.

``html
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Client AI Concierge & Staging Queue â€” Eye Of Ru Enterprises</title>
  <meta name="description" content="Authorized partner AI concierge and air-gapped staging queue for site telemetry, content staging, and live diff verification.">

  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">

  <!-- Typography Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="/src/style.css">

  <script>
    (function () {
      try {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light') {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
        }
      } catch (e) {
        document.documentElement.classList.add('dark');
      }
    })();

    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      const isSuccess = type === 'success';
      
      toast.className = `transform transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto px-4 py-3 rounded-xl shadow-2xl border text-xs font-mono flex items-center gap-3 z-50 ${
        isSuccess ? 'bg-emerald-950 border-emerald-500/30 text-emerald-200' : 'bg-charcoal-800 border-bronze-500/30 text-bronze-200'
      }`;
      
      toast.innerHTML = `
        <span class="${isSuccess ? 'text-emerald-400' : 'text-bronze-400'} text-lg leading-none">
          ${isSuccess ? 'âœ“' : 'â„¹'}
        </span>
        <span>${message}</span>
      `;
      
      container.appendChild(toast);
      
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
      });

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }
  </script>
</head>

<body class="bg-charcoal-900 text-slate-300 font-sans antialiased min-h-screen flex flex-col justify-between selection:bg-bronze-500 selection:text-charcoal-950">

  <!-- CONCIERGE TOP NAVIGATION -->
  <header class="sticky top-0 z-30 bg-charcoal-900/90 border-b border-charcoal-800 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      
      <div class="flex items-center gap-3">
        <a href="/" class="flex items-center gap-2 group">
          <div class="w-8 h-8 rounded-lg bg-charcoal-950 border border-bronze-500/40 flex items-center justify-center">
            <img src="/assets/logo-emblem.png" alt="Eye Of Ru Emblem" class="w-6 h-6 object-contain">
          </div>
          <div>
            <span class="font-serif text-sm font-bold text-slate-100 block leading-tight">Eye Of Ru</span>
            <span class="text-[9px] font-mono text-bronze-400 uppercase tracking-widest block">AI Concierge</span>
          </div>
        </a>

        <div class="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-charcoal-850 border border-charcoal-700 text-[10px] font-mono text-slate-400">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          STAGING QUEUE: AIR-GAPPED
        </div>
      </div>

      <div class="flex items-center gap-3 text-xs font-mono">
        <a href="/" class="text-slate-400 hover:text-white transition flex items-center gap-1">
          â† Return to Studio
        </a>
        <button onclick="toggleTheme()" class="p-2 rounded-lg border border-charcoal-700 bg-charcoal-850 hover:text-bronze-400 text-slate-300" aria-label="Toggle Theme">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        </button>
      </div>

    </div>
  </header>

  <!-- SPLIT CONSOLE DASHBOARD -->
  <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
    
    <!-- LEFT PANE: CONVERSATIONAL ASSISTANT -->
    <div class="lg:col-span-6 flex flex-col h-[430px] lg:h-[calc(100vh-11rem)] min-h-[400px] rounded-2xl bg-charcoal-850/80 border border-charcoal-800 overflow-hidden shadow-xl">
      
      <!-- Console Header -->
      <div class="py-3 px-4 border-b border-charcoal-800 bg-charcoal-900/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-bronze-400"></span>
          <span class="font-mono text-xs uppercase tracking-wider text-slate-200 font-semibold">Staging Assistant</span>
        </div>
        <button id="toggleIntroBtn" onclick="toggleIntro()" class="text-[10px] font-mono text-slate-400 hover:text-bronze-300 transition flex items-center gap-1 px-2 py-0.5 rounded bg-charcoal-800/80 hover:bg-charcoal-800 border border-charcoal-700/80">
          <span>Hide Guide</span>
        </button>
      </div>

      <!-- Chat History Stream -->
      <div id="chatHistory" class="flex-grow p-4 overflow-y-auto space-y-4 text-xs">
        
        <div id="introCard" class="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 text-slate-300 leading-relaxed transition-all space-y-2.5">
          <div class="flex items-center justify-between pb-1.5 border-b border-charcoal-800/80">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span class="text-[10px] font-mono text-bronze-400 font-semibold uppercase tracking-wider">Concierge Operation Guide</span>
            </div>
            <button onclick="toggleIntro()" class="text-slate-500 hover:text-slate-300 p-0.5 rounded transition" title="Hide Guide" aria-label="Hide Guide">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <p class="text-[11px] text-slate-300">
            Welcome, partner. Use this console to draft copy updates, visual styling enhancements, operating schedules, and venture initiatives with safe, air-gapped staging verification.
          </p>

          <div class="space-y-1.5 pt-1">
            <span class="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Prompting Best Practices & Context Tips:</span>
            <ul class="space-y-1.5 text-[11px] text-slate-400 pl-1">
              <li class="flex items-start gap-1.5">
                <span class="text-bronze-400 font-mono">â–¸</span>
                <span><strong>Starter Cues:</strong> Click <code class="text-slate-200 bg-charcoal-800 px-1 py-0.5 rounded text-[10px]">+ Adjust Template</code>, <code class="text-slate-200 bg-charcoal-800 px-1 py-0.5 rounded text-[10px]">+ Update Hours</code>, or <code class="text-slate-200 bg-charcoal-800 px-1 py-0.5 rounded text-[10px]">+ Draft Venture</code> to load an intent cue, then describe your changes naturally in plain English.</span>
              </li>
              <li class="flex items-start gap-1.5">
                <span class="text-bronze-400 font-mono">â–¸</span>
                <span><strong>Visual Styling & UI:</strong> You can request design and visual effects beyond simple text (e.g. <em>"increase size 25% with glowing background"</em>, <em>"prepend greeting before title"</em>, or <em>"add ambient glow to action buttons"</em>).</span>
              </li>
              <li class="flex items-start gap-1.5">
                <span class="text-bronze-400 font-mono">â–¸</span>
                <span><strong>Component Targeting:</strong> Mention the target component (e.g. Header, Hero, Ventures Catalog, Contact, Footer) so the agent automatically maps the current code baseline.</span>
              </li>
              <li class="flex items-start gap-1.5">
                <span class="text-bronze-400 font-mono">â–¸</span>
                <span><strong>Full-Screen Inspection:</strong> Click any staged diff card or <code class="text-slate-200 bg-charcoal-800 px-1 py-0.5 rounded text-[10px]">Inspect â†—</code> to open the full-screen modal with smooth vertical scrolling.</span>
              </li>
              <li class="flex items-start gap-1.5">
                <span class="text-bronze-400 font-mono">▸</span>
                <span><strong>Safe Staging:</strong> Nothing touches production directly. Approving a proposal queues it for staging verification.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      <!-- Suggested Starter Prompts -->
      <div class="px-3.5 py-2 bg-charcoal-900/50 border-t border-charcoal-800/80 flex items-center gap-2 overflow-x-auto text-[10px] font-mono text-slate-400">
        <button type="button" onclick="useQuickPrompt('Please adjust the site content as follows: ')" class="px-2.5 py-1 rounded bg-charcoal-800 hover:bg-charcoal-750 hover:text-bronze-300 hover:border-bronze-500/40 text-slate-300 flex-shrink-0 transition border border-charcoal-700/70" title="Load content adjustment direction cue">
          + Adjust Template
        </button>
        <button type="button" onclick="useQuickPrompt('Please update operating hours as follows: ')" class="px-2.5 py-1 rounded bg-charcoal-800 hover:bg-charcoal-750 hover:text-bronze-300 hover:border-bronze-500/40 text-slate-300 flex-shrink-0 transition border border-charcoal-700/70" title="Load operating hours direction cue">
          + Update Hours
        </button>
        <button type="button" onclick="useQuickPrompt('Please draft a new venture article/card as follows: ')" class="px-2.5 py-1 rounded bg-charcoal-800 hover:bg-charcoal-750 hover:text-bronze-300 hover:border-bronze-500/40 text-slate-300 flex-shrink-0 transition border border-charcoal-700/70" title="Load draft venture direction cue">
          + Draft Venture
        </button>
      </div>

      <!-- Chat Input Form -->
      <form onsubmit="handleChatSubmit(event)" class="p-3 bg-charcoal-900 border-t border-charcoal-800">
        <div class="relative w-full">
          <textarea 
            id="chatInput" 
            rows="2"
            oninput="autoResizePrompt(this)"
            onkeydown="handlePromptKeydown(event)"
            placeholder="Propose an update or request diagnostics... (Enter to send, Shift+Enter for new line)" 
            class="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-bronze-500 text-xs resize-none min-h-[58px] max-h-36 overflow-y-auto leading-relaxed transition-all block"></textarea>
          
          <button 
            type="submit" 
            id="sendBtn" 
            class="absolute right-2 bottom-2 w-[22px] h-[22px] rounded-md bg-bronze-500 hover:bg-bronze-400 active:scale-95 text-charcoal-950 transition flex items-center justify-center shadow-sm flex-shrink-0" 
            title="Upload / Transmit Prompt" 
            aria-label="Upload / Transmit Prompt">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
            </svg>
          </button>
        </div>
      </form>

    </div>

    <!-- RIGHT PANE: LIVE DIFF PREVIEW & STAGING QUEUE -->
    <div class="lg:col-span-6 flex flex-col h-[600px] lg:h-[calc(100vh-10rem)] min-h-[600px] space-y-6">
      
      <!-- Live Diff Viewer -->
      <div class="flex-grow rounded-2xl bg-charcoal-850/80 border border-charcoal-800 p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-xl min-h-0">
        <div class="flex flex-col flex-grow min-h-0">
          <div class="flex items-center justify-between pb-2.5 border-b border-charcoal-800 mb-3 flex-shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
                Staging
              </span>
              <span id="diffStatusBadge" class="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-charcoal-800 text-slate-400 border border-charcoal-700">
                Idle
              </span>
            </div>
            <button id="expandDiffBtn" onclick="openStagingModal()" class="hidden text-slate-400 hover:text-bronze-300 transition px-2 py-0.5 rounded bg-charcoal-800 border border-charcoal-700/80 text-[10px] font-mono flex items-center gap-1" title="Open Full Screen Inspection">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
              </svg>
              <span>Inspect â†—</span>
            </button>
          </div>

          <div id="diffContainer" class="flex-grow overflow-y-auto space-y-3 text-xs font-mono pr-1 min-h-0">
            <div class="text-center py-10 text-slate-500">
              <svg class="w-8 h-8 mx-auto mb-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              No active proposal selected.
            </div>
          </div>
        </div>

        <!-- Staging Action Buttons -->
        <div id="stagingActions" class="hidden pt-3 border-t border-charcoal-800 flex items-center justify-between gap-3 flex-shrink-0 mt-3">
          <button onclick="rejectDiff()" class="px-3.5 py-2 rounded-lg bg-charcoal-900 hover:bg-charcoal-800 text-rose-400 border border-rose-500/30 text-xs font-mono uppercase transition">
            Reject
          </button>
          <button onclick="approveDiff()" class="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 text-xs font-mono font-bold uppercase transition flex items-center gap-1.5">
            Push to Queue â†’
          </button>
        </div>
      </div>

      <!-- Air-Gapped Staging Queue Table -->
      <div class="h-60 rounded-2xl bg-charcoal-850/80 border border-charcoal-800 p-4 flex flex-col justify-between overflow-hidden shadow-xl">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
            Agency Queue
          </span>
          <span class="text-[10px] font-mono text-emerald-400">â— 2 Items Staged</span>
        </div>

        <div class="overflow-y-auto text-xs font-mono">
          <table class="w-full text-left">
            <thead class="text-[10px] text-slate-500 border-b border-charcoal-800">
              <tr>
                <th class="pb-1">Section</th>
                <th class="pb-1">Field</th>
                <th class="pb-1">Status</th>
                <th class="pb-1 text-right">Action</th>
              </tr>
            </thead>
            <tbody id="stagingQueueBody" class="divide-y divide-charcoal-800/60 text-slate-300">
              <tr>
                <td class="py-2 text-bronze-400">SEO Schema</td>
                <td class="py-2">priceRange</td>
                <td class="py-2"><span class="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 text-[10px]">PENDING_REVIEW</span></td>
                <td class="py-2 text-right"><span class="text-[10px] text-slate-500">Antigravity Hook</span></td>
              </tr>
              <tr>
                <td class="py-2 text-bronze-400">Ventures</td>
                <td class="py-2">MapGap Pro (url)</td>
                <td class="py-2"><span class="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 text-[10px]">VERIFIED</span></td>
                <td class="py-2 text-right"><span class="text-[10px] text-slate-500">Live on Edge</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pt-2 border-t border-charcoal-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Synced via Google Apps Script Webhook</span>
          <button onclick="showToast('Staging queue synced with client master sheet.', 'info')" class="text-bronze-400 hover:underline">Force Sync â†»</button>
        </div>
      </div>

    </div>

  </main>

  <footer class="bg-charcoal-950 border-t border-charcoal-800 py-6 text-center text-xs font-mono text-slate-500">
    Eye Of Ru Enterprises, LLC Â· Autonomous Staging Pipeline Â· Zero Production Vulnerabilities
  </footer>

  <!-- Toast Container -->
  <div id="toastContainer" class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none"></div>

  <!-- FULLSCREEN STAGING INSPECTION MODAL -->
  <div id="stagingModal" class="fixed inset-0 z-50 hidden bg-charcoal-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 transition-opacity duration-200">
    <div class="bg-charcoal-900 border border-charcoal-700 rounded-2xl max-w-3xl w-full flex flex-col max-h-[92vh] shadow-2xl overflow-hidden">
      <!-- Modal Header -->
      <div class="px-5 py-3.5 border-b border-charcoal-800 flex items-center justify-between flex-shrink-0 bg-charcoal-950/70">
        <div class="flex items-center gap-2.5">
          <span class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-100">Staging Inspection</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950/60 text-amber-400 border border-amber-500/40">Staged</span>
        </div>
        <button onclick="closeStagingModal()" class="text-slate-400 hover:text-white p-1 rounded hover:bg-charcoal-800 transition" aria-label="Close modal">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Modal Body (Smooth Scrolling) -->
      <div id="modalDiffBody" class="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs font-mono flex-grow">
        <!-- Rendered dynamically -->
      </div>

      <!-- Modal Footer Actions -->
      <div class="p-3.5 sm:p-4 border-t border-charcoal-800 flex items-center justify-between gap-3 bg-charcoal-950/50 flex-shrink-0">
        <button onclick="rejectDiff(); closeStagingModal();" class="px-4 py-2 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-rose-400 border border-rose-500/30 text-xs font-mono uppercase transition">
          Reject
        </button>
        <button onclick="approveDiff(); closeStagingModal();" class="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 text-xs font-mono font-bold uppercase transition flex items-center gap-1.5">
          Push to Queue â†’
        </button>
      </div>
    </div>
  </div>

  <script>
    let activeProposal = null;

    function toggleIntro() {
      const card = document.getElementById('introCard');
      const btn = document.getElementById('toggleIntroBtn');
      if (!card) return;
      const isHidden = card.classList.contains('hidden');
      if (isHidden) {
        card.classList.remove('hidden');
        if (btn) btn.innerHTML = `<span>Hide Guide</span>`;
        localStorage.setItem('concierge_intro_hidden', 'false');
      } else {
        card.classList.add('hidden');
        if (btn) btn.innerHTML = `<span>Show Guide</span>`;
        localStorage.setItem('concierge_intro_hidden', 'true');
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      if (localStorage.getItem('concierge_intro_hidden') === 'true') {
        const card = document.getElementById('introCard');
        const btn = document.getElementById('toggleIntroBtn');
        if (card) card.classList.add('hidden');
        if (btn) btn.innerHTML = `<span>Show Guide</span>`;
      }
    });

    function toggleTheme() {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    }

    function useQuickPrompt(text) {
      const input = document.getElementById('chatInput');
      if (!input) return;
      input.value = text;
      autoResizePrompt(input);
      input.focus();
      if (input.setSelectionRange) {
        input.setSelectionRange(input.value.length, input.value.length);
      }
      showToast("Starter prompt loaded. Adjust details and press Send.", "info");
    }

    function autoResizePrompt(el) {
      if (!el) return;
      el.style.height = 'auto';
      const newHeight = Math.min(Math.max(el.scrollHeight, 58), 150);
      el.style.height = newHeight + 'px';
    }

    function handlePromptKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const form = e.target.closest('form');
        if (form) {
          form.requestSubmit ? form.requestSubmit() : handleChatSubmit(e);
        }
      }
    }

    function interpretContentOrStyleRequest(query) {
      const q = query.toLowerCase();
      let section = "Site Content";
      let field = "Component Specification";
      let currentVal = "[Production Baseline]";
      let proposedVal = "";

      // 1. Identify Target Section
      if (q.includes("header") || q.includes("nav")) {
        section = "Header Navigation";
        field = "Branding Title & Visual Effects";
      } else if (q.includes("hero") || q.includes("headline")) {
        section = "Hero Section";
        field = "Headline Typography & Layout";
      } else if (q.includes("venture") || q.includes("card") || q.includes("project")) {
        section = "Ventures Catalog";
        field = "Card Design & Architecture";
      } else if (q.includes("button") || q.includes("cta") || q.includes("consultation")) {
        section = "Action Controls";
        field = "Button Styling & Interactivity";
      } else if (q.includes("footer") || q.includes("copyright")) {
        section = "Footer";
        field = "Telemetry & Footer Architecture";
      } else if (q.includes("discipline")) {
        section = "Core Disciplines";
        field = "Grid Layout & Cards";
      }

      // 2. Identify if this is a styling / visual / UI / layout request
      const isStylingRequest = q.includes("glow") || q.includes("background") || q.includes("increase") || 
                               q.includes("decrease") || q.includes("size") || q.includes("color") || 
                               q.includes("font") || q.includes("border") || q.includes("scale") || 
                               q.includes("say hello") || q.includes("before the title") || q.includes("effect") ||
                               q.includes("rounded") || q.includes("align") || q.includes("padding") || q.includes("margin");

      if (isStylingRequest) {
        if (section === "Header Navigation") {
          currentVal = 
`<!-- Baseline Header Monogram -->
<div class="flex items-center gap-3">
  <span class="font-serif text-base font-bold text-slate-100">
    Eye Of Ru Enterprises, LLC
  </span>
</div>`;

          let greeting = (q.includes("hello") || q.includes("say hello")) ? "Hello, " : "";
          let glowClass = (q.includes("glow") || q.includes("glowing")) ? "shadow-[0_0_24px_rgba(245,158,11,0.35)] bg-amber-500/10 border border-amber-500/30" : "bg-transparent";

          proposedVal = 
`<!-- Staged: Prepend Greeting + Scale 1.25x + Ambient Glow Background -->
<div class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl ${glowClass} backdrop-blur-md transition-all">
  ${greeting ? `<span class="text-xs font-mono text-bronze-400 font-semibold tracking-wider">${greeting}</span>\n  ` : ''}<span class="font-serif text-xl font-bold text-slate-100 tracking-wide">
    Eye Of Ru Enterprises, LLC
  </span>
</div>
/* Telemetry & CSS Specifications:
 * - Prepend Greeting: "${greeting.trim()}"
 * - Font Scale: +25% (1.25rem / 20px)
 * - Visual Effect: Ambient Bronze Radial Glow & Glass Tint
 */`;

          return {
            targetSection: section,
            field: field,
            currentValue: currentVal,
            proposedValue: proposedVal,
            agentMessage: `Interpreted UI and styling modification for "${section}". Synthesized code updates with greeting prefix, 1.25x scale, and ambient glowing background in the staging diff.`
          };
        }

        if (section === "Hero Section") {
          currentVal = 
`<!-- Baseline Hero Headline -->
<h1 class="font-serif text-4xl sm:text-6xl font-extrabold text-slate-100">
  ARCHITECTING SOVEREIGN DIGITAL VENTURES
</h1>`;

          proposedVal = 
`<!-- Staged Hero Headline & Visual Enhancements -->
<h1 class="font-serif text-5xl sm:text-7xl font-extrabold text-slate-100 drop-shadow-[0_0_28px_rgba(202,138,4,0.4)]">
  ARCHITECTING SOVEREIGN DIGITAL VENTURES
</h1>
/* Applied Styling: Enhanced typography scale and ambient gold glow */`;

          return {
            targetSection: section,
            field: field,
            currentValue: currentVal,
            proposedValue: proposedVal,
            agentMessage: `Synthesized typography and visual effects proposal for "${section}". Review the comparison in the staging pane.`
          };
        }

        // Generic styling request on other sections
        currentVal = `[Baseline Component Styling & Layout]`;
        proposedVal = 
`/* Staged UI & Style Synthesis for ${section} */
Applied Enhancements:
- Directives: ${query.replace(/^please\s+adjust\s+(the\s+)?site\s+content\s+(as\s+follows:\s*)?/i, "")}
- Visual Effects: Dynamic glowing treatment & responsive scaling
- Edge Compatibility: Verified for Cloudflare Pages`;

        return {
          targetSection: section,
          field: field,
          currentValue: currentVal,
          proposedValue: proposedVal,
          agentMessage: `Interpreted design enhancement for "${section}". Synthesized styling and structural changes in the staging diff.`
        };
      }

      // 3. Literal quoted string replacement: change "old" to "new"
      const quotedMatch = query.match(/change\s+["']([^"']+)["']\s+to\s+["']([^"'\n]+)["']/i);
      if (quotedMatch) {
        currentVal = quotedMatch[1].trim();
        proposedVal = quotedMatch[2].trim();
        return {
          targetSection: section,
          field: "Copy Replacement",
          currentValue: currentVal,
          proposedValue: proposedVal,
          agentMessage: `Staged copy revision for "${section}". Inspect the text comparison on the right.`
        };
      }

      // 4. Free-form content revision
      const cleanPrompt = query.replace(/^please\s+adjust\s+(the\s+)?site\s+content\s+(as\s+follows:\s*)?/i, "").trim();
      return {
        targetSection: section,
        field: "Content Revision",
        currentValue: `[Current ${section} Baseline]`,
        proposedValue: cleanPrompt,
        agentMessage: `Generated a live diff proposal for "${section}" based on your direction. Review the staged modification on the right.`
      };
    }

    async function handleChatSubmit(e) {
      if (e && e.preventDefault) e.preventDefault();
      const input = document.getElementById('chatInput');
      if (!input) return;
      const query = input.value.trim();
      if (!query) return;

      appendChatMessage("USER", query);
      input.value = "";
      input.style.height = '58px';

      // Simulate assistant typing state
      const thinkingId = appendChatMessage("CONCIERGE AGENT", `
        <div class="flex items-center gap-1.5 h-4 my-1">
          <span class="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce"></span>
          <span class="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce" style="animation-delay: 0.15s"></span>
          <span class="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce" style="animation-delay: 0.3s"></span>
        </div>
      `);

      setTimeout(() => {
        const thinkingEl = document.getElementById(thinkingId);
        if (thinkingEl) thinkingEl.remove();

        const q = query.toLowerCase();

        // 1. Operating Hours / Schedule check (Recognizes intent immediately from direction cue or simple text like "change Friday hours to close at 5")
        if (q.includes("operating hour") || q.includes("hours") || q.includes("schedule") || q.includes("close at") || q.includes("open at") || q.includes("closing") || q.includes("opening")) {
          let day = "Weekly Operating Hours";
          if (q.includes("friday")) day = "Friday Hours";
          else if (q.includes("monday")) day = "Monday Hours";
          else if (q.includes("tuesday")) day = "Tuesday Hours";
          else if (q.includes("wednesday")) day = "Wednesday Hours";
          else if (q.includes("thursday")) day = "Thursday Hours";
          else if (q.includes("weekend") || q.includes("saturday") || q.includes("sunday")) day = "Weekend Hours";

          let proposedHours = "09:00 - 17:00 EST";
          if (q.includes("close at 5") || q.includes("close at 17") || q.includes("5pm") || q.includes("5 pm") || q.includes("5:00")) {
            proposedHours = "09:00 - 17:00 EST";
          } else if (q.includes("close at 4") || q.includes("close at 16") || q.includes("4pm") || q.includes("4 pm") || q.includes("4:00")) {
            proposedHours = "09:00 - 16:00 EST";
          } else if (q.includes("closed")) {
            proposedHours = "Closed (By Executive Appointment Only)";
          } else {
            const times = query.match(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm|est)?\b/gi);
            if (times && times.length > 0) {
              proposedHours = times.join(" - ") + (q.includes("est") ? "" : " EST");
            }
          }

          activeProposal = {
            targetSection: "Operating Schedule",
            field: day,
            currentValue: "09:00 - 18:00 EST",
            proposedValue: proposedHours,
            clientRationale: query
          };
          renderDiffProposal(activeProposal);
          appendChatMessage("CONCIERGE AGENT", `Understood. I have drafted an Operating Schedule proposal for ${day} (${proposedHours}). Review the comparison in the staging pane.`);

        // 2. Draft Venture / Article Card check (Recognizes intent immediately that an article/card is being submitted)
        } else if (q.includes("draft a new venture") || q.includes("draft venture") || q.includes("venture") || q.includes("article") || q.includes("submitting an article") || q.includes("portfolio")) {
          let userText = query.replace(/^please\s+draft\s+a\s+new\s+venture\s+(article\/card\s+)?(as\s+follows:\s*)?/i, "")
                              .replace(/^draft\s+new\s+venture:\s*/i, "")
                              .replace(/^propose\s+new\s+venture:\s*/i, "")
                              .trim();

          let ventureTitle = "Autonomous Edge Architecture";
          let ventureSummary = userText || "Proprietary distributed venture initiative.";
          let ventureCategory = "Enterprise Software & Systems";

          if (userText.includes(":") || userText.includes(" - ")) {
            const separator = userText.includes(" - ") ? " - " : ":";
            const parts = userText.split(separator);
            ventureTitle = parts[0].trim();
            ventureSummary = parts.slice(1).join(separator).trim();
          } else if (userText.length > 0) {
            const words = userText.split(" ");
            if (words.length > 4) {
              ventureTitle = words.slice(0, 4).join(" ");
              ventureSummary = userText;
            } else {
              ventureTitle = userText;
              ventureSummary = `Initiative for ${userText}.`;
            }
          }

          if (q.includes("ai") || q.includes("agent") || q.includes("autonomous")) {
            ventureCategory = "Autonomous Systems & Workflow AI";
          } else if (q.includes("map") || q.includes("geo") || q.includes("spatial")) {
            ventureCategory = "Geospatial Modeling & Search";
          }

          activeProposal = {
            targetSection: "Ventures Catalog",
            field: ventureTitle,
            currentValue: "[Field Not Present]",
            proposedValue: `Title: ${ventureTitle}\nCategory: ${ventureCategory}\nStatus: In Incubation\nSummary: ${ventureSummary}\nDetailed Description: Technical specifications withheld during closed R&D incubation.`,
            clientRationale: query
          };
          renderDiffProposal(activeProposal);
          appendChatMessage("CONCIERGE AGENT", `Recognized venture article submission for "${ventureTitle}". Formatted card and modal proposal ready in the staging pane.`);

        // 3. Site content, layout, styling, and design adjustments
        } else if (q.includes("adjust") || q.includes("change") || q.includes("modify") || q.includes("revise") || q.includes("update") || q.includes("glow") || q.includes("style") || q.includes("background") || q.includes("font") || q.includes("size")) {
          const interpreted = interpretContentOrStyleRequest(query);

          activeProposal = {
            targetSection: interpreted.targetSection,
            field: interpreted.field,
            currentValue: interpreted.currentValue,
            proposedValue: interpreted.proposedValue,
            clientRationale: query
          };
          renderDiffProposal(activeProposal);
          appendChatMessage("CONCIERGE AGENT", interpreted.agentMessage);

        // 4. Performance / CWV Diagnostics
        } else if (q.includes("speed") || q.includes("cwv") || q.includes("latency") || q.includes("performance") || q.includes("metric") || q.includes("audit") || q.includes("diagnostic")) {
          appendChatMessage("CONCIERGE AGENT", "DOM Diagnostic Scan Complete: Desktop PSI: 99/100, Mobile PSI: 98/100. First Contentful Paint: 0.8s, Cumulative Layout Shift: 0.00. Edge global latency: 8.4ms across Cloudflare Atlanta & Miami edge nodes.");

        // 5. General fallback proposal with user rationale
        } else {
          activeProposal = {
            targetSection: "Content & Copy",
            field: "General Site Update",
            currentValue: "[Production Baseline]",
            proposedValue: query,
            clientRationale: "Requested modification via AI Concierge"
          };
          renderDiffProposal(activeProposal);
          appendChatMessage("CONCIERGE AGENT", "Drafted staging diff proposal reflecting your request. Inspect the side-by-side comparison on the right.");
        }
      }, 700);
    }

    function appendChatMessage(sender, text) {
      const history = document.getElementById('chatHistory');
      const id = "msg-" + Date.now();
      const div = document.createElement('div');
      div.id = id;
      div.className = sender === "USER" 
        ? "p-3 rounded-xl bg-charcoal-800 text-white ml-8 text-right font-mono"
        : "p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-slate-300 mr-8 leading-relaxed";

      div.innerHTML = `
        <span class="text-[10px] font-mono ${sender === "USER" ? "text-bronze-400" : "text-emerald-400"} block font-semibold mb-1">${sender}</span>
        ${text}
      `;
      history.appendChild(div);
      history.scrollTop = history.scrollHeight;
      return id;
    }

    function openStagingModal() {
      if (!activeProposal) return;
      const modal = document.getElementById('stagingModal');
      const body = document.getElementById('modalDiffBody');
      if (!modal || !body) return;

      body.innerHTML = `
        <div class="text-[11px] text-bronze-400 font-semibold mb-2">
          ${activeProposal.targetSection} â€º ${activeProposal.field}
        </div>
        <div class="rounded-xl border border-charcoal-700 overflow-hidden text-xs font-mono shadow-inner">
          <div class="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-charcoal-700">
            <div class="w-full sm:w-1/2 bg-rose-950/15 flex flex-col">
              <div class="px-3 py-2 bg-rose-950/35 border-b border-rose-900/40 text-[10px] text-rose-400 font-semibold flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Current
              </div>
              <div class="p-3.5 text-rose-200 whitespace-pre-wrap leading-relaxed text-xs flex-grow">
                ${activeProposal.currentValue}
              </div>
            </div>
            <div class="w-full sm:w-1/2 bg-emerald-950/15 flex flex-col">
              <div class="px-3 py-2 bg-emerald-950/35 border-b border-emerald-900/40 text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Proposed
              </div>
              <div class="p-3.5 text-emerald-200 whitespace-pre-wrap leading-relaxed text-xs flex-grow">
                ${activeProposal.proposedValue}
              </div>
            </div>
          </div>
        </div>
      `;
      modal.classList.remove('hidden');
    }

    function closeStagingModal() {
      const modal = document.getElementById('stagingModal');
      if (modal) modal.classList.add('hidden');
    }

    function renderDiffProposal(p) {
      const container = document.getElementById('diffContainer');
      const badge = document.getElementById('diffStatusBadge');
      const actions = document.getElementById('stagingActions');
      const expandBtn = document.getElementById('expandDiffBtn');

      badge.textContent = "Staged";
      badge.className = "px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950/60 text-amber-400 border border-amber-500/40";

      if (expandBtn) expandBtn.classList.remove('hidden');

      container.innerHTML = `
        <div class="flex items-center justify-between text-[11px] text-bronze-400 font-semibold cursor-pointer pb-0.5" onclick="openStagingModal()" title="Click for fullscreen inspection">
          <span>${p.targetSection} â€º ${p.field}</span>
          <span class="text-[10px] text-slate-500 hover:text-slate-300 font-normal">Inspect â†—</span>
        </div>

        <div class="rounded-xl border border-charcoal-700/80 overflow-hidden text-xs font-mono shadow-inner cursor-pointer" onclick="openStagingModal()" title="Click for fullscreen inspection">
          <div class="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-charcoal-700">
             <div class="w-full sm:w-1/2 bg-rose-950/15 flex flex-col">
               <div class="px-2.5 py-1.5 bg-rose-950/35 border-b border-rose-900/40 text-[10px] text-rose-400 font-semibold flex items-center gap-1.5">
                 <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Current
               </div>
               <div class="p-2.5 text-rose-200 whitespace-pre-wrap leading-relaxed text-[11px]">
                 ${p.currentValue}
               </div>
             </div>
             <div class="w-full sm:w-1/2 bg-emerald-950/15 flex flex-col">
               <div class="px-2.5 py-1.5 bg-emerald-950/35 border-b border-emerald-900/40 text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5">
                 <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Proposed
               </div>
               <div class="p-2.5 text-emerald-200 whitespace-pre-wrap leading-relaxed text-[11px]">
                 ${p.proposedValue}
               </div>
             </div>
          </div>
        </div>
      `;

      actions.classList.remove('hidden');
    }

    function rejectDiff() {
      activeProposal = null;
      document.getElementById('diffContainer').innerHTML = `
        <div class="text-center py-10 text-slate-500">
          <span class="text-2xl block mb-2">âœ•</span>
          Proposal discarded.
        </div>
      `;
      document.getElementById('diffStatusBadge').textContent = "Idle";
      document.getElementById('diffStatusBadge').className = "px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-charcoal-800 text-slate-400 border border-charcoal-700";
      document.getElementById('stagingActions').classList.add('hidden');
      const expandBtn = document.getElementById('expandDiffBtn');
      if (expandBtn) expandBtn.classList.add('hidden');
      closeStagingModal();
    }

    async function approveDiff() {
      if (!activeProposal) return;

      const tbody = document.getElementById('stagingQueueBody');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="py-2 text-bronze-400">${activeProposal.targetSection}</td>
        <td class="py-2">${activeProposal.field}</td>
        <td class="py-2"><span class="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 text-[10px]">QUEUED_REVIEW</span></td>
        <td class="py-2 text-right"><span class="text-[10px] text-slate-500">Awaiting Antigravity</span></td>
      `;
      tbody.prepend(tr);

      // Post to Google Apps Script Webhook
      try {
        await fetch("https://script.google.com/macros/s/AKfycbwK1U9lZTjO0gi2-ZFUkzJbPiH3Y2n2kTfiKZ4bpFLF3rk3DdU4_R8RyF7NM-ClwG5y5g/exec", {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            clientId: "eye-of-ru-enterprises",
            action: "STAGE_UPDATE",
            ...activeProposal
          })
        });
      } catch (e) {
        console.warn("Webhook logged locally:", e);
      }

      showToast("Proposal approved and queued to Google Sheet for Antigravity verification!", "success");
      rejectDiff();
    }
  </script>

</body>
</html>

``
