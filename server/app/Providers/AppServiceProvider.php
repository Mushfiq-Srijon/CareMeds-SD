<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        \Illuminate\Auth\Notifications\VerifyEmail::createUrlUsing(function ($notifiable) {
            $id = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());

            return url("/api/email/verify/{$id}/{$hash}");
        });
    }
}
