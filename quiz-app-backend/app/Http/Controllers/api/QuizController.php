<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class QuizController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Quiz::class); //
            $quizzes = $request->user()
                ->quizzes()
                ->latest()
                ->get();
            return response()->json([
                'success' => true,
                'message' => 'Quizzes retrieved successfully.',
                'quizData' => $quizzes,
            ], 200);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view quizzes.',
            ], 403);
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
            $this->authorize('create', Quiz::class); //
            $validated = $request->validate([
                'title'       => 'required|string|max:255',
                'description' => 'nullable|string',
                'status'      => 'in:draft,published',
            ]);
            $quiz = Quiz::create([
                'user_id'     => $request->user()->id,
                'token'   => $this->generateUniqueToken(),
                'title'       => $validated['title'],
                'description' => $validated['description'] ?? null,
                'status'      => $validated['status'] ?? 'draft',
            ]);
            return response()->json([
                'success'  => true,
                'message'  => 'Quiz created successfully.',
                'quizData' => $quiz,
            ], 201);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to create a quiz.',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create quiz. Please try again.',
            ], 500);
        }
    }

    public function show(Request $request, Quiz $quiz)
    {
        try {
            $this->authorize('view', $quiz); // already there
            return response()->json([
                'success'  => true,
                'message'  => 'Quiz retrieved successfully.',
                'quizData' => $quiz,
            ], 200);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view this quiz.',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve quiz. Please try again.',
            ], 500);
        }
    }

    public function update(Request $request, Quiz $quiz)
    {
        try {
            $this->authorize('update', $quiz);
            $validated = $request->validate([
                'title'       => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'sometimes|in:draft,published,closed'
            ]);

            $validated['token'] = $quiz->token ?? $this->generateUniqueToken();

            $quiz->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Quiz edited successfully.',
                'quizData' => $quiz,
            ], 200);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to edit this quiz.',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to edit quiz. Please try again.',
            ], 500);
        }
    }

    public function destroy(Request $request, Quiz $quiz)
    {
        try {
            $this->authorize('delete', $quiz);
            $quiz->delete();
            return response()->json([
                'success' => true,
                'message' => 'Quiz deleted successfully.',
            ], 200);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to delete this quiz.',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete quiz. Please try again.',
            ], 500);
        }
    }
    private function generateUniqueToken(): string
    {
        do {
            $token = Str::random(12);
        } while (Quiz::where('token', $token)->exists());

        return $token;
    }
}
