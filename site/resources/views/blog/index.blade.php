@extends('layouts.site')
@section('title', 'Blog · Teqnowebs')
@section('meta_description', 'Notes from Teqnowebs on web, design, SEO, and the systems that keep businesses moving.')

@section('content')
<div class="pt-24">
    <section class="atmosphere relative overflow-hidden border-b border-line py-20 sm:py-28">
        <div class="pointer-events-none absolute inset-0 grid-overlay"></div>
        <div class="relative mx-auto max-w-6xl px-5 sm:px-8">
            <p class="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">Teqnowebs Blog</p>
            <h1 class="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Notes on web, design, SEO, and software.</h1>
            <p class="mt-5 max-w-2xl text-lg text-muted">Articles from the Teqnowebs team — edit in the admin panel; no static rebuild required.</p>
        </div>
    </section>
    <section class="py-16">
        <div class="mx-auto max-w-6xl px-5 sm:px-8">
            <ul class="grid gap-4 md:grid-cols-2">
                @forelse ($posts as $post)
                    <li>
                        <a href="{{ route('blog.show', $post) }}" class="card-soft block rounded-2xl p-6 transition hover:shadow-md">
                            <p class="text-xs text-muted">{{ optional($post->published_at)->format('M j, Y') }}</p>
                            <h2 class="font-display mt-2 text-xl font-semibold">{{ $post->title }}</h2>
                            <p class="mt-2 text-sm text-muted">{{ $post->excerpt }}</p>
                        </a>
                    </li>
                @empty
                    <li class="text-muted">No posts published yet.</li>
                @endforelse
            </ul>
            <div class="mt-10">{{ $posts->links() }}</div>
        </div>
    </section>
</div>
@endsection
