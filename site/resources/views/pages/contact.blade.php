@extends('layouts.site')
@section('title', 'Contact · Teqnowebs')
@section('meta_description', 'Get a quote from Teqnowebs for web, design, SEO, or custom software.')

@section('content')
<div class="pt-24">
    <section class="atmosphere relative overflow-hidden border-b border-line py-20 sm:py-28">
        <div class="pointer-events-none absolute inset-0 grid-overlay"></div>
        <div class="relative mx-auto max-w-6xl px-5 sm:px-8">
            <p class="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">Contact</p>
            <h1 class="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Tell us what you want to build.</h1>
            <p class="mt-5 max-w-xl text-lg text-muted">We reply {{ $contact['reply_time'] }}.</p>
        </div>
    </section>

    <section class="py-16 sm:py-20">
        <div class="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2">
            <div>
                @if (session('success'))
                    <p class="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{{ session('success') }}</p>
                @endif
                <form method="post" action="{{ route('contact.store') }}" class="space-y-4">
                    @csrf
                    <label class="block text-sm">Name
                        <input name="name" value="{{ old('name') }}" required class="mt-1 w-full rounded-lg border border-line px-4 py-3">
                    </label>
                    <label class="block text-sm">Email
                        <input type="email" name="email" value="{{ old('email') }}" required class="mt-1 w-full rounded-lg border border-line px-4 py-3">
                    </label>
                    <label class="block text-sm">Company
                        <input name="company" value="{{ old('company') }}" class="mt-1 w-full rounded-lg border border-line px-4 py-3">
                    </label>
                    <label class="block text-sm">Phone
                        <input name="phone" value="{{ old('phone') }}" class="mt-1 w-full rounded-lg border border-line px-4 py-3">
                    </label>
                    <label class="block text-sm">Interest
                        <select name="interest" class="mt-1 w-full rounded-lg border border-line px-4 py-3">
                            @foreach (['Website','UI/UX','SEO / Link building','Graphic design','Custom software','Other'] as $opt)
                                <option @selected(old('interest') === $opt)>{{ $opt }}</option>
                            @endforeach
                        </select>
                    </label>
                    <label class="block text-sm">Message
                        <textarea name="message" rows="5" required class="mt-1 w-full rounded-lg border border-line px-4 py-3">{{ old('message') }}</textarea>
                    </label>
                    @if ($errors->any())
                        <ul class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    @endif
                    <button type="submit" class="cta-gradient rounded-md px-6 py-3 text-sm font-semibold text-white">Send message</button>
                </form>
            </div>
            <aside class="card-soft h-fit rounded-2xl p-6">
                <h2 class="font-display text-xl font-semibold">Direct</h2>
                <ul class="mt-4 space-y-3 text-sm text-ink-soft">
                    <li><a class="hover:text-accent" href="mailto:{{ $contact['email'] }}">{{ $contact['email'] }}</a></li>
                    <li><a class="hover:text-accent" href="{{ $contact['phone_href'] }}">{{ $contact['phone'] }}</a></li>
                    <li>{{ $contact['address'] }}</li>
                    <li><a class="hover:text-accent" href="{{ $contact['linkedin_href'] }}" target="_blank" rel="noopener">{{ $contact['linkedin_label'] }}</a></li>
                </ul>
            </aside>
        </div>
    </section>
</div>
@endsection
