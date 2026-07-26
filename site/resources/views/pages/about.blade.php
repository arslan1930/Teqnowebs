@extends('layouts.site')
@section('title', 'About · Teqnowebs')
@section('meta_description', 'About Teqnowebs — the agency for web, design, SEO, and business software.')

@section('content')
<div class="pt-24">
    <section class="atmosphere relative overflow-hidden border-b border-line py-20 sm:py-28">
        <div class="pointer-events-none absolute inset-0 grid-overlay"></div>
        <div class="relative mx-auto max-w-6xl px-5 sm:px-8">
            <p class="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">About Teqnowebs</p>
            <h1 class="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">We build the face of your business — and the systems behind it.</h1>
            <p class="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
                Teqnowebs is a digital agency for teams that need more than a pretty homepage. We design and develop websites, craft brand visuals, grow organic reach with SEO and link building, and ship custom software for sales, invoicing, warehouse, and order tracking.
            </p>
        </div>
    </section>

    <section class="py-16 sm:py-24">
        <div class="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-3">
            @foreach ([
                ['Brand-first delivery','Your name and story lead every project. Templates are a starting point — never the finish line.'],
                ['Practical tech','We choose stacks your team can live with: maintainable sites, clear software, measurable SEO.'],
                ['One partner','Fewer handoffs. Web, design, growth, and ops software stay aligned under one plan.'],
            ] as $p)
                <div>
                    <h2 class="font-display text-xl font-semibold">{{ $p[0] }}</h2>
                    <p class="mt-3 text-sm leading-relaxed text-muted">{{ $p[1] }}</p>
                </div>
            @endforeach
        </div>
    </section>

    <section class="border-t border-line py-16 sm:py-24">
        <div class="mx-auto max-w-6xl px-5 sm:px-8">
            <p class="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">Our team</p>
            <h2 class="font-display mt-3 text-3xl font-semibold">People behind the work</h2>
            @forelse ($groups as $key => $members)
                <div class="mt-12">
                    <h3 class="font-display text-lg font-semibold text-ink-soft">{{ $members->first()->group_label }}</h3>
                    <ul class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        @foreach ($members as $member)
                            <li class="card-soft rounded-2xl p-5">
                                <div class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-accent-deep">
                                    @if ($member->photo)
                                        <img src="{{ asset(ltrim($member->photo, '/')) }}" alt="{{ $member->name }}" class="h-full w-full object-cover">
                                    @else
                                        {{ $member->initials() }}
                                    @endif
                                </div>
                                <p class="mt-4 font-semibold">{{ $member->name }}</p>
                                <p class="mt-1 text-sm text-muted">{{ $member->role }}</p>
                            </li>
                        @endforeach
                    </ul>
                </div>
            @empty
                <p class="mt-6 text-muted">Team roster coming soon.</p>
            @endforelse
        </div>
    </section>

    <section class="band-soft border-t border-line py-16 sm:py-20">
        <div class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 sm:px-8 md:flex-row md:items-center">
            <div>
                <h2 class="font-display text-2xl font-semibold sm:text-3xl">Let's talk about your next build.</h2>
                <p class="mt-2 text-muted">No long decks — just a clear next step.</p>
            </div>
            <a href="{{ route('contact') }}" class="cta-gradient rounded-md px-6 py-3.5 text-sm font-semibold text-white">Contact Teqnowebs</a>
        </div>
    </section>
</div>
@endsection
