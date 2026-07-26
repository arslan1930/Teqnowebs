@extends('layouts.admin')
@section('title', $member->exists ? 'Edit member' : 'Add member')
@section('content')
<h1 class="font-display text-2xl font-semibold">{{ $member->exists ? 'Edit member' : 'Add member' }}</h1>
<form method="post" action="{{ $member->exists ? route('admin.team.update', $member) : route('admin.team.store') }}" class="mt-6 max-w-xl space-y-4">
    @csrf
    @if ($member->exists) @method('PUT') @endif
    <label class="block text-sm">Name<input name="name" value="{{ old('name', $member->name) }}" required class="mt-1 w-full rounded-lg border border-line px-3 py-2"></label>
    <label class="block text-sm">Role<input name="role" value="{{ old('role', $member->role) }}" required class="mt-1 w-full rounded-lg border border-line px-3 py-2"></label>
    <label class="block text-sm">Group key<input name="group_key" value="{{ old('group_key', $member->group_key ?: 'leadership-tech') }}" required class="mt-1 w-full rounded-lg border border-line px-3 py-2"></label>
    <label class="block text-sm">Group label<input name="group_label" value="{{ old('group_label', $member->group_label ?: 'Leadership & Tech') }}" required class="mt-1 w-full rounded-lg border border-line px-3 py-2"></label>
    <label class="block text-sm">Photo path<input name="photo" value="{{ old('photo', $member->photo) }}" placeholder="team/name.jpg" class="mt-1 w-full rounded-lg border border-line px-3 py-2"></label>
    <label class="block text-sm">Sort order<input type="number" name="sort_order" value="{{ old('sort_order', $member->sort_order ?: 0) }}" class="mt-1 w-full rounded-lg border border-line px-3 py-2"></label>
    <button class="cta-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white">Save</button>
</form>
@endsection
