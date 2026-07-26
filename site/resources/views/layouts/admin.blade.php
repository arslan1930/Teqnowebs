<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Admin') · Teqnowebs</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-slate-50 text-ink">
    <header class="border-b border-line bg-white">
        <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div class="flex flex-wrap items-center gap-4 text-sm font-medium">
                <a href="{{ route('admin.posts.index') }}" class="hover:text-accent">Posts</a>
                <a href="{{ route('admin.team.index') }}" class="hover:text-accent">Team</a>
                <a href="{{ route('admin.inquiries.index') }}" class="hover:text-accent">Inquiries</a>
                <a href="{{ route('staff') }}" class="hover:text-accent">Staff hub</a>
                <a href="{{ route('home') }}" class="hover:text-accent">View site</a>
            </div>
            <form method="post" action="{{ route('logout') }}">@csrf<button class="text-sm text-muted">Sign out</button></form>
        </div>
    </header>
    <main class="mx-auto max-w-5xl px-5 py-8">
        @if (session('success'))
            <p class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{{ session('success') }}</p>
        @endif
        @yield('content')
    </main>
</body>
</html>
