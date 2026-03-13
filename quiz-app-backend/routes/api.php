<?php

use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\QuizController;
use App\Http\Controllers\api\QuizItemController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Protected routes (requires Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/user', [AuthController::class, 'user']);


    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']);
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update']);

    Route::post('/quizzes/{quiz}/items', [QuizItemController::class, 'store']);
    Route::get('/quizzes/{quiz}/items', [QuizItemController::class, 'index']);
});
