@extends('layouts.admin')
@section('title', 'Posts')
@section('content')
<div class="flex items-center justify-between gap-3">
    <h1 class="font-display text-2xl font-semibold">Blog posts</h1>
    <a href="{{ route('admin.posts.create') }}" class="cta-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white">New post</a>
</div>
<ul class="mt-6 divide-y divide-slate-200 rounded-xl border border-line bg-white">
    @foreach ($posts as $post)
        <li class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
                <p class="font-semibold">{{ $post->title }}</p>
                <p class="text-xs text-muted">{{ $post->slug }} · {{ optional($post->published_at)->format('Y-m-d') ?: 'draft' }}</p>
            </div>
            <div class="flex gap-2">
                <a href="{{ route('admin.posts.edit', $post) }}" class="rounded border border-line px-3 py-1">Edit</a>
                <form method="post" action="{{ route('admin.posts.destroy', $post) }}" onsubmit="return confirm('Delete post?')">
                    @csrf @method('DELETE')
                    <button class="rounded border border-red-200 px-3 py-1 text-red-700">Delete</button>
                </form>
            </div>
        </li>
    @endforeach
</ul>
<div class="mt-6">{{ $posts->links() }}</div>
@endsection
