<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Bloom - Share Your Journey</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#4f8a6f",
                        "accent": "#002626",
                        "background-light": "#fff8f0",
                        "background-dark": "#002626",
                    },
                    fontFamily: {
                        "display": ["Public Sans"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
</head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
<div class="relative flex min-h-screen w-full flex-col overflow-x-hidden">
<!-- Top Navigation Bar -->
<header class="flex items-center justify-between border-b border-primary/10 px-10 py-4 bg-white dark:bg-slate-900">
<div class="flex items-center gap-4 text-primary">
<div class="size-8">
<svg class="w-full h-full" fill="none" viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<path clip-rule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fill-rule="evenodd"></path>
</svg>
</div>
<h2 class="text-accent dark:text-white text-xl font-bold leading-tight tracking-tight">Bloom</h2>
</div>
<div class="flex flex-1 justify-end gap-8 items-center">
<nav class="flex items-center gap-9">
<a class="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#">Stories</a>
<a class="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#">Resources</a>
<a class="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" href="#">Community</a>
</nav>
<button class="flex min-w-[100px] cursor-pointer items-center justify-center rounded-xl h-10 px-5 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90">
<span>Profile</span>
</button>
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20" data-alt="User profile circular portrait image" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBWsPAiOjsn6mMJkRNTYSl4D5mVPiraOlaCVLTId5hqvkaeh1kcmU2FXmaWv7xeXrEcNmFy93VlxoxJc6-goEU8BwBaJPOzNCwhDH2DG5auZRUNWC3pT4WhAWXtouXZTvAW_u5ez9b5bC3-a4VtNJTMP37z6nxCjaQTrc_mC74B7lYVOdKvGb3L1fP8BCx0m2pJfggMEjaKcwTOnFBPt0rJLSVVTmW8uIaKshgJXLzHh90d9PV-kp2HYpjNj6Sldf3p1ioUUpelFIuV");'></div>
</div>
</header>
<main class="max-w-[1200px] mx-auto w-full px-6 py-8">
<!-- Breadcrumb & Progress -->
<div class="mb-10">
<div class="flex flex-wrap gap-2 mb-6">
<a class="text-primary text-sm font-medium" href="#">Home</a>
<span class="text-primary/40 text-sm font-medium">/</span>
<span class="text-accent dark:text-white text-sm font-medium">Submit Story</span>
</div>
<div class="max-w-2xl">
<div class="flex justify-between items-end mb-2">
<h1 class="text-accent dark:text-white text-3xl font-bold">Share Your Journey</h1>
<span class="text-primary text-sm font-bold">Step 2 of 4</span>
</div>
<div class="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
<div class="h-full bg-primary" style="width: 50%;"></div>
</div>
<p class="mt-2 text-primary font-medium text-sm">Narrative &amp; Timeline</p>
</div>
</div>
<div class="flex flex-col lg:flex-row gap-12">
<!-- Left Side: Context & Support -->
<aside class="lg:w-1/3 space-y-8">
<div class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-primary/5">
<div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
<span class="material-symbols-outlined text-4xl">volunteer_activism</span>
</div>
<h3 class="text-accent dark:text-white text-xl font-bold mb-3">Why Sharing Matters</h3>
<p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        Your story provides hope and practical guidance to others walking a similar path. By sharing your experience, you contribute to a growing map of recovery and resilience.
                    </p>
<div class="space-y-4">
<div class="flex gap-4 p-4 rounded-xl bg-background-light dark:bg-slate-700/50">
<span class="material-symbols-outlined text-primary">lightbulb</span>
<div>
<h4 class="text-sm font-bold text-accent dark:text-white">Tip: Be Honest</h4>
<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Focus on the small wins that made a difference.</p>
</div>
</div>
<div class="flex gap-4 p-4 rounded-xl bg-background-light dark:bg-slate-700/50">
<span class="material-symbols-outlined text-primary">lock</span>
<div>
<h4 class="text-sm font-bold text-accent dark:text-white">Safe Space</h4>
<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">You control your privacy. Choose to stay anonymous anytime.</p>
</div>
</div>
</div>
</div>
<div class="relative rounded-2xl overflow-hidden h-48 group">
<div class="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors z-10"></div>
<img alt="" class="w-full h-full object-cover" data-alt="Beautiful blooming flower field background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjpUM_XuUssUS5_iSX97aIpD3Ati5zcrASLLiFzlOkNTDt0qsH_M0YmyYCFlVIomco2fdffoE1eBScrcxWu1Rl0bEMMtbmGkzK-4MTCqpTBLhIcVqj4jE3Pcy5gn11t8OUVaxY7Sn9x9Zh-cuwINUXbepthvhPotfiU0d5qJY2AAf4xJxGwB-xUgwo4G4J_jEfD5n2WnIaCklWdAu0YYwOo27Xr7jTqKG5vH1_JRP6Jegk07bg1UscYjrdq2HTOSJ-Hh9C-uIP5BQ2"/>
<div class="absolute bottom-4 left-4 z-20">
<p class="text-white font-bold text-lg">Every bloom takes time.</p>
</div>
</div>
</aside>
<!-- Right Side: Form Fields -->
<section class="lg:w-2/3">
<form class="space-y-8">
<!-- Narrative -->
<div class="space-y-4">
<label class="block">
<span class="text-accent dark:text-white font-bold text-lg">Tell your story</span>
<span class="block text-slate-500 dark:text-slate-400 text-sm mb-3">What happened? How did you feel at the start?</span>
<textarea class="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-primary dark:text-white" placeholder="Begin typing here..." rows="6"></textarea>
</label>
</div>
<!-- Timeline -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div class="space-y-2">
<label class="block text-accent dark:text-white font-bold">Start Date</label>
<input class="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-primary dark:text-white" type="date"/>
</div>
<div class="space-y-2">
<label class="block text-accent dark:text-white font-bold">Key Turning Point</label>
<input class="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-primary dark:text-white" placeholder="e.g., Finding the right therapist" type="text"/>
</div>
</div>
<!-- What Helped -->
<div class="space-y-4">
<label class="block text-accent dark:text-white font-bold text-lg">What helped you the most?</label>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
<button class="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-primary bg-primary/5 text-primary font-medium" type="button">
<span class="material-symbols-outlined text-sm">check_circle</span> Therapy
                            </button>
<button class="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:border-primary/50" type="button">
                                Community
                            </button>
<button class="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:border-primary/50" type="button">
                                Mindfulness
                            </button>
<button class="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:border-primary/50" type="button">
                                Exercise
                            </button>
<button class="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:border-primary/50" type="button">
                                Nature
                            </button>
<button class="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 font-medium" type="button">
<span class="material-symbols-outlined text-sm">add</span> Other
                            </button>
</div>
</div>
<!-- Location -->
<div class="space-y-2">
<label class="block text-accent dark:text-white font-bold text-lg">Location</label>
<div class="relative">
<span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">location_on</span>
<input class="pl-12 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-primary dark:text-white" data-location="San Francisco" placeholder="City, Country" type="text"/>
</div>
</div>
<!-- Privacy & Settings Section -->
<div class="pt-8 border-t border-slate-100 dark:border-slate-800">
<div class="bg-primary/5 dark:bg-slate-800/50 p-6 rounded-2xl space-y-6">
<div class="flex items-center justify-between">
<div>
<h4 class="text-accent dark:text-white font-bold">Privacy Settings</h4>
<p class="text-sm text-slate-500 dark:text-slate-400">Choose how your name appears</p>
</div>
<div class="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
<button class="px-4 py-1.5 rounded-md text-sm font-bold bg-primary text-white" type="button">Named</button>
<button class="px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800" type="button">Anonymous</button>
</div>
</div>
<label class="flex items-start gap-3 cursor-pointer">
<input class="mt-1 rounded text-primary focus:ring-primary" type="checkbox"/>
<span class="text-sm text-slate-600 dark:text-slate-400 leading-tight">
                                    I consent to my story being moderated by the Bloom team before being published. I understand that I can withdraw my consent and remove my story at any time.
                                </span>
</label>
</div>
</div>
<!-- Navigation Buttons -->
<div class="flex items-center justify-between pt-6">
<button class="px-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" type="button">Back</button>
<button class="px-10 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90" type="submit">Continue to Review</button>
</div>
</form>
</section>
</div>
</main>
<!-- Footer Space -->
<footer class="mt-auto py-12 px-10 border-t border-slate-100 dark:border-slate-800 flex justify-center">
<div class="flex items-center gap-2 opacity-40">
<div class="size-5">
<svg class="w-full h-full" fill="none" viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<path clip-rule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fill-rule="evenodd"></path>
</svg>
</div>
<p class="text-accent dark:text-white font-bold">Bloom © 2024</p>
</div>
</footer>
</div>
</body></html>