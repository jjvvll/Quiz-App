<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Response;
use App\Models\ResponseAnswer;
use Illuminate\Http\Request;

class ResponseController extends Controller
{
    public function show(string $token)
    {
        try {
            $quiz = Quiz::where('token', $token)
                ->where('status', 'published')
                ->with(['quizItems' => fn($q) => $q->orderBy('order')])
                ->firstOrFail();

            // strip answers before sending to frontend
            $items = $quiz->quizItems->map(fn($item) => [
                'id'         => $item->id,
                'question'   => $item->question,
                'type'       => $item->type,
                'options'    => $item->options,
                'points'     => $item->points,
                'time_limit' => $item->time_limit,
                'order'      => $item->order,
            ]);

            return response()->json([
                'success'  => true,
                'message'  => 'Quiz fetched successfully.',
                'quizData' => [
                    'id'          => $quiz->id,
                    'title'       => $quiz->title,
                    'description' => $quiz->description,
                    'items'       => $items,
                ],
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Quiz not found or not available.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load quiz.',
            ], 500);
        }
    }

    public function store(Request $request, string $token)
    {
        try {
            $quiz = Quiz::where('token', $token)
                ->where('status', 'published')
                ->with('quizItems')
                ->firstOrFail();

            $validated = $request->validate([
                'respondent_name'  => 'required|string|max:255',
                'respondent_email' => 'nullable|email',
                'time_taken'       => 'nullable|integer',
                'answers'          => 'required|array',
                'answers.*.quiz_item_id' => 'required|integer|exists:quiz_items,id',
                'answers.*.answer'       => 'nullable|string',
                'answers.*.time_taken'   => 'nullable|integer',
            ]);

            $response = Response::create([
                'quiz_id'          => $quiz->id,
                'respondent_name'  => $validated['respondent_name'],
                'respondent_email' => $validated['respondent_email'] ?? null,
                'time_taken'       => $validated['time_taken'] ?? null,
                'started_at'       => now()->subSeconds($validated['time_taken'] ?? 0),
                'completed_at'     => now(),
                'status'           => 'completed',
            ]);

            $score = 0;
            $totalPoints = 0;

            foreach ($validated['answers'] as $ans) {
                $item = $quiz->quizItems->find($ans['quiz_item_id']);
                if (!$item) continue;

                $isCorrect = null;
                $pointsAwarded = 0;
                $totalPoints += $item->points;

                if ($item->type !== 'essay') {
                    $isCorrect = strtolower(trim($ans['answer'] ?? '')) === strtolower(trim($item->answer ?? ''));
                    $pointsAwarded = $isCorrect ? $item->points : 0;
                    $score += $pointsAwarded;
                }

                ResponseAnswer::create([
                    'response_id'    => $response->id,
                    'quiz_item_id'   => $item->id,
                    'answer'         => $ans['answer'] ?? null,
                    'is_correct'     => $isCorrect,
                    'points_awarded' => $pointsAwarded,
                    'time_taken'     => $ans['time_taken'] ?? null,
                ]);
            }

            $percentage = $totalPoints > 0 ? round(($score / $totalPoints) * 100, 2) : 0;
            $response->update([
                'score'        => $score,
                'total_points' => $totalPoints,
                'percentage'   => $percentage,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Quiz submitted successfully.',
                'result'  => [
                    'score'        => $score,
                    'total_points' => $totalPoints,
                    'percentage'   => $percentage,
                ],
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
                'message' => 'Failed to submit quiz.',
            ], 500);
        }
    }
}
