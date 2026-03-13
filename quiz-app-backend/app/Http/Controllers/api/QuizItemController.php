<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizItem;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class QuizItemController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request, Quiz $quiz)
    {
        try {
            $this->authorize('view', $quiz);
            $items = $quiz->quizItems()->orderBy('order')->get();
            return response()->json([
                'success'  => true,
                'message'  => 'Quiz items retrieved successfully.',
                'quizData' => $items,
            ], 200);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view these questions.',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve questions. Please try again.',
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                '*.quiz_id'  => 'required|integer|exists:quizzes,id',
                '*.question' => 'required|string',
                '*.answer'   => 'nullable|string',
                '*.options'  => 'nullable|array',
                '*.type'     => 'required|in:multiple_choice,identification,essay',
                '*.points'   => 'required|integer|min:1',
                '*.order'    => 'required|integer|min:1',
            ]);

            $items = collect($validated)->map(
                fn($item) =>
                QuizItem::create($item)
            );

            return response()->json([
                'success'  => true,
                'message'  => 'Questions saved successfully.',
                'quizData' => $items,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save questions. Please try again.',
            ], 500);
        }
    }
}
