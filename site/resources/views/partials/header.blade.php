@php
    $nav = [
        ['href' => route('services'), 'label' => 'Services'],
        ['href' => route('software'), 'label' => 'Software'],
        ['href' => route('blog.index'), 'label' => 'Blog'],
        ['href' => route('about'), 'label' => 'About'],
        ['href' => route('contact'), 'label' => 'Contact'],
    ];
@endphp
<header class="absolute inset-x-0 top-0 z-50">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="{{ route('home') }}" class="font-display text-xl font-semibold tracking-tight text-ink" aria-label="Teqnowebs home">
            <span class="inline-flex items-center gap-2">
                <img src="{{ asset('logo.svg') }}" alt="" class="h-8 w-8" width="32" height="32">
                Teqnowebs
            </span>
        </a>
        <nav class="hidden items-center gap-8 md:flex" aria-label="Primary">
            @foreach ($nav as $item)
                <a href="{{ $item['href'] }}" class="text-sm font-medium text-ink-soft transition-colors hover:text-accent">{{ $item['label'] }}</a>
            @endforeach
            <a href="{{ route('contact') }}" class="cta-gradient rounded-md px-4 py-2.5 text-sm font-semibold text-white transition">Get a quote</a>
        </nav>
        <details class="relative md:hidden">
            <summary class="flex h-10 w-10 list-none items-center justify-center" aria-label="Menu">
                <span class="flex w-5 flex-col gap-1.5">
                    <span class="h-0.5 w-full bg-ink"></span>
                    <span class="h-0.5 w-full bg-ink"></span>
                    <span class="h-0.5 w-full bg-ink"></span>
                </span>
            </summary>
            <nav class="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-white p-3 shadow-lg" aria-label="Mobile">
                <ul class="space-y-1">
                    @foreach ($nav as $item)
                        <li><a href="{{ $item['href'] }}" class="block rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-slate-50">{{ $item['label'] }}</a></li>
                    @endforeach
                    <li><a href="{{ route('contact') }}" class="cta-gradient mt-1 block rounded-lg px-3 py-2 text-center text-sm font-semibold text-white">Get a quote</a></li>
                </ul>
            </nav>
        </details>
    </div>
</header>
