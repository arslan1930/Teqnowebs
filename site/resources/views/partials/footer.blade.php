@php $c = config('teqnowebs.contact'); @endphp
<footer class="border-t border-line bg-slate-50">
    <div class="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
            <p class="font-display text-lg font-semibold">Teqnowebs</p>
            <p class="mt-3 max-w-xs text-sm leading-relaxed text-muted">
                Websites, design, SEO, link building, and custom business software.
            </p>
        </div>
        <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Explore</p>
            <ul class="mt-3 space-y-2 text-sm">
                <li><a class="text-ink-soft hover:text-accent" href="{{ route('services') }}">Services</a></li>
                <li><a class="text-ink-soft hover:text-accent" href="{{ route('software') }}">Software</a></li>
                <li><a class="text-ink-soft hover:text-accent" href="{{ route('blog.index') }}">Blog</a></li>
                <li><a class="text-ink-soft hover:text-accent" href="{{ route('about') }}">About</a></li>
                <li><a class="text-ink-soft hover:text-accent" href="{{ route('contact') }}">Contact</a></li>
            </ul>
        </div>
        <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Contact</p>
            <ul class="mt-3 space-y-2 text-sm text-ink-soft">
                <li><a class="hover:text-accent" href="mailto:{{ $c['email'] }}">{{ $c['email'] }}</a></li>
                <li><a class="hover:text-accent" href="{{ $c['phone_href'] }}">{{ $c['phone'] }}</a></li>
                <li>{{ $c['address'] }}</li>
                <li><a class="hover:text-accent" href="{{ $c['linkedin_href'] }}" target="_blank" rel="noopener">{{ $c['linkedin_label'] }}</a></li>
            </ul>
        </div>
    </div>
    <div class="border-t border-line">
        <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-muted sm:px-8">
            <p>&copy; {{ date('Y') }} Teqnowebs. All rights reserved.</p>
            @auth
                <a href="{{ route('staff') }}" class="hover:text-accent">Staff tools</a>
            @else
                <a href="{{ route('login') }}" class="hover:text-accent">Staff login</a>
            @endauth
        </div>
    </div>
</footer>
