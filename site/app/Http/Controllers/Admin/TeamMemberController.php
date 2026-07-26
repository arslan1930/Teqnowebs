<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class TeamMemberController extends Controller
{
    public function index(): View
    {
        $members = TeamMember::orderBy('sort_order')->paginate(50);

        return view('admin.team.index', compact('members'));
    }

    public function create(): View
    {
        return view('admin.team.form', ['member' => new TeamMember]);
    }

    public function store(Request $request): RedirectResponse
    {
        TeamMember::create($this->validated($request));

        return redirect()->route('admin.team.index')->with('success', 'Team member added.');
    }

    public function edit(TeamMember $team): View
    {
        return view('admin.team.form', ['member' => $team]);
    }

    public function update(Request $request, TeamMember $team): RedirectResponse
    {
        $team->update($this->validated($request));

        return redirect()->route('admin.team.index')->with('success', 'Team member updated.');
    }

    public function destroy(TeamMember $team): RedirectResponse
    {
        $team->delete();

        return redirect()->route('admin.team.index')->with('success', 'Team member removed.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'role' => ['required', 'string', 'max:160'],
            'group_key' => ['required', 'string', 'max:80'],
            'group_label' => ['required', 'string', 'max:120'],
            'photo' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]) + ['sort_order' => (int) $request->input('sort_order', 0)];
    }
}
