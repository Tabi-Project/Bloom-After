<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Review &amp; Submit - Bloom After</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#ec5b13",
                        "background-light": "#f8f6f6",
                        "background-dark": "#221610",
                    },
                    fontFamily: {
                        "display": ["Public Sans", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>
        body {
            font-family: 'Public Sans', sans-serif;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
<div class="flex flex-col min-h-screen">
<!-- Header -->
<header class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 lg:px-10 py-4 bg-background-light dark:bg-background-dark sticky top-0 z-10">
<div class="flex items-center gap-3">
<div class="text-primary">
<svg class="size-8" fill="none" viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
</svg>
</div>
<h2 class="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">Bloom After</h2>
</div>
<button class="flex items-center justify-center rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-slate-600 dark:text-slate-400">close</span>
</button>
</header>
<main class="flex flex-1 flex-col lg:flex-row">
<!-- Left Sidebar (Progress & Info) -->
<aside class="w-full lg:w-[380px] border-r border-slate-200 dark:border-slate-800 p-6 lg:p-10 flex flex-col gap-8">
<div class="flex flex-col gap-2">
<h1 class="text-slate-900 dark:text-slate-100 text-2xl font-bold">Almost there</h1>
<p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Step 3 of 4: Review Your Story</p>
</div>
<!-- Navigation Steps -->
<nav class="flex flex-col gap-1">
<div class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400">
<span class="material-symbols-outlined">check_circle</span>
<p class="text-sm font-medium">Step 1: Narrative</p>
</div>
<div class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400">
<span class="material-symbols-outlined">check_circle</span>
<p class="text-sm font-medium">Step 2: Details</p>
</div>
<div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary">
<span class="material-symbols-outlined">pending</span>
<p class="text-sm font-bold">Step 3: Review Your Story</p>
</div>
<div class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400">
<span class="material-symbols-outlined">radio_button_unchecked</span>
<p class="text-sm font-medium">Step 4: Done</p>
</div>
</nav>
<div class="mt-auto flex flex-col gap-4">
<!-- Tip Card 1 -->
<div class="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
<div class="flex items-start gap-4">
<div class="p-2 bg-primary/10 rounded-lg text-primary">
<span class="material-symbols-outlined text-[20px]">verified_user</span>
</div>
<div class="flex flex-col gap-1">
<p class="text-slate-900 dark:text-slate-100 text-sm font-bold">Moderation Timeline</p>
<p class="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Our moderators will review your story for clarity and safety within 48 hours.</p>
</div>
</div>
</div>
<!-- Tip Card 2 -->
<div class="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
<div class="flex items-start gap-4">
<div class="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</div>
<div class="flex flex-col gap-1">
<p class="text-slate-900 dark:text-slate-100 text-sm font-bold">Final Check</p>
<p class="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Make sure you're comfortable with your privacy settings.</p>
</div>
</div>
</div>
</div>
</aside>
<!-- Main Content Area -->
<section class="flex-1 p-6 lg:p-12 overflow-y-auto">
<div class="max-w-2xl mx-auto flex flex-col gap-8">
<header>
<h2 class="text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Review Your Story</h2>
<p class="mt-2 text-slate-500 dark:text-slate-400">This is how your story will appear to others in the library.</p>
</header>
<!-- Story Preview Card -->
<div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
<div class="h-48 bg-cover bg-center" data-alt="Abstract colorful floral patterns representing blooming and growth" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAezGzD6ArHdxrAtth3_OjuEdLZrZWtOsm_AtewyetCFFLZ3_bwosSX0OVK5NMcmOlArInb97Kq6fbscw09th4_pZ5VQztytPe7Y3qjOm5uMdByHq7PhwxzqClZ8_N5_S8ZqhWnoXzTPJ07gS2kTUaEbT1dEmT5379fglhPxBJLm7BFvlfBXpXbm2fLxnhwrZT1dOuvGhQLgUgWDbCn_c4ASpRbMvB2l-8Sub65gmnw2bNrbuG8NYWS0fOm_GlEEPOZP7tnMEb80W60');"></div>
<div class="p-8">
<div class="flex items-center gap-2 mb-4">
<span class="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">Anxiety</span>
<span class="text-slate-400 text-xs">• 3 min read</span>
</div>
<h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Finding calm after the storm</h3>
<div class="prose prose-slate dark:prose-invert">
<p class="text-slate-600 dark:text-slate-300 leading-relaxed italic mb-6">
                                    "For years, I felt like I was holding my breath. It started small, a flutter in my chest before meetings, then grew into a constant hum of dread. But through daily journaling and mindfulness, I've learned that the storm eventually passes. I wanted to share this to let others know that blooming takes time, and that's okay."
                                </p>
</div>
<div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
<h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight mb-3">What Helped</h4>
<ul class="flex flex-wrap gap-2">
<li class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm rounded-lg">Morning Meditation</li>
<li class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm rounded-lg">Nature Walks</li>
<li class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm rounded-lg">Art Therapy</li>
</ul>
</div>
<div class="mt-8 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
<span class="material-symbols-outlined">person</span>
</div>
<div class="flex flex-col">
<span class="text-slate-900 dark:text-slate-100 font-bold text-sm">Anonymous Storyteller</span>
<span class="text-slate-400 text-xs">Shared Oct 24, 2023</span>
</div>
</div>
</div>
</div>
</div>
<!-- Privacy & Consent Summary -->
<div class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
<h4 class="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Privacy &amp; Consent Summary</h4>
<div class="space-y-4">
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
<span class="text-sm text-slate-600 dark:text-slate-400">Identity Preference</span>
</div>
<span class="text-sm font-semibold text-slate-900 dark:text-slate-100">Anonymous</span>
</div>
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-slate-400 text-[20px]">fact_check</span>
<span class="text-sm text-slate-600 dark:text-slate-400">Moderation Agreement</span>
</div>
<span class="text-sm font-semibold text-slate-900 dark:text-slate-100">Accepted</span>
</div>
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-slate-400 text-[20px]">public</span>
<span class="text-sm text-slate-600 dark:text-slate-400">Visibility</span>
</div>
<span class="text-sm font-semibold text-slate-900 dark:text-slate-100">Community Library</span>
</div>
</div>
</div>
<!-- Actions -->
<div class="flex flex-col sm:flex-row items-center gap-4 mt-4">
<button class="w-full sm:w-auto px-8 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Back
                        </button>
<button class="w-full sm:flex-1 px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-2">
<span>Submit for Moderation</span>
<span class="material-symbols-outlined text-[18px]">send</span>
</button>
</div>
<p class="text-center text-xs text-slate-400 pb-10">
                        By clicking submit, you agree to our Terms of Service and Community Guidelines.
                    </p>
</div>
</section>
</main>
</div>
</body></html>