@extends('layouts.site')
@section('title', 'Software · Teqnowebs')
@section('meta_description', 'Custom sales manager/CRM, finance management, invoicing, warehouse, and order tracking software from Teqnowebs.')

@section('content')
<div class="pt-24">
    <section class="atmosphere relative overflow-hidden border-b border-line py-20 sm:py-28">
        <div class="pointer-events-none absolute inset-0 grid-overlay"></div>
        <div class="relative mx-auto max-w-6xl px-5 sm:px-8">
            <p class="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">Software</p>
            <h1 class="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Custom systems for sales, finance, and operations.</h1>
            <p class="mt-5 max-w-2xl text-lg text-muted">Built around how your team actually works — not a bloated off-the-shelf suite you will ignore.</p>
        </div>
    </section>

    @foreach ([
        ['sales','01','Sales manager / CRM','Run the pipeline from first lead to closed deal — with clear owners, follow-ups, and targets.',['Lead capture and pipeline stages','Contact and company records','Quotes, proposals, and deal value','Task reminders and follow-up cadences','Team assignment and ownership','Targets, forecasts, and sales reporting','Notes and activity history per deal','Handoff into invoicing when you win'], false],
        ['finance','02','Finance management','Keep money visible — expenses, cashflow, and reports your finance team can trust.',['Income and expense tracking','Cashflow visibility by period','Charts of accounts tailored to you','Category budgets and alerts','Vendor and payer records','Export-ready financial reports','Role-based access for owners and finance','Works alongside invoicing and sales'], true],
        ['invoicing','03','Invoicing','Send professional invoices and keep payment status clear for finance and clients.',['Invoice creation and numbering','Payment status and reminders','Tax-ready records','Partial payments and balances','Client billing history in one view','PDF and shareable invoice links'], false],
        ['warehouse','04','Warehouse & collection','Know what you have, where it is, and what is ready for pickup or dispatch.',['Stock levels and locations','Collection and receiving workflows','Low-stock alerts','Simple ops dashboards for the floor','SKU and batch tracking basics','Handoff into order fulfillment'], true],
        ['tracking','05','Order tracking','Give your team — and your customers — a live path from order to delivery.',['Order status timelines','Customer-facing tracking links','Internal assignment and notes','Delivery and exception handling','Reports on cycle time and bottlenecks','Integrates with sales and warehouse modules'], false],
    ] as $m)
        <section id="{{ $m[0] }}" class="{{ $m[5] ? 'bg-mist/30' : 'bg-paper' }} border-b border-line py-16 sm:py-20">
            <div class="mx-auto max-w-6xl px-5 sm:px-8">
                <p class="text-xs font-semibold text-accent">{{ $m[1] }}</p>
                <h2 class="font-display mt-2 text-3xl font-semibold">{{ $m[2] }}</h2>
                <p class="mt-3 max-w-2xl text-muted">{{ $m[3] }}</p>
                <ul class="mt-8 grid gap-2 sm:grid-cols-2">
                    @foreach ($m[4] as $item)
                        <li class="rounded-lg border border-line bg-white px-4 py-3 text-sm">{{ $item }}</li>
                    @endforeach
                </ul>
            </div>
        </section>
    @endforeach

    <section class="band-soft py-16">
        <div class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 sm:px-8 md:flex-row md:items-center">
            <div>
                <h2 class="font-display text-2xl font-semibold">Need a module tailored to your workflow?</h2>
                <p class="mt-2 text-muted">Tell us what your team runs today — we will map the build.</p>
            </div>
            <a href="{{ route('contact') }}" class="cta-gradient rounded-md px-6 py-3.5 text-sm font-semibold text-white">Request a quote</a>
        </div>
    </section>
</div>
@endsection
