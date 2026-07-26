<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TeqnowebsSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@teqnowebs.com'],
            [
                'name' => 'Teqnowebs Admin',
                'password' => Hash::make('teqnowebs123'),
                'is_admin' => true,
                'email_verified_at' => now(),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'staff@teqnowebs.com'],
            [
                'name' => 'Teqnowebs Staff',
                'password' => Hash::make('teqnowebs123'),
                'is_admin' => false,
                'email_verified_at' => now(),
            ],
        );

        if (! Post::where('slug', 'welcome-to-teqnowebs-blog')->exists()) {
            Post::create([
                'title' => 'Welcome to the Teqnowebs blog',
                'slug' => 'welcome-to-teqnowebs-blog',
                'excerpt' => 'A starter post so your blog is ready on day one. Publish and edit from the admin panel — no static rebuild required.',
                'body' => "Welcome to the Teqnowebs blog. This sample post ships with the site so /blog is never empty.\n\nHow publishing works\n\nAdd, edit, or delete posts in the Laravel admin at /admin. Changes go live immediately on Hostinger after save — no npm rebuild.",
                'published_at' => '2026-07-01 10:00:00',
            ]);
        }

        $roster = [
            ['M Arslan', 'Head of Technical Operations', 'leadership-tech', 'Leadership & Tech', 'team/m-arslan.jpg', 1],
            ['Shaharyar', 'Lead Web Developer', 'leadership-tech', 'Leadership & Tech', 'team/shaharyar.jpg', 2],
            ['Rehan Haider', 'AI Solutions Specialist', 'leadership-tech', 'Leadership & Tech', 'team/rehan-haider.jpg', 3],
            ['Umar Ul Zaman', 'Human Resources Manager', 'leadership-tech', 'Leadership & Tech', 'team/umar-ul-zaman.jpg', 4],
            ['Subhan Hameed', 'Outreach Manager', 'growth-outreach', 'Growth & Outreach', 'team/subhan-hameed.jpg', 5],
            ['Muhammad Zohaib', 'Partnerships Manager', 'growth-outreach', 'Growth & Outreach', 'team/muhammad-zohaib.jpg', 6],
            ['Faizan Raza', 'Communications Manager', 'growth-outreach', 'Growth & Outreach', 'team/faizan-raza.jpg', 7],
            ['Mahnoor Kanwal', 'Communications & Link Building Lead', 'content-seo', 'Content & SEO', 'team/mahnoor-kanwal.jpg', 8],
            ['Maleeha', 'SEO Link Building Specialist', 'content-seo', 'Content & SEO', 'team/maleeha.jpg', 9],
            ['Maneesa Mahin', 'SEO Link Building Specialist', 'content-seo', 'Content & SEO', 'team/maneesa-mahin.jpg', 10],
            ['Ayesha', 'Senior Content Strategist', 'content-seo', 'Content & SEO', 'team/ayesha.jpg', 11],
        ];

        if (TeamMember::count() === 0) {
            foreach ($roster as $row) {
                TeamMember::create([
                    'name' => $row[0],
                    'role' => $row[1],
                    'group_key' => $row[2],
                    'group_label' => $row[3],
                    'photo' => $row[4],
                    'sort_order' => $row[5],
                ]);
            }
        }
    }
}
