<?php

use App\Http\Controllers\Admin\ContactInquiryController;
use App\Http\Controllers\Admin\PostController as AdminPostController;
use App\Http\Controllers\Admin\TeamMemberController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StaffController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/services', [PageController::class, 'services'])->name('services');
Route::get('/software', [PageController::class, 'software'])->name('software');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/contact', [ContactController::class, 'create'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{post:slug}', [BlogController::class, 'show'])->name('blog.show');

Route::get('/dashboard', fn () => redirect()->route('staff'))
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/staff', StaffController::class)->name('staff');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', fn () => redirect()->route('admin.posts.index'))->name('home');
    Route::resource('posts', AdminPostController::class)->except(['show']);
    Route::resource('team', TeamMemberController::class)->except(['show']);
    Route::get('inquiries', [ContactInquiryController::class, 'index'])->name('inquiries.index');
    Route::get('inquiries/{inquiry}', [ContactInquiryController::class, 'show'])->name('inquiries.show');
    Route::delete('inquiries/{inquiry}', [ContactInquiryController::class, 'destroy'])->name('inquiries.destroy');
});

require __DIR__.'/auth.php';
