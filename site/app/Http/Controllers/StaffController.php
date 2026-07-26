<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

class StaffController extends Controller
{
    public function __invoke(): View
    {
        return view('staff.index', [
            'tools' => [
                [
                    'name' => 'Attendance',
                    'url' => config('teqnowebs.tools.attendance'),
                    'blurb' => 'Staff check-in / check-out, leave, holidays, and admin timings.',
                    'note' => 'Office network for staff punches; admin login from anywhere.',
                ],
                [
                    'name' => 'Ops / Link Desk',
                    'url' => config('teqnowebs.tools.ops'),
                    'blurb' => 'Clients, link inventory, monthly P&L, and CSV import — replaces the Excel sheet.',
                    'note' => 'Use the Node/SQLite deploy for a shared team database.',
                ],
            ],
        ]);
    }
}
