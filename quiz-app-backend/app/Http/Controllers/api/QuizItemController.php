<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizItem;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Validation\Rule;

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

    public function store(Request $request, Quiz $quiz)
    {
        try {
            $this->authorize('update', $quiz);
            $validated = $request->validate([
                '*.id'       => 'nullable|integer|exists:quiz_items,id',
                '*.quiz_id'  => 'required|integer|exists:quizzes,id',
                '*.question' => 'required|string',
                '*.answer'   => 'nullable|string',
                '*.options'  => 'nullable|array',
                '*.type'     => 'required|in:multiple_choice,identification,essay',
                '*.points'   => 'required|integer|min:1',
                '*.order'    => 'required|integer|min:1',
                '*.time_limit'    => 'nullable|integer|min:15',
            ]);

            $items = collect($validated)->map(function ($item) {
                $item['options'] = $item['options'] ?? [];

                if (isset($item['id']) && !empty($item['id'])) {
                    $quizItem = QuizItem::find($item['id']);
                    unset($item['id']);
                    $quizItem->update($item);
                    return $quizItem;
                } else {
                    unset($item['id']);
                    return QuizItem::create($item);
                }
            });

            return response()->json([
                'success'  => true,
                'message'  => 'Questions saved successfully.',
                'quizData' => $items,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.' . $e->errors(),
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to edit these questions.',
            ], 403);
        } catch (\Illuminate\Database\QueryException $e) { // 👈 catch DB errors specifically
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(), // 👈 returns the actual DB error
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save questions. Please try again.',
            ], 500);
        }
    }
}
