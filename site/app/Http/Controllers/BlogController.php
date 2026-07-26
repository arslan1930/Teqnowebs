<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\View\View;

class BlogController extends Controller
{
    public function index(): View
    {
        $posts = Post::published()->latest('published_at')->paginate(12);

        return view('blog.index', compact('posts'));
    }

    public function show(Post $post): View
    {
        if (! $post->published_at || $post->published_at->isFuture()) {
            abort(404);
        }

        return view('blog.show', compact('post'));
    }
}
