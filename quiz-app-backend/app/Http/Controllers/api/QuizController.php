<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        try {
            $quizzes = $request->user()
                ->quizzes()
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Quizzes retrieved successfully.',
                'quizData' => $quizzes,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve quizzes. Please try again.',
            ], 500);
        }
    }
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title'       => 'required|string|max:255',
                'description' => 'nullable|string',
                'status'      => 'in:draft,published',
            ]);

            $quiz = Quiz::create([
                'user_id'     => $request->user()->id,
                'title'       => $validated['title'],
                'description' => $validated['description'] ?? null,
                'status'      => $validated['status'] ?? 'draft',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Quiz created successfully.',
                'quizData'    => $quiz,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create quiz. Please try again.',
                'quizData'    => null,
            ], 500);
        }
    }

    public function show(Request $request, Quiz $quiz)
    {
        $this->authorize('view', $quiz);

        return response()->json($quiz);
    }

    public function update(Request $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'in:draft,published',
        ]);

        $quiz->update($validated);

        return response()->json($quiz);
    }

    public function destroy(Request $request, Quiz $quiz)
    {
        $this->authorize('delete', $quiz);

        $quiz->delete();

        return response()->json(['message' => 'Quiz deleted.']);
    }
}
