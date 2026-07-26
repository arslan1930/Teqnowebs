@extends('layouts.site')
@section('title', $post->title.' · Teqnowebs')
@section('meta_description', $post->excerpt ?: $post->title)

@section('content')
<article class="pt-24">
    <header class="atmosphere border-b border-line py-16 sm:py-24">
        <div class="mx-auto max-w-3xl px-5 sm:px-8">
            <p class="text-xs text-muted">{{ optional($post->published_at)->format('F j, Y') }}</p>
            <h1 class="font-display mt-3 text-4xl font-semibold tracking-tight">{{ $post->title }}</h1>
            @if ($post->excerpt)
                <p class="mt-4 text-lg text-muted">{{ $post->excerpt }}</p>
            @endif
        </div>
    </header>
    <div class="prose prose-slate mx-auto max-w-3xl px-5 py-12 sm:px-8">
        {!! nl2br(e($post->body)) !!}
    </div>
    <div class="mx-auto max-w-3xl border-t border-line px-5 py-10 sm:px-8">
        <p class="text-muted">Talk to Teqnowebs about web, SEO, or software.</p>
        <a href="{{ route('contact') }}" class="cta-gradient mt-4 inline-flex rounded-md px-5 py-3 text-sm font-semibold text-white">Contact Teqnowebs</a>
    </div>
</article>
@endsection
