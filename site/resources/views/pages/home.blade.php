@extends('layouts.site')

@section('content')
<section class="atmosphere relative min-h-[100svh] overflow-hidden">
    <div class="pointer-events-none absolute inset-0 grid-overlay"></div>
    <div class="relative mx-auto grid min-h-[100svh] max-w-6xl items-end gap-10 px-5 pb-12 pt-28 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20 lg:pt-24">
        <div class="z-10">
            <p class="font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl md:text-7xl">Teqnowebs</p>
            <div class="mt-5 h-1 w-24 bg-[var(--accent)]"></div>
            <h1 class="font-display mt-8 max-w-xl text-3xl font-semibold leading-[1.15] tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
                Web, design, growth, and software that run your business.
            </h1>
            <p class="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
                From websites, UI/UX, and SEO to sales, finance, and order tracking — Teqnowebs builds what customers see and what your team uses every day.
            </p>
            <div class="mt-8 flex flex-wrap items-center gap-3">
                <a href="{{ route('contact') }}" class="cta-gradient rounded-md px-6 py-3.5 text-sm font-semibold text-white">Book a call</a>
                <a href="{{ route('services') }}" class="rounded-md border border-ink/20 bg-white/50 px-6 py-3.5 text-sm font-semibold text-ink backdrop-blur transition hover:border-[var(--accent)] hover:text-accent-deep">Explore services</a>
            </div>
        </div>
        <div class="relative -mx-5 min-h-[280px] overflow-hidden sm:mx-0 sm:min-h-[360px] lg:min-h-[480px]">
            <div class="absolute inset-0" style="background:linear-gradient(150deg,#eef2f8 0%,#f6f9fc 50%,#e9eef6 100%)"></div>
            <div class="absolute inset-0 opacity-70" style="background:radial-gradient(ellipse 60% 50% at 70% 40%,rgba(37,99,235,.18),transparent 70%),radial-gradient(ellipse 40% 35% at 25% 70%,rgba(100,116,139,.12),transparent 65%)"></div>
        </div>
    </div>
</section>

<section class="border-t border-line py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-5 sm:px-8">
        <p class="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">What we build</p>
        <h2 class="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-tight">Five pillars. One partner.</h2>
        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @foreach ([
                ['01','Website development','Business sites, stores, and landing pages that load fast and convert.', route('services').'#web'],
                ['02','UI / UX design','Research, wireframes, and interfaces built for clarity and conversion.', route('services').'#uiux'],
                ['03','SEO & link building','Technical SEO, content, and authority so the right people find you.', route('services').'#seo'],
                ['04','Graphic design','Brand identity and creatives that look intentional — not templated.', route('services').'#design'],
                ['05','Custom software','Sales manager, finance, invoicing, warehouse, and order tracking.', route('software')],
            ] as $p)
                <a href="{{ $p[3] }}" class="card-soft rounded-2xl p-6 transition hover:shadow-md">
                    <p class="text-xs font-semibold text-accent">{{ $p[0] }}</p>
                    <h3 class="font-display mt-2 text-lg font-semibold">{{ $p[1] }}</h3>
                    <p class="mt-2 text-sm leading-relaxed text-muted">{{ $p[2] }}</p>
                </a>
            @endforeach
        </div>
    </div>
</section>

<section class="band-soft border-y border-line py-16 sm:py-20">
    <div class="mx-auto max-w-6xl px-5 sm:px-8">
        <p class="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">Software</p>
        <h2 class="font-display mt-3 text-3xl font-semibold tracking-tight">Systems your team uses every day</h2>
        <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            @foreach ([
                ['Sales manager','CRM pipeline, leads, follow-ups, and team targets.'],
                ['Finance','Expenses, cashflow, and reports finance can trust.'],
                ['Invoicing','Clean invoices, payments, and records.'],
                ['Warehouse','Stock, collection, and inventory clarity.'],
                ['Order tracking','Status from order to delivery — visible.'],
            ] as $s)
                <div class="rounded-xl border border-line bg-white px-5 py-4">
                    <h3 class="font-display font-semibold">{{ $s[0] }}</h3>
                    <p class="mt-1 text-sm text-muted">{{ $s[1] }}</p>
                </div>
            @endforeach
        </div>
        <a href="{{ route('software') }}" class="mt-8 inline-flex text-sm font-semibold text-accent-deep hover:underline">See software modules →</a>
    </div>
</section>

<section class="py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 class="font-display text-3xl font-semibold tracking-tight">How we work</h2>
        <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            @foreach ([
                ['01','Discover','Goals, audience, and the systems you already run.'],
                ['02','Design','Brand, UX, and architecture before a line of waste.'],
                ['03','Build','Ship the site, creatives, or software your team needs.'],
                ['04','Grow','SEO, links, and iteration so results compound.'],
            ] as $step)
                <div>
                    <p class="text-xs font-semibold text-accent">{{ $step[0] }}</p>
                    <h3 class="font-display mt-2 text-lg font-semibold">{{ $step[1] }}</h3>
                    <p class="mt-2 text-sm text-muted">{{ $step[2] }}</p>
                </div>
            @endforeach
        </div>
    </div>
</section>
@endsection
