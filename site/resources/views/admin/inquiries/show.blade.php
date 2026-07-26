@extends('layouts.admin')
@section('title', 'Inquiry')
@section('content')
<a href="{{ route('admin.inquiries.index') }}" class="text-sm text-accent">← Back</a>
<article class="mt-4 rounded-xl border border-line bg-white p-6">
    <h1 class="font-display text-2xl font-semibold">{{ $inquiry->name }}</h1>
    <p class="mt-2 text-sm text-muted">{{ $inquiry->email }} · {{ $inquiry->phone }} · {{ $inquiry->company }}</p>
    <p class="mt-2 text-sm">Interest: {{ $inquiry->interest }}</p>
    <p class="mt-6 whitespace-pre-wrap text-sm leading-relaxed">{{ $inquiry->message }}</p>
    <form class="mt-8" method="post" action="{{ route('admin.inquiries.destroy', $inquiry) }}" onsubmit="return confirm('Delete?')">
        @csrf @method('DELETE')
        <button class="rounded border border-red-200 px-3 py-2 text-sm text-red-700">Delete</button>
    </form>
</article>
@endsection
