<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->text('question');
            $table->string('answer')->nullable();
            $table->json('options')->nullable();   // for multiple choice distractors
            $table->enum('type', ['multiple_choice', 'true_false', 'identification', 'essay', 'short_answer'])->default('multiple_choice');
            $table->integer('points')->default(1);
            $table->integer('order')->default(0);  // display order within a quiz
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_items');
    }
};
