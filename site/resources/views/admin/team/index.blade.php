@extends('layouts.admin')
@section('title', 'Team')
@section('content')
<div class="flex items-center justify-between">
    <h1 class="font-display text-2xl font-semibold">Team</h1>
    <a href="{{ route('admin.team.create') }}" class="cta-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white">Add member</a>
</div>
<ul class="mt-6 divide-y divide-slate-200 rounded-xl border border-line bg-white">
    @foreach ($members as $member)
        <li class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
                <p class="font-semibold">{{ $member->name }} · {{ $member->role }}</p>
                <p class="text-xs text-muted">{{ $member->group_label }}</p>
            </div>
            <div class="flex gap-2">
                <a href="{{ route('admin.team.edit', $member) }}" class="rounded border border-line px-3 py-1">Edit</a>
                <form method="post" action="{{ route('admin.team.destroy', $member) }}" onsubmit="return confirm('Remove?')">
                    @csrf @method('DELETE')
                    <button class="rounded border border-red-200 px-3 py-1 text-red-700">Delete</button>
                </form>
            </div>
        </li>
    @endforeach
</ul>
<div class="mt-6">{{ $members->links() }}</div>
@endsection
