@extends('layouts.admin')
@section('title', 'Inquiries')
@section('content')
<h1 class="font-display text-2xl font-semibold">Contact inquiries</h1>
<ul class="mt-6 divide-y divide-slate-200 rounded-xl border border-line bg-white">
    @forelse ($inquiries as $inquiry)
        <li class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
                <p class="font-semibold">{{ $inquiry->name }} · {{ $inquiry->email }}</p>
                <p class="text-xs text-muted">{{ $inquiry->created_at->format('Y-m-d H:i') }} · {{ $inquiry->interest }}</p>
            </div>
            <a href="{{ route('admin.inquiries.show', $inquiry) }}" class="rounded border border-line px-3 py-1">View</a>
        </li>
    @empty
        <li class="px-4 py-6 text-muted">No inquiries yet.</li>
    @endforelse
</ul>
<div class="mt-6">{{ $inquiries->links() }}</div>
@endsection
