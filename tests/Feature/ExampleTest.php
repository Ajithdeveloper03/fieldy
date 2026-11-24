<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_homepage_shows_the_public_landing_page(): void
    {
        $response = $this->get('/');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page->component('Landing'));
    }
}
