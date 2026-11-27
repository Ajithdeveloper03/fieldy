<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\EmployeePhotoService;
use Illuminate\Http\Request;

class EmployeePhotoController extends Controller
{
    public function show(Request $request, EmployeePhotoService $photos)
    {
        abort_unless($request->user()->role === 'employee' && $request->user()->status === 'active', 403);

        return $photos->response($request->user());
    }

    public function store(Request $request, EmployeePhotoService $photos)
    {
        abort_unless($request->user()->role === 'employee' && $request->user()->status === 'active', 403);
        $request->validate(['photo' => EmployeePhotoService::RULE]);

        return response()->json(['avatar_version' => $photos->replace($request->user(), $request->file('photo'))]);
    }
}
