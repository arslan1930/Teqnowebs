@extends('layouts.admin')
@section('title', $post->exists ? 'Edit post' : 'New post')
@section('content')
<h1 class="font-display text-2xl font-semibold">{{ $post->exists ? 'Edit post' : 'New post' }}</h1>
<form method="post" action="{{ $post->exists ? route('admin.posts.update', $post) : route('admin.posts.store') }}" class="mt-6 max-w-2xl space-y-4">
    @csrf
    @if ($post->exists) @method('PUT') @endif
    <label class="block text-sm">Title<input name="title" value="{{ old('title', $post->title) }}" required class="mt-1 w-full rounded-lg border border-line px-3 py-2"></label>
    <label class="block text-sm">Slug<input name="slug" value="{{ old('slug', $post->slug) }}" class="mt-1 w-full rounded-lg border border-line px-3 py-2" placeholder="auto from title"></label>
    <label class="block text-sm">Excerpt<textarea name="excerpt" rows="2" class="mt-1 w-full rounded-lg border border-line px-3 py-2">{{ old('excerpt', $post->excerpt) }}</textarea></label>
    <label class="block text-sm">Body<textarea name="body" rows="12" required class="mt-1 w-full rounded-lg border border-line px-3 py-2">{{ old('body', $post->body) }}</textarea></label>
    <label class="block text-sm">Published at<input type="datetime-local" name="published_at" value="{{ old('published_at', optional($post->published_at)->format('Y-m-d\\TH:i')) }}" class="mt-1 w-full rounded-lg border border-line px-3 py-2"></label>
    @if ($errors->any())
        <ul class="text-sm text-red-600">@foreach($errors->all() as $e)<li>{{ $e }}</li>@endforeach</ul>
    @endif
    <button class="cta-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white">Save</button>
</form>
@endsection
