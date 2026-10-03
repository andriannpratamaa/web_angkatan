<?php

namespace App\Services;

use App\Models\Member;
use App\Models\StudentClass;
use App\Models\TimahPanasParticipant;
use App\Models\TimahPanasRequirement;
use Illuminate\Support\Collection;

class TimahPanasService
{
    public function index(bool $includeInactive = false): array
    {
        $requirements = TimahPanasRequirement::query()
            ->when(! $includeInactive, fn ($query) => $query->active())
            ->withCount('participants')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $totalTarget = (int) $requirements->sum('target');
        $totalFulfilled = (int) $requirements->sum(
            fn (TimahPanasRequirement $requirement) => min($requirement->fulfilled, $requirement->target)
        );

        return [
            'data' => $requirements,
            'summary' => [
                'total_requirements' => $requirements->count(),
                'fulfilled_requirements' => $requirements
                    ->filter(fn (TimahPanasRequirement $requirement) => $requirement->fulfilled >= $requirement->target)
                    ->count(),
                'total_participation' => (int) $requirements->sum('fulfilled'),
                'total_target' => $totalTarget,
                'overall_progress' => $totalTarget > 0
                    ? round($totalFulfilled / $totalTarget * 100, 1)
                    : 0.0,
            ],
            'class_contribution' => $this->classContribution(),
        ];
    }

    public function show(TimahPanasRequirement $requirement): array
    {
        $requirement->loadCount('participants');

        $participants = $requirement->participants()
            ->with('member:id,name,nrp,slug,role,photo,class_id,is_active', 'member.studentClass:id,name,code')
            ->orderBy('participation_date')
            ->orderBy('id')
            ->get();

        return [
            'data' => $requirement,
            'participants' => $participants,
        ];
    }

    /**
     * Add participants in bulk, skipping duplicates. Returns [created, skipped].
     */
    public function addParticipants(
        TimahPanasRequirement $requirement,
        array $memberIds,
        ?string $date = null,
        ?string $notes = null
    ): array {
        $existing = $requirement->participants()
            ->whereIn('member_id', $memberIds)
            ->pluck('member_id')
            ->all();

        $created = 0;
        $skipped = 0;

        foreach (array_unique($memberIds) as $memberId) {
            if (in_array($memberId, $existing, true)) {
                $skipped++;
                continue;
            }

            $requirement->participants()->create([
                'member_id' => $memberId,
                'participation_date' => $date,
                'notes' => $notes,
            ]);

            $created++;
        }

        return ['created' => $created, 'skipped' => $skipped];
    }

    public function classContribution(): Collection
    {
        $counts = TimahPanasParticipant::query()
            ->join('members', 'members.id', '=', 'timah_panas_participants.member_id')
            ->selectRaw('members.class_id, COUNT(*) as total')
            ->groupBy('members.class_id')
            ->pluck('total', 'class_id');

        return StudentClass::query()
            ->orderBy('code')
            ->get()
            ->map(fn (StudentClass $class) => [
                'id' => $class->id,
                'name' => $class->name,
                'code' => $class->code,
                'label' => $class->label,
                'total' => (int) ($counts[$class->id] ?? 0),
            ]);
    }

    public function candidateMembers(?int $classId = null): Collection
    {
        return Member::query()
            ->where('is_active', true)
            ->when($classId, fn ($query) => $query->where('class_id', $classId))
            ->with('studentClass:id,name,code')
            ->orderBy('nrp')
            ->get(['id', 'name', 'nrp', 'class_id', 'photo', 'role']);
    }
}
