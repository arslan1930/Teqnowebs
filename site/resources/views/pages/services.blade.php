@extends('layouts.site')
@section('title', 'Services · Teqnowebs')
@section('meta_description', 'Website development, UI/UX design, graphic design, SEO, and link building from Teqnowebs.')

@section('content')
<div class="pt-24">
    <section class="atmosphere relative overflow-hidden border-b border-line py-20 sm:py-28">
        <div class="pointer-events-none absolute inset-0 grid-overlay"></div>
        <div class="relative mx-auto max-w-6xl px-5 sm:px-8">
            <p class="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">Services</p>
            <h1 class="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Websites, UI/UX, design, and SEO — built to grow together.</h1>
            <p class="mt-5 max-w-2xl text-lg text-muted">
                Full website delivery, interface design, brand creatives, and search growth under one roof.
                Pair them with our <a href="{{ route('software') }}" class="font-semibold text-accent-deep hover:underline">custom software</a> when operations need more than a website.
            </p>
        </div>
    </section>

    @foreach ([
        ['web','01','Website development','Sites that represent your brand, load fast, and turn visitors into customers.',['Business websites and company sites','Marketing and conversion landing pages','E-commerce stores and product catalogs','CMS setup and content workflows','Responsive builds for mobile and desktop','Performance, accessibility, and security basics','Hosting handoff and ongoing maintenance','Integrations for forms, CRM, and analytics'], false],
        ['uiux','02','UI / UX design','Interfaces people understand quickly — researched, wired, and built to convert.',['User research and journey mapping','Information architecture and flows','Wireframes for key screens','Interactive prototypes for stakeholder review','UI kits and design systems','Usability reviews and iteration','Conversion-focused UX for marketing sites','Product UX for custom software dashboards'], true],
        ['design','03','Graphic design','Visual systems that feel owned — logos, brand kits, and campaign creatives.',['Logo and brand identity','Brand guidelines and visual kits','Social and campaign creatives','Presentation and pitch decks','Print and collateral design','Ad creatives for paid campaigns'], false],
        ['seo','04','SEO & link building','Technical foundations, content that ranks, and links that build authority.',['Technical SEO audits and fixes','On-page SEO and content structure','Keyword research and content strategy','Local SEO for service businesses','Ethical link building and outreach','Competitor and SERP analysis','Site migrations and SEO hygiene','Rankings, traffic, and reporting dashboards'], true],
    ] as $s)
        <section id="{{ $s[0] }}" class="{{ $s[5] ? 'bg-mist/30' : 'bg-paper' }} border-b border-line py-16 sm:py-20">
            <div class="mx-auto max-w-6xl px-5 sm:px-8">
                <p class="text-xs font-semibold text-accent">{{ $s[1] }}</p>
                <h2 class="font-display mt-2 text-3xl font-semibold">{{ $s[2] }}</h2>
                <p class="mt-3 max-w-2xl text-muted">{{ $s[3] }}</p>
                <ul class="mt-8 grid gap-2 sm:grid-cols-2">
                    @foreach ($s[4] as $item)
                        <li class="rounded-lg border border-line bg-white px-4 py-3 text-sm">{{ $item }}</li>
                    @endforeach
                </ul>
            </div>
        </section>
    @endforeach
</div>
@endsection
