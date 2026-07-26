<?php

namespace App\Http\Controllers;

use App\Models\TeamMember;
use Illuminate\View\View;

class PageController extends Controller
{
    public function services(): View
    {
        return view('pages.services');
    }

    public function software(): View
    {
        return view('pages.software');
    }

    public function about(): View
    {
        $groups = TeamMember::query()
            ->orderBy('sort_order')
            ->get()
            ->groupBy('group_key');

        return view('pages.about', compact('groups'));
    }
}
