@extends('layouts.site')
@section('title', 'Staff tools · Teqnowebs')

@section('content')
<div class="pt-24">
    <section class="atmosphere border-b border-line py-16 sm:py-20">
        <div class="mx-auto max-w-6xl px-5 sm:px-8">
            <p class="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">Staff hub</p>
            <h1 class="font-display mt-3 text-4xl font-semibold tracking-tight">Internal tools</h1>
            <p class="mt-3 max-w-2xl text-muted">Signed in as {{ auth()->user()->name }}. These apps run on their own subdomains — this page is the launch pad.</p>
            <div class="mt-6 flex flex-wrap gap-3 text-sm">
                @if (auth()->user()->is_admin)
                    <a href="{{ route('admin.posts.index') }}" class="rounded-lg border border-line bg-white px-4 py-2 font-medium hover:border-[var(--accent)]">Site admin</a>
                @endif
                <a href="{{ route('profile.edit') }}" class="rounded-lg border border-line bg-white px-4 py-2 font-medium">Profile</a>
                <form method="post" action="{{ route('logout') }}">
                    @csrf
                    <button class="rounded-lg border border-line bg-white px-4 py-2 font-medium">Sign out</button>
                </form>
            </div>
        </div>
    </section>
    <section class="py-12 sm:py-16">
        <div class="mx-auto grid max-w-6xl gap-4 px-5 sm:px-8 md:grid-cols-2">
            @foreach ($tools as $tool)
                <a href="{{ $tool['url'] }}" target="_blank" rel="noopener" class="card-soft rounded-2xl p-6 transition hover:shadow-md">
                    <h2 class="font-display text-xl font-semibold">{{ $tool['name'] }}</h2>
                    <p class="mt-2 text-sm text-muted">{{ $tool['blurb'] }}</p>
                    <p class="mt-3 text-xs text-ink-soft">{{ $tool['note'] }}</p>
                    <p class="mt-4 text-sm font-semibold text-accent-deep">Open →</p>
                </a>
            @endforeach
        </div>
    </section>
</div>
@endsection
